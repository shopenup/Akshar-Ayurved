"use client"
import { withReactQueryProvider } from "@lib/util/react-query"
import React from "react"
import { useRouter } from "next/navigation"

import Wrapper from "@modules/checkout/components/payment-wrapper"
import Email from "@modules/checkout/components/email"
import Addresses from "@modules/checkout/components/addresses"
import Shipping from "@modules/checkout/components/shipping"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import { useCart } from "hooks/cart"
import { getCheckoutStep } from "@modules/cart/utils/getCheckoutStep"
import { Icon } from "@components/Icon"

export const CheckoutForm = withReactQueryProvider<{
  countryCode: string
  step: string | undefined
}>(({ countryCode, step }) => {
  const { data: cart, isPending } = useCart({ enabled: true })
  const router = useRouter()
  
  // Debug cart structure
  React.useEffect(() => {
    if (cart) {
      console.log('🛒 Cart structure debug:', {
        id: cart.id,
        email: cart.email,
        hasShippingAddress: !!cart.shipping_address?.address_1,
        hasBillingAddress: !!cart.billing_address?.address_1,
        shippingMethodsCount: cart.shipping_methods?.length || 0,
        hasPaymentCollection: !!cart.payment_collection,
        itemsCount: cart.items?.length || 0,
        items: cart.items?.map(item => ({
          id: item.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          hasVariant: !!item.variant
        }))
      })
    }
  }, [cart])

  React.useEffect(() => {
    if (!step && cart) {
      const checkoutStep = getCheckoutStep(cart)
      console.log('🔄 Redirecting to step:', checkoutStep)
      router.push(`/checkout?step=${checkoutStep}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, countryCode, cart])
  
  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout form...</p>
        </div>
      </div>
    )
  }

  if (!cart) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No cart data available</p>
      </div>
    )
  }

  return (
    <Wrapper cart={cart}>
      <div className="space-y-8">
        <Email countryCode={countryCode} cart={cart} />
        <Addresses cart={cart} />
        <Shipping cart={cart} />
        <Payment cart={cart} />
        <Review cart={cart} />
      </div>
    </Wrapper>
  )
})
