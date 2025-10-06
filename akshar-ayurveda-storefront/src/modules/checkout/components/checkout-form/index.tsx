"use client"
import { withReactQueryProvider } from "@lib/util/react-query"
import React, { Suspense } from "react"
import { useRouter } from "next/navigation"

import Wrapper from "@modules/checkout/components/payment-wrapper"
import { useCart } from "hooks/cart"
import { getCheckoutStep } from "@modules/cart/utils/getCheckoutStep"

// Lazy load checkout components
const Email = React.lazy(() => import("@modules/checkout/components/email"))
const Addresses = React.lazy(() => import("@modules/checkout/components/addresses"))
const Shipping = React.lazy(() => import("@modules/checkout/components/shipping"))
const Payment = React.lazy(() => import("@modules/checkout/components/payment"))
const Review = React.lazy(() => import("@modules/checkout/components/review"))

// Loading component for lazy-loaded components
const CheckoutComponentLoader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cd8973] mx-auto mb-2"></div>
      <p className="text-gray-700 text-sm">Loading...</p>
    </div>
  </div>
)

export const CheckoutForm = withReactQueryProvider<{
  countryCode: string
  step: string | undefined
  cart?: any
}>(({ countryCode, step, cart: cartProp }) => {
  // Only fetch cart if not provided as prop
  const { data: cart, isPending } = useCart({ enabled: !cartProp })
  const router = useRouter()
  
  // Use provided cart or fetched cart - memoize to prevent unnecessary re-renders
  const finalCart = React.useMemo(() => cartProp || cart, [cartProp, cart])

  React.useEffect(() => {
    if (!step && finalCart) {
      const checkoutStep = getCheckoutStep(finalCart)
      router.push(`/checkout?step=${checkoutStep}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, countryCode, finalCart])
  
  if (isPending && !cartProp) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#cd8973] mx-auto mb-4"></div>
          <p className="text-gray-700">Loading checkout form...</p>
        </div>
      </div>
    )
  }

  if (!finalCart) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-700">No cart data available</p>
      </div>
    )
  }

  return (
    <Wrapper cart={finalCart}>
      <div className="space-y-8">
        <Suspense fallback={<CheckoutComponentLoader />}>
          <Email countryCode={countryCode} cart={finalCart} />
        </Suspense>
        <Suspense fallback={<CheckoutComponentLoader />}>
          <Addresses cart={finalCart} />
        </Suspense>
        <Suspense fallback={<CheckoutComponentLoader />}>
          <Shipping cart={finalCart} />
        </Suspense>
        <Suspense fallback={<CheckoutComponentLoader />}>
          <Payment cart={finalCart} />
        </Suspense>
        <Suspense fallback={<CheckoutComponentLoader />}>
          <Review cart={finalCart} />
        </Suspense>
      </div>
    </Wrapper>
  )
})
