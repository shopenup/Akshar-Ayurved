import React, { useEffect } from 'react'
import { useCart } from '@hooks/cart'
import { useClearCheckoutData } from '@hooks/cart'
import { useRouter } from 'next/router'

/**
 * Component that watches for empty cart and clears checkout data
 * This should be placed in the checkout page to automatically clear
 * shipping address, shipping method, and other checkout data when cart becomes empty
 */
export const CartWatcher = () => {
  const { data: cart, isLoading } = useCart({ enabled: true })
  const clearCheckoutData = useClearCheckoutData()
  const router = useRouter()

  useEffect(() => {
    // Only run if cart data is loaded and we're on checkout page
    if (isLoading || !cart || router.pathname !== '/checkout') {
      return
    }

    // Check if cart is empty (no items or items array is empty)
    const isCartEmpty = !cart.items || cart.items.length === 0

    if (isCartEmpty) {
      // Clear all checkout-related data
      clearCheckoutData.mutate(undefined, {
        onSuccess: () => {
          // Optionally redirect to cart page
          // router.push('/cart')
        },
        onError: (error) => {
          // Handle error silently
        }
      })
    }
  }, [cart, isLoading, router.pathname, clearCheckoutData])

  // This component doesn't render anything
  return null
}

export default CartWatcher

