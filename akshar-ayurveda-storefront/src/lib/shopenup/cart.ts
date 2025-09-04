import { HttpTypes } from "@shopenup/types"
import { z } from "zod"
import { PaymentMethod } from "@stripe/stripe-js"

import { sdk } from "@lib/config"
import shopenupError from "@lib/util/shopenup-error"
import { enrichLineItems } from "@lib/util/enrich-line-items"
import {
  getCartId,
  getAuthHeaders,
  setCartId,
  removeCartId,
  clearAllCartData,
} from "@lib/shopenup/cookies"
import { getRegion } from "@lib/shopenup/regions"
import { addressesFormSchema } from "hooks/cart"

// Client-side compatible revalidation function
const revalidateTag = (tag: string) => {
  // In client-side context, we'll trigger a page refresh or use other methods
  if (typeof window !== 'undefined') {
    // Optionally trigger a page refresh or use other client-side cache invalidation
    console.log(`Revalidating tag: ${tag}`)
  }
}

// Client-side compatible redirect function
const redirect = (url: string) => {
  if (typeof window !== 'undefined') {
    window.location.href = url
  }
}

export async function retrieveCart() {
  // First, check if user is logged in
  const authHeaders = await getAuthHeaders()
  const isLoggedIn = 'authorization' in authHeaders && authHeaders.authorization

  if (isLoggedIn) {
    // User is logged in - fetch customer's cart directly
    try {
      // Get customer data to ensure we have a valid session
      const customer = await sdk.client
        .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
          headers: authHeaders,
          cache: "no-store",
        })
        .then(({ customer }) => customer)
        .catch((error) => {
          console.error('❌ Error fetching customer:', error)
          return null
        })

      if (!customer) {
        return await retrieveCartById()
      }

      // Try to get cart ID from storage first
      const cartId = await getCartId()

      if (cartId) {
        // Try to fetch cart using stored cart ID
        const cart = await sdk.client
          .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cartId}`, {
            headers: authHeaders,
            cache: "no-store",
          })
          .then(({ cart }) => cart)
          .catch((error) => {
            console.error('❌ Error fetching cart by ID:', error)
            return null
          })

        if (cart) {
          if (cart?.items && cart.items.length && cart.region_id) {
            cart.items = await enrichLineItems(cart.items, cart.region_id)
          }
          
          return cart
        }
      }

      // If no cart found, try to get customer's active cart
      const customerCarts = await sdk.client
        .fetch<{ carts: HttpTypes.StoreCart[] }>(`/store/customers/me/carts`, {
          headers: authHeaders,
          cache: "no-store",
        })
        .then(({ carts }) => carts)
        .catch((error) => {
          console.error('❌ Error fetching customer carts:', error)
          return []
        })

      // Find the most recent active cart
      const activeCart = customerCarts.find(cart => 
        cart.items && cart.items.length > 0
      )

      if (activeCart) {
        // Update cart ID in storage
        await setCartId(activeCart.id)
        
        if (activeCart?.items && activeCart.items.length && activeCart.region_id) {
          activeCart.items = await enrichLineItems(activeCart.items, activeCart.region_id)
        }
        
        return activeCart
      }

      return null

    } catch (error) {
      console.error('❌ Error fetching customer cart:', error)
      // Fall back to cart ID approach
      return await retrieveCartById()
    }
  }

  // User is not logged in - use cart ID approach
  return await retrieveCartById()
}

// Helper function to retrieve cart by ID (for guest users)
async function retrieveCartById() {
  const cartId = await getCartId()

  if (!cartId) {
    return null
  }
  
  const cart = await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cartId}`, {
      next: { tags: ["cart"] },
      headers: { ...(await getAuthHeaders()) },
      cache: "no-store",
    })
    .then(({ cart }) => {
      return cart
    })
    .catch((error) => {
      console.error('❌ Error fetching cart by ID:', error)
      return null
    })

  if (cart?.items && cart.items.length && cart.region_id) {
    cart.items = await enrichLineItems(cart.items, cart.region_id)
  }
  return cart
}

