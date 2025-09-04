// Client-side compatible cookie handling for Pages Router
import Cookies from 'js-cookie'

export const getAuthHeaders = async (): Promise<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  { authorization: string } | {}
> => {
  const token = Cookies.get("_shopenup_jwt")

  if (token) {
    return { authorization: `Bearer ${token}` }
  }

  return {}
}

export const setAuthToken = async (token: string) => {
  Cookies.set("_shopenup_jwt", token, {
    expires: 7, // 7 days
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  Cookies.remove("_shopenup_jwt")
}

export const getCartId = async () => {
  // Try cookies first
  let cartId = Cookies.get("_shopenup_cart_id")
  
  // If not in cookies, try localStorage as fallback
  if (!cartId && typeof window !== 'undefined') {
    const localStorageCartId = localStorage.getItem('_shopenup_cart_id')
    
    // If found in localStorage, restore to cookies
    if (localStorageCartId) {
      await setCartId(localStorageCartId)
      cartId = localStorageCartId
    }
  }
  
  return cartId
}

export const setCartId = async (cartId: string) => {
  const cookieOptions = {
    expires: 7, // 7 days
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax" as "strict" | "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/", // Ensure cookie is available across the site
  }
  
  // Set in cookies
  Cookies.set("_shopenup_cart_id", cartId, cookieOptions)
  
  // Also store in localStorage as backup
  if (typeof window !== 'undefined') {
    localStorage.setItem('_shopenup_cart_id', cartId)
  }
}

export const removeCartId = async () => {
  Cookies.remove("_shopenup_cart_id")
  // Also clear from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('_shopenup_cart_id')
  }
}

// Function to clear all cart data (useful for logout)
export const clearAllCartData = async () => {
  await removeCartId()
  await removeAuthToken()
  console.log('🧹 All cart and auth data cleared')
}

// Function to clear only auth data (for logout without clearing cart)
export const clearAuthDataOnly = async () => {
  await removeAuthToken()
  console.log('🔐 Auth data cleared, cart data preserved')
}
