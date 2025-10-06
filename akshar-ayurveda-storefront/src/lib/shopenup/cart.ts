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
  getCompleteHeaders,
  removeCartId,
  setAuthToken,
  clearAllCartData
} from "@lib/shopenup/cookies"
import { getRegion } from "@lib/shopenup/regions"
import { addressesFormSchema } from "hooks/cart"

// Client-side compatible revalidation function
const revalidateTag = (_tag: string) => {
  // In client-side context, we'll trigger a page refresh or use other methods
  if (typeof window !== 'undefined') {
    // Optionally trigger a page refresh or use other client-side cache invalidation
  }
}

// Client-side compatible redirect function

export async function retrieveCart() {
  // First, check if user is logged in
  const authHeaders = await getAuthHeaders()
  const isLoggedIn = 'authorization' in authHeaders && authHeaders.authorization


  if (isLoggedIn) {
    // User is logged in - get cart ID from local storage
    const cartId = await getCartId()

    if (cartId) {
      // Try to fetch cart using stored cart ID
      const completeHeaders = await getCompleteHeaders()
      const cart = await sdk.client
        .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cartId}`, {
          headers: completeHeaders,
          cache: "no-store",
        })
        .then(({ cart }) => cart)
        .catch((error) => {
          console.error('🛒 Error fetching cart by ID:', error)
          return null
        })

      if (cart) {
        if (cart?.items && cart.items.length && cart.region_id) {
          cart.items = await enrichLineItems(cart.items, cart.region_id)
        }
        
        return cart
      }
    }

    // No cart found in storage - return null (cart will be created when user adds item)
    return null
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
      headers: { ...(await getCompleteHeaders()) },
      cache: "no-store",
    })
    .then(({ cart }) => {
      return cart
    })
    .catch((error) => {
      console.error('🛒 Error fetching cart by ID:', error)
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
        
        const completeHeaders = await getCompleteHeaders()
        const cartResp = await sdk.store.cart.create(
          { region_id: region.id },
          {},
          completeHeaders
        )
        cart = cartResp.cart
        await setCartId(cart.id)
        
        // Store the cart ID in customer metadata for persistence across sessions
        try {
          const { storeCartInCustomerMetadata } = await import('./cart-sync')
          await storeCartInCustomerMetadata(cart.id)
        } catch (error) {
          console.warn('🛒 getOrSetCart - failed to store cart ID in customer metadata:', error)
        }
        
        revalidateTag("cart")
      } else if (cart.region_id !== (await getRegion(countryCode))?.id) {
        // Update region if different
        const region = await getRegion(countryCode)
        if (region) {
          await sdk.store.cart.update(
            cart.id,
            { region_id: region.id },
            {},
            await getCompleteHeaders()
          )
          revalidateTag("cart")
        }
      }
      
      return cart
    } catch (error) {
      console.error('🛒 getOrSetCart - error in logged-in flow:', error)
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
      await getCompleteHeaders()
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
      await getCompleteHeaders()
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
    .update(cartId, data, {}, await getCompleteHeaders())
    .then(({ cart }) => {
      revalidateTag("cart")
      return cart
    })
    .catch((error) => {
      return shopenupError(error)
    })
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
        await getCompleteHeaders()
      )
    
    revalidateTag("cart")
    
    // No need to verify by fetching cart again - the createLineItem call is sufficient
    // This prevents unnecessary API calls that were causing duplicate cart fetches
    
  } catch (error) {
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
      .updateLineItem(cartId, lineId, { quantity }, {}, await getCompleteHeaders())
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
    .deleteLineItem(cartId, lineId, await getCompleteHeaders())
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
      await getCompleteHeaders()
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
  
  const cart = await retrieveCart()

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
        await getCompleteHeaders()
      )
    
    revalidateTag("cart")
    return response
  } catch (error) {
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

    
    const countryCode = z.string().min(2).safeParse(country_code)
    if (!countryCode.success) {
      return { success: false, error: "Invalid country code" }
    }

    await updateCart({ email })

    return { success: true, error: null }
  } catch (e) {
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
    // Ensure all fields are strings, not null
    const sanitizeAddress = (address: Record<string, unknown>): HttpTypes.StoreAddAddress => ({
      first_name: String(address.first_name || ""),
      last_name: String(address.last_name || ""),
      company: String(address.company || ""),
      address_1: String(address.address_1 || ""),
      address_2: String(address.address_2 || ""),
      city: String(address.city || ""),
      postal_code: String(address.postal_code || ""),
      province: String(address.province || ""),
      country_code: String(address.country_code || ""),
      phone: String(address.phone || ""),
    })
    const updateData = {
      shipping_address: sanitizeAddress(formData.shipping_address),
      billing_address: sanitizeAddress(
        formData.same_as_billing === "on"
          ? formData.shipping_address
          : formData.billing_address
      ),
    }
    await updateCart(updateData)
    revalidateTag("shipping")
    return { success: true, error: null }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not set addresses",
    }
  }
}

export async function clearCheckoutData() {
  try {
    const cartId = await getCartId()
    if (!cartId) {
      return { success: true, error: null }
    }

    // Clear addresses by setting them to empty values
    await updateCart({
      shipping_address: {
        first_name: "",
        last_name: "",
        company: "",
        address_1: "",
        address_2: "",
        city: "",
        postal_code: "",
        province: "",
        country_code: "",
        phone: "",
      },
      billing_address: {
        first_name: "",
        last_name: "",
        company: "",
        address_1: "",
        address_2: "",
        city: "",
        postal_code: "",
        province: "",
        country_code: "",
        phone: "",
      },
    })

    // Clear email
    await updateCart({ email: "" })

    // Clear promo codes
    await updateCart({ promo_codes: [] })

    revalidateTag("cart")
    revalidateTag("shipping")
    revalidateTag("payment")
    
    return { success: true, error: null }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not clear checkout data",
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

  // Clean up cart by removing items with invalid variants
  if (cart.items && cart.items.length > 0) {
    const invalidItems = cart.items.filter(item => 
      !item.variant || !item.variant.id || !item.variant.product_id
    )
    
    if (invalidItems.length > 0) {
      
      // Remove invalid items
      for (const item of invalidItems) {
        try {
          await sdk.store.cart
            .deleteLineItem(cart.id, item.id)
        } catch {
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


  try {
    // Preserve auth token before cart completion
    const authHeadersBeforeComplete = await getAuthHeaders()
    const authToken = 'authorization' in authHeadersBeforeComplete ? authHeadersBeforeComplete.authorization.replace('Bearer ', '') : null
    
    // Backup auth token to localStorage as additional safety
    if (authToken && typeof window !== 'undefined') {
      localStorage.setItem('_shopenup_jwt_backup', authToken)
    }
    
    // Add a small delay to show loading state
    if (typeof window !== 'undefined') {
      // Dispatch custom event to show loading progress
      window.dispatchEvent(new CustomEvent('order-processing', { 
        detail: { step: 'Completing your order...' } 
      }))
    }
    
    const cartRes = await sdk.store.cart
      .complete(cartId, {}, await getCompleteHeaders())
      .then(async (cartRes) => {
        
        // Dispatch event to show completion progress
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('order-processing', { 
            detail: { step: 'Order completed successfully!' } 
          }))
        }
        
        // // Restore auth token if it was cleared by backend (non-blocking)
        // if (authToken) {
        //   // Use requestAnimationFrame to ensure this doesn't block navigation
        //   requestAnimationFrame(async () => {
        //     const authHeadersAfterComplete = await getAuthHeaders()
        //     if (!('authorization' in authHeadersAfterComplete) || !authHeadersAfterComplete.authorization) {
        //       await setAuthToken(authToken)
        //       // Clean up backup token
        //       if (typeof window !== 'undefined') {
        //         localStorage.removeItem('_shopenup_jwt_backup')
        //       }
        //     }
        //   })
        // }
        
        revalidateTag("cart")
        revalidateTag("orders")
        return cartRes
      })

    if (cartRes?.type === "order") {
      await clearAllCartData()
      return cartRes
    } else if (cartRes?.type === "cart") {
      if (cartRes.cart.payment_collection?.payment_sessions) {
        const failedSessions = cartRes.cart.payment_collection.payment_sessions.filter(
          (session: any) => session.status === 'error' || !session.data || Object.keys(session.data).length === 0
        )
        if (failedSessions.length > 0) {
          throw new Error('Payment sessions failed. Please try again with a different payment method.')
        }
      }
      
      throw new Error('Order completion failed. Cart was not converted to order. Please check payment status.')
    } else {
      throw new Error('Unexpected response from order completion')
    }

  } catch (error: any) {
    
    // Handle inventory error specifically
    if (error instanceof Error && error.message && error.message.includes('not stocked at location')) {
      throw new Error('Order completion failed due to inventory configuration. Please contact support or try again later.')
    }
    
    throw shopenupError(error)
  }
}

/**
 * Updates the countryCode param and revalidate the regions cache
 * @param countryCode
 * @param currentPath
 * @param redirectCallback Optional callback function to handle redirection
 */
export async function updateRegion(
  countryCode: string, 
  currentPath: string, 
  redirectCallback?: (url: string) => void
) {
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

  const redirectUrl = `/${countryCode}${currentPath}`
  
  // If redirect callback is provided, use it for client-side navigation
  if (redirectCallback) {
    redirectCallback(redirectUrl)
  } else {
    // Use Next.js router for client-side navigation without page reload
    if (typeof window !== 'undefined') {
      // Dynamic import to avoid SSR issues
      import('next/router').then(({ default: router }) => {
        router.push(redirectUrl)
      }).catch(() => {
        // Fallback to history API if Next.js router is not available
        window.history.pushState({}, '', redirectUrl)
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
    }
  }
}