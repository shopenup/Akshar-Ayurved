"use client"

import { OnApproveActions, OnApproveData } from "@paypal/paypal-js"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import { HttpTypes } from "@shopenup/types"
import { useRouter } from "next/navigation"
import { RazorpayPaymentButton } from "./razorpay-payment-button"

import Spinner from "@modules/common/icons/spinner"
import { isManual, isPaypal, isStripe, isRazorpay } from "@lib/constants"
import { Button } from "@components/Button"
import ErrorMessage from "@modules/checkout/components/error-message"
import { usePlaceOrder } from "hooks/cart"
import { withReactQueryProvider } from "@lib/util/react-query"
import { toast } from "sonner"
import { triggerOrderPlacedEvent } from "@lib/services/sms-service"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  selectPaymentMethod: () => void
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  selectPaymentMethod,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  // TODO: Add this once gift cards are implemented
  // const paidByGiftcard =
  //   cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  // if (paidByGiftcard) {
  //   return <GiftCardPaymentButton />
  // }

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return <StripePaymentButton notReady={notReady} cart={cart} />
    case isManual(paymentSession?.provider_id):
      return <ManualTestPaymentButton notReady={notReady} />
    case isPaypal(paymentSession?.provider_id):
      return <PayPalPaymentButton notReady={notReady} cart={cart} />
    case isRazorpay(paymentSession?.provider_id):
      return <RazorpayPaymentButton session={paymentSession as HttpTypes.StorePaymentSession} notReady={notReady} cart={cart} />
    default:
      return (
        <Button
          className="w-full"
          onClick={() => {
            selectPaymentMethod()
          }}
        >
          Select a payment method
        </Button>
      )
  }
}

// const GiftCardPaymentButton = () => {
//   const [submitting, setSubmitting] = useState(false)

//   const handleOrder = async () => {
//     setSubmitting(true)
//     await placeOrder()
//   }

//   return (
//     <Button onPress={handleOrder} isLoading={submitting} className="w-full">
//       Place order
//     </Button>
//   )
// }

const StripePaymentButton = ({
  cart,
  notReady,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const placeOrder = usePlaceOrder()
  const router = useRouter()

  const onPaymentCompleted = () => {
    placeOrder.mutate(null, {
      onSuccess: async (data) => {
        if (data?.type === "order" && data.order) {
          const countryCode = data.order.shipping_address?.country_code?.toLowerCase()
          
          // Send SMS notification through subscriber system
          try {
            if (data.order.shipping_address?.phone) {
              const phoneNumber = data.order.shipping_address.phone.startsWith('+91') 
                ? data.order.shipping_address.phone 
                : `+91${data.order.shipping_address.phone}`;
              
              await triggerOrderPlacedEvent({
                id: data.order.id,
                customer: {
                  phone: phoneNumber,
                  email: data.order.email || '',
                  firstName: data.order.shipping_address.first_name || '',
                  lastName: data.order.shipping_address.last_name || ''
                },
                total: data.order.total || 0,
                items: data.order.items || [],
                status: data.order.status || 'processing'
              });
              console.log('✅ SMS notification sent through subscriber system');
            }
          } catch (smsError) {
            console.warn('⚠️ Failed to send SMS notification through subscriber:', smsError);
            // Continue with order placement even if SMS fails
          }
          
          router.push(`/order-confirmation/${data.order.id}`)
        } else if (data?.type === "cart" && data.error) {
          setErrorMessage(data.error.message)
        }
        setSubmitting(false)
      },
      onError: (error) => {
        setErrorMessage(error.message)
        setSubmitting(false)
      },
    })
  }

  const stripe = useStripe()

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !session?.data?.payment_method_id ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe) {
      setSubmitting(false)
      return
    }
    const paymentMethodId = session?.data?.payment_method_id as string

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: paymentMethodId,
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        className="w-full"
      >
        Place order
      </Button>
      <ErrorMessage error={errorMessage} />
    </>
  )
}