export async function getCartQuantity() {
  const cart = await retrieveCart()

  if (!cart || !cart.items || !cart.items.length) {
    return 0
  }

  return cart.items.reduce((acc, item) => acc + item.quantity, 0)
}

export async function getOrSetCart(input: unknown) {
  if (typeof input !== "string") {
    throw new Error("Invalid input when retrieving cart")
  }

  const countryCode = input

  // First, check if user is logged in
  const authHeaders = await getAuthHeaders()
  const isLoggedIn = 'authorization' in authHeaders && authHeaders.authorization

  if (isLoggedIn) {
    // User is logged in - get or create customer cart
    try {
      
      // Try to get existing customer cart
      let cart = await retrieveCart()
      
      if (!cart) {
        // Create a new cart for the customer
        const region = await getRegion(countryCode)
        if (!region) {
          throw new Error(`Region not found for country code: ${countryCode}`)
        }
        
        const cartResp = await sdk.store.cart.create(
          { region_id: region.id },
          {},
          authHeaders
        )
        cart = cartResp.cart
        await setCartId(cart.id)
        revalidateTag("cart")
      } else if (cart.region_id !== (await getRegion(countryCode))?.id) {
        // Update region if different
        const region = await getRegion(countryCode)
        if (region) {
          await sdk.store.cart.update(
            cart.id,
            { region_id: region.id },
            {},
            authHeaders
          )
          revalidateTag("cart")
        }
      }
      
      return cart
    } catch (error) {
      console.error('❌ Error with customer cart, falling back to guest cart:', error)
      // Fall back to guest cart approach
    }
  }

  // User is not logged in - use guest cart approach
  let cart = await retrieveCart()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      await getAuthHeaders()
    )
    cart = cartResp.cart

    await setCartId(cart.id)
    revalidateTag("cart")
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(
      cart.id,
      { region_id: region.id },
      {},
      await getAuthHeaders()
    )
    revalidateTag("cart")
  }

  return cart
}

