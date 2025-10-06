import { HttpTypes } from "@shopenup/types"
import { sdk } from "@lib/config"
import { getAuthHeaders, getCompleteHeaders, setCartId, removeCartId, getCartId } from "@lib/shopenup/cookies"
import { enrichLineItems } from "@lib/util/enrich-line-items"

/**
 * Cart synchronization service for handling cross-device cart management
 * 
 * Flow:
 * 1. User registers → No cart
 * 2. User logs in → Check metadata for cart ID
 * 3. User adds item → Create cart, save to metadata + local storage
 * 4. User logs out → Clear local storage + cookies
 * 5. User logs in again → Get cart ID from metadata, set in local storage
 */

/**
 * Stores cart ID in customer metadata for persistence across sessions
 */
export async function storeCartInCustomerMetadata(cartId: string): Promise<void> {
  try {
    const completeHeaders = await getCompleteHeaders()
    
    await sdk.client.fetch(`/store/customers/me`, {
      method: "POST",
      headers: completeHeaders,
      body: {
        metadata: {
          active_cart_id: cartId,
          cart_created_at: new Date().toISOString()
        }
      }
    })
    
  } catch (error) {
    console.error('Error storing cart in customer metadata:', error)
  }
}

/**
 * Gets cart ID from customer metadata
 */
export async function getCartIdFromCustomerMetadata(): Promise<string | null> {
  try {
    const completeHeaders = await getCompleteHeaders()
    
    const customer = await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        headers: completeHeaders,
        cache: "no-store",
      })
      .then(({ customer }) => customer)
      .catch(() => null)

    if (!customer) {
      return null
    }

    const cartId = customer.metadata?.active_cart_id as string
    return cartId || null
  } catch (error) {
    console.error('Error getting cart ID from customer metadata:', error)
    return null
  }
}

/**
 * Removes cart ID from customer metadata
 */
export async function removeCartFromCustomerMetadata(): Promise<void> {
  try {
    const getCookie = (name: string) => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };
    const customerToken = getCookie('_shopenup_jwt');
    const completeHeaders = await getCompleteHeaders()
    if(customerToken){
        await sdk.client.fetch(`/store/customers/me`, {
          method: "POST",
          headers: completeHeaders,
          body: {
            metadata: {
              active_cart_id: null,
              cart_created_at: null
            }
          }
        })
    }
    
  } catch (error) {
    console.error('Error removing cart from customer metadata:', error)
  }
}

/**
 * Synchronizes cart on login
 * Flow: Get cart ID from customer metadata → Set in local storage → Load cart
 */
export async function syncCartOnLogin(): Promise<{
  success: boolean
  cart: HttpTypes.StoreCart | null
  message?: string
}> {
  try {
    // Get cart ID from customer metadata
    const cartId = await getCartIdFromCustomerMetadata()
    
    if (cartId) {
      // Set cart ID in local storage and cookies
      await setCartId(cartId)
      
      // Load the cart
      const completeHeaders = await getCompleteHeaders()
      const cart = await sdk.client
        .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cartId}`, {
          headers: completeHeaders,
          cache: "no-store",
        })
        .then(({ cart }) => cart)
        .catch(() => null)

      if (cart) {
        // Enrich line items if cart has items
        if (cart?.items && cart.items.length && cart.region_id) {
          cart.items = await enrichLineItems(cart.items, cart.region_id)
        }
        
        return {
          success: true,
          cart: cart,
          message: 'Customer cart loaded from metadata'
        }
      } else {
        await removeCartFromCustomerMetadata()
      }
    }

    // No cart found in metadata
    return {
      success: true,
      cart: null,
      message: 'No existing cart found - will create when needed'
    }
  } catch (error) {
    console.error('Error syncing cart on login:', error)
    return {
      success: false,
      cart: null,
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Clears cart data on logout
 * This removes the cart ID from storage and customer metadata
 */
export async function clearCartOnLogout(): Promise<void> {
  try {
    // Remove cart ID from local storage and cookies
    await removeCartId()
    
    // Remove cart ID from customer metadata
    await removeCartFromCustomerMetadata()
    
  } catch (error) {
    console.error('Error clearing cart on logout:', error)
  }
}

/**
 * Clears cart data after order completion
 * This removes the cart ID from storage and customer metadata so user gets fresh cart
 */
export async function clearCartAfterOrder(): Promise<void> {
  try {
    // Remove cart ID from local storage and cookies
    await removeCartId()
    
    // Remove cart ID from customer metadata
    await removeCartFromCustomerMetadata()
    
  } catch (error) {
    console.error('Error clearing cart after order:', error)
  }
}

/**
 * Gets the current cart ID from storage
 */
export async function getCurrentCartId(): Promise<string | null> {
  const cartId = await getCartId()
  return cartId ? cartId : null
}

/**
 * Sets the cart ID in storage
 */
export async function setCurrentCartId(cartId: string): Promise<void> {
  await setCartId(cartId)
}