const PayPalPaymentButton = ({
  cart,
  notReady,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const router = useRouter()

  const placeOrder = usePlaceOrder()

  const onPaymentCompleted = () => {
    placeOrder.mutate(null, {
      onSuccess: async (data) => {
        if (data?.type === "order" && data.order) {
          const countryCode =
            data.order.shipping_address?.country_code?.toLowerCase()
          
          // Send SMS notification through subscriber system
          try {
            if (data.order.shipping_address?.phone) {
              const phoneNumber = data.order.shipping_address.phone.startsWith('+91') 
                ? data.order.shipping_address.phone 
                : `+91${data.order.shipping_address.phone}`;
              
              await triggerOrderPlacedEvent({
                id: data.order.id,
                customer: {
                  phone: phoneNumber,
                  email: data.order.email || '',
                  firstName: data.order.shipping_address.first_name || '',
                  lastName: data.order.shipping_address.last_name || ''
                },
                total: data.order.total || 0,
                items: data.order.items || [],
                status: data.order.status || 'processing'
              });
              console.log('✅ SMS notification sent through subscriber system');
            }
          } catch (smsError) {
            console.warn('⚠️ Failed to send SMS notification through subscriber:', smsError);
            // Continue with order placement even if SMS fails
          }
          
          router.push(`/order-confirmation/${data.order.id}`)
        } else if (data?.type === "cart" && (data as any).error) {
          setErrorMessage((data as any).error.message)
        }
        setSubmitting(false)
      },
      onError: (error) => {
        setErrorMessage(error.message)
        setSubmitting(false)
      },
    })
  }

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const handlePayment = async (
    _data: OnApproveData,
    actions: OnApproveActions
  ) => {
    actions?.order
      ?.authorize()
      .then((authorization) => {
        if (authorization.status !== "COMPLETED") {
          setErrorMessage(`An error occurred, status: ${authorization.status}`)
          return
        }
        onPaymentCompleted()
      })
      .catch(() => {
        setErrorMessage(`An unknown error occurred, please try again.`)
        setSubmitting(false)
      })
  }

  const [{ isPending, isResolved }] = usePayPalScriptReducer()

  if (isPending) {
    return <Spinner />
  }

  if (isResolved) {
    return (
      <>
        <PayPalButtons
          style={{ layout: "horizontal" }}
          createOrder={async () => session?.data.id as string}
          onApprove={handlePayment}
          disabled={notReady || submitting || isPending}
        />
        <ErrorMessage error={errorMessage} />
      </>
    )
  }
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const placeOrder = usePlaceOrder()

  const router = useRouter()

  const onPaymentCompleted = () => {
    placeOrder.mutate(null, {
      onSuccess: async (data) => {
        if (data?.type === "order" && data.order) {
          const countryCode =
            data.order.shipping_address?.country_code?.toLowerCase()
          
          // Send SMS notification through subscriber system
          try {
            if (data.order.shipping_address?.phone) {
              const phoneNumber = data.order.shipping_address.phone.startsWith('+91') 
                ? data.order.shipping_address.phone 
                : `+91${data.order.shipping_address.phone}`;
              
              await triggerOrderPlacedEvent({
                id: data.order.id,
                customer: {
                  phone: phoneNumber,
                  email: data.order.email || '',
                  firstName: data.order.shipping_address.first_name || '',
                  lastName: data.order.shipping_address.last_name || ''
                },
                total: data.order.total || 0,
                items: data.order.items || [],
                status: data.order.status || 'processing'
              });
              console.log('✅ SMS notification sent through subscriber system');
            }
          } catch (smsError) {
            console.warn('⚠️ Failed to send SMS notification through subscriber:', smsError);
            // Continue with order placement even if SMS fails
          }
          
          router.push(`/order-confirmation/${data.order.id}`)
        } else if (data?.type === "cart" && (data as any).error) {
          setErrorMessage(data.error.message)
        }
      },
      onError: (error) => {
        setErrorMessage(error.message)
      },
    })
  }

  const handlePayment = () => {
    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        onClick={handlePayment}
        className="w-full"
      >
        Place order
      </Button>
      <ErrorMessage error={errorMessage} />
    </>
  )
}

export default withReactQueryProvider(PaymentButton)