async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  return sdk.store.cart
    .update(cartId, data, {}, await getAuthHeaders())
    .then(({ cart }) => {
      revalidateTag("cart")
      return cart
    })
    .catch(shopenupError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: unknown
  quantity: unknown
  countryCode: unknown
}) {

  if (typeof variantId !== "string") {
    throw new Error("Missing variant ID when adding to cart")
  }

  if (!variantId || variantId.trim() === '') {
    throw new Error("Invalid variant ID: cannot be empty")
  }

  if (
    typeof quantity !== "number" ||
    quantity < 1 ||
    !Number.isSafeInteger(quantity)
  ) {
    throw new Error("Missing quantity when adding to cart")
  }

  if (typeof countryCode !== "string") {
    throw new Error("Missing country code when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)
  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }


  try {
    await sdk.store.cart
      .createLineItem(
        cart.id,
        {
          variant_id: variantId,
          quantity,
        },
        {},
        await getAuthHeaders()
      )
    
    revalidateTag("cart")
    
    // Verify the item was added by fetching the cart again
    const updatedCart = await sdk.client
      .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cart.id}`, {
        headers: { ...(await getAuthHeaders()) },
        cache: "no-store",
      })
      .then(({ cart }) => cart)
      .catch((error) => {
        console.error('❌ Error verifying cart after adding item:', error)
        return null
      })
    
    if (updatedCart) {
        console.log('✅ Cart verification - Items after adding:', updatedCart.items?.length || 0)
    }
    
  } catch (error) {
    console.error('❌ Error adding line item:', error)
    shopenupError(error)
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: unknown
  quantity: unknown
}) {
  if (typeof lineId !== "string") {
    throw new Error("Missing lineItem ID when updating line item")
  }

  if (
    typeof quantity !== "number" ||
    quantity < 1 ||
    !Number.isSafeInteger(quantity)
  ) {
    throw new Error("Missing quantity when updating line item")
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, await getAuthHeaders())
    .then(() => {
      revalidateTag("cart")
    })
    .catch(shopenupError)
}

export async function deleteLineItem(lineId: unknown) {
  if (typeof lineId !== "string") {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, await getAuthHeaders())
    .then(() => {
      revalidateTag("cart")
    })
    .catch(shopenupError)
  revalidateTag("cart")
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: unknown
  shippingMethodId: unknown
}) {
  if (typeof cartId !== "string") {
    throw new Error("Missing cart ID when setting shipping method")
  }

  if (typeof shippingMethodId !== "string") {
    throw new Error("Missing shipping method ID when setting shipping method")
  }

  return sdk.store.cart
    .addShippingMethod(
      cartId,
      { option_id: shippingMethodId },
      {},
      await getAuthHeaders()
    )
    .then(() => {
      revalidateTag("cart")
    })
    .catch(shopenupError)
}

export async function setPaymentMethod(
  session_id: string,
  token: string | null | undefined
) {
  await sdk.client
    .fetch("/store/custom/stripe/set-payment-method", {
      method: "POST",
      body: { session_id, token },
    })
    .then((resp) => {
      revalidateTag("cart")
      return resp
    })
    .catch(shopenupError)
}

export async function getPaymentMethod(id: string) {
  return await sdk.client
    .fetch<PaymentMethod>(`/store/custom/stripe/get-payment-method/${id}`)
    .then((resp: PaymentMethod) => {
      return resp
    })
    .catch(shopenupError)
}

export async function initiatePaymentSession(provider_id: unknown) {
  console.log("🚀 Initiating payment session with provider:", provider_id)
  
  const cart = await retrieveCart()
  console.log("📦 Retrieved cart:", cart?.id)

  if (!cart) {
    throw new Error("Can't initiate payment without cart")
  }

  // Validate cart has required fields for payment
  if (!cart.email) {
    throw new Error("Cart must have email before initiating payment")
  }
  
  if (!cart.shipping_address || !cart.billing_address) {
    throw new Error("Cart must have shipping and billing addresses before initiating payment")
  }
  
  if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
    throw new Error("Cart must have shipping method selected before initiating payment")
  }

  if (typeof provider_id !== "string") {
    throw new Error("Invalid payment provider")
  }

  try {
    const response = await sdk.store.payment
      .initiatePaymentSession(
        cart,
        {
          provider_id,
        },
        {},
        await getAuthHeaders()
      )
    
    console.log("✅ Payment session initiated successfully:", response)
    revalidateTag("cart")
    return response
  } catch (error) {
    console.error("❌ Payment session initiation failed:", error)
    throw shopenupError(error)
  }
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No existing cart found")
  }

  await updateCart({ promo_codes: codes })
    .then(() => {
      revalidateTag("cart")
    })
    .catch(shopenupError)
}

export async function setEmail({
  email,
  country_code,
}: {
  email: string
  country_code: string
}) {
  try {
    const cartId = await getCartId()
    if (!cartId) {
      return {
        success: false,
        error: "No existing cart found when setting email",
      }
    }

    console.log("🔍 Setting email for cart:", cartId)
    console.log("🔍 Country code:", country_code)
    
    const countryCode = z.string().min(2).safeParse(country_code)
    if (!countryCode.success) {
      return { success: false, error: "Invalid country code" }
    }

    await updateCart({ email })
    console.log("✅ Email set successfully")

    return { success: true, error: null }
  } catch (e) {
    console.error("❌ Error setting email:", e)
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not set email",
    }
  }
}

export async function setAddresses(
  formData: z.infer<typeof addressesFormSchema>
) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    await updateCart({
      shipping_address: formData.shipping_address,
      billing_address:
        formData.same_as_billing === "on"
          ? formData.shipping_address
          : formData.billing_address,
    })
    revalidateTag("shipping")
    return { success: true, error: null }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not set addresses",
    }
  }
}

export async function placeOrder() {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No existing cart found when placing an order")
  }

  // First, retrieve the cart to validate it has all required fields
  const cart = await retrieveCart()
  if (!cart) {
    throw new Error("Could not retrieve cart for order placement")
  }

  // Debug: Log cart details for shipping validation
  console.log('🔍 Cart details for order placement:', {
    cartId: cart.id,
    items: cart.items?.map(item => ({
      id: item.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      title: item.title,
      variant: item.variant ? {
        id: item.variant.id,
        title: item.variant.title,
        product_id: item.variant.product_id
      } : null
    })),
    shipping_methods: cart.shipping_methods,
    shipping_address: cart.shipping_address,
    email: cart.email,
    payment_collection: cart.payment_collection?.id
  })

  // Clean up cart by removing items with invalid variants
  if (cart.items && cart.items.length > 0) {
    const invalidItems = cart.items.filter(item => 
      !item.variant || !item.variant.id || !item.variant.product_id
    )
    
    if (invalidItems.length > 0) {
      console.log('⚠️ Found invalid items in cart, removing them:', invalidItems)
      
      // Remove invalid items
      for (const item of invalidItems) {
        try {
          await sdk.store.cart
            .deleteLineItem(cart.id, item.id)
          console.log(`✅ Removed invalid item: ${item.id}`)
        } catch (error) {
          console.error(`❌ Failed to remove invalid item ${item.id}:`, error)
        }
      }
      
      // Revalidate cart after cleanup
      revalidateTag("cart")
      
      // Check if cart is now empty
      const updatedCart = await retrieveCart()
      if (!updatedCart || !updatedCart.items || updatedCart.items.length === 0) {
        throw new Error("Cart is empty after removing invalid items. Please add valid products to your cart.")
      }
    }
  }

  // Validate required fields before placing order
  if (!cart.email) {
    throw new Error("Email is required to place an order")
  }

  if (!cart.shipping_address?.address_1) {
    throw new Error("Shipping address is required to place an order")
  }

  if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
    throw new Error("Shipping method is required to place an order")
  }

  if (!cart.payment_collection) {
    throw new Error("Payment method is required to place an order")
  }

  if (!cart.items || cart.items.length === 0) {
    throw new Error("Cart must contain items to place an order")
  }

  // Validate that all cart items have required fields
  for (const item of cart.items) {
    if (!item.variant_id) {
      throw new Error("All cart items must have a valid variant ID")
    }
    if (!item.quantity || item.quantity <= 0) {
      throw new Error("All cart items must have a valid quantity")
    }
    if (!item.variant || !item.variant.id) {
      throw new Error(`Cart item ${item.id} is missing variant data`)
    }
    if (!item.variant.product_id) {
      throw new Error(`Cart item ${item.id} variant is missing product ID`)
    }
  }

  console.log('🛒 Placing order with cart ID:', cartId)
  console.log('🛒 Cart validation passed, proceeding with order completion')

  try {
    const cartRes = await sdk.store.cart
      .complete(cartId, {}, await getAuthHeaders())
      .then((cartRes) => {
        console.log('✅ Order completed successfully:', cartRes)
        revalidateTag("cart")
        revalidateTag("orders")
        return cartRes
      })

    if (cartRes?.type === "order") {
      await clearAllCartData()
      console.log('✅ Cart data cleared after successful order placement')
    }

    return cartRes
  } catch (error: any) {
    console.error('❌ Error completing order:', error)
    
    // Handle inventory error specifically
    if (error.message && error.message.includes('not stocked at location')) {
      console.log('⚠️ Inventory error detected - this is a backend configuration issue')
      throw new Error('Order completion failed due to inventory configuration. Please contact support or try again later.')
    }
    
    throw shopenupError(error)
  }
}

/**
 * Updates the countryCode param and revalidate the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  if (typeof countryCode !== "string") {
    throw new Error("Invalid country code")
  }

  if (typeof currentPath !== "string") {
    throw new Error("Invalid current path")
  }

  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    revalidateTag("cart")
  }

  revalidateTag("regions")
  revalidateTag("products")

  redirect(`/${countryCode}${currentPath}`)
}
  