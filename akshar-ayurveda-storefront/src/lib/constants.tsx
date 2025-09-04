import React from "react"
import { CreditCard } from "@shopenup/icons"

// TODO: The following icon imports are missing or incorrect. Please ensure these icon components exist and are correctly imported.
// import Ideal from "@modules/common/icons/ideal"
// import Bancontact from "@modules/common/icons/bancontact"
// import PayPal from "@modules/common/icons/paypal"

const Ideal = () => <span>iDeal</span>
const Bancontact = () => <span>Bancontact</span>
const PayPal = () => <span>PayPal</span>

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "iDeal",
    icon: <Ideal />,
  },
  "pp_stripe-bancontact_stripe": {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCard />,
  },
  pp_razorpay_razorpay: {
    title: "Razorpay",
    icon: <CreditCard />,
  },
  // Add more payment providers here
}

// This only checks if it is native stripe for card payments, it ignores the other stripe-based providers
export const isStripe = (providerId?: string) => {
  return providerId?.startsWith("pp_stripe_")
}
export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

export const isRazorpay = (providerId?: string) => {
  return providerId?.startsWith("pp_razorpay")
}
