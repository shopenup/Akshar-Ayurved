"use client"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { useCart } from "hooks/cart"
import { withReactQueryProvider } from "@lib/util/react-query"
import SkeletonCheckoutSummary from "@modules/skeletons/templates/skeleton-checkout-summary"

function CheckoutSummaryWrapper({ cart: cartProp }: { cart?: any }) {
  // Only fetch cart if not provided as prop
  const { data: cart, isPending } = useCart({ enabled: !cartProp })
  
  // Use provided cart or fetched cart
  const finalCart = cartProp || cart
  
  if (isPending && !cartProp) {
    return <SkeletonCheckoutSummary />
  }
  
  if (!finalCart) {
    return <SkeletonCheckoutSummary />
  }

  return <CheckoutSummary cart={finalCart} />
}

export default withReactQueryProvider(CheckoutSummaryWrapper)
