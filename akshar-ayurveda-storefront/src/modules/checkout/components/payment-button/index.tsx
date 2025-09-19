"use client"

import { OnApproveActions, OnApproveData } from "@paypal/paypal-js"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import React, { useState, useContext } from "react"
import { HttpTypes } from "@shopenup/types"
import { useRouter } from "next/navigation"
import { RazorpayPaymentButton } from "./razorpay-payment-button"

import Spinner from "@modules/common/icons/spinner"
import { isManual, isPaypal, isStripe, isRazorpay } from "@lib/constants"
import { Button } from "@components/Button"
import ErrorMessage from "@modules/checkout/components/error-message"
import { usePlaceOrder } from "hooks/cart"
import { withReactQueryProvider } from "@lib/util/react-query"
import { triggerOrderPlacedEvent } from "@lib/services/sms-service"
import { StripeContext } from "@modules/checkout/components/payment-wrapper"

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
          className="w-full bg-green-600 text-white px-2 xl:px-3 py-1 xl:py-2 rounded-md text-xs xl:text-sm font-medium hover:bg-green-700 transition-colors"
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const placeOrder = usePlaceOrder()
  const router = useRouter()
  const stripeReady = useContext(StripeContext)

  const onPaymentCompleted = () => {
    placeOrder.mutate(null, {
      onSuccess: async (data) => {
        if (data?.type === "order" && data.order) {
          
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
            }
          } catch {
            // Continue with order placement even if SMS fails
          }
          
          router.push(`/order-confirmation/${data.order.id}`)
        } else if (data?.type === "cart" && data.error) {
          setErrorMessage(data.error.message)
        }
        // setSubmitting is not defined in this scope; remove or handle accordingly
      },
      onError: (error) => {
        setErrorMessage(error.message)
        // setSubmitting is not defined in this scope; remove or handle accordingly
      },
    })
  }

  // Use Stripe context to check if Stripe is ready
  const [stripe, setStripe] = useState<any>(null)

  React.useEffect(() => {
    if (stripeReady) {
      // Dynamically import and use Stripe hook
      import("@stripe/react-stripe-js").then(({ useStripe }) => {
        // Since we can't call hooks conditionally, we'll handle this in the payment wrapper
        // The StripePaymentButton should only render when Stripe is ready
        setStripe({ ready: true })
      }).catch(() => {
        setStripe(null)
      })
    }
  }, [stripeReady])

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !session?.data?.payment_method_id ? true : false

  const handlePayment = async () => {
    // setSubmitting is not defined in this scope; remove or handle accordingly

    if (!stripe) {
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

  if (!stripeReady || !stripe) {
    return (
      <Button
        variant="solid"
        size="md"
        disabled={true}
        className="w-full"
      >
        <Spinner name="loader" />
        Loading payment...
      </Button>
    )
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
            }
          } catch {
            // Continue with order placement even if SMS fails
          }
          
          router.push(`/order-confirmation/${data.order.id}`)
        } else if (data?.type === "cart" && (data as { error: { message: string } }).error) {
          setErrorMessage((data as { error: { message: string } }).error.message)
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
    return <Spinner name="loader" />
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
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderStatus, setOrderStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const router = useRouter()

  const placeOrder = usePlaceOrder({
    onSuccess: async (data) => {
        
        setOrderStatus('success')
        setIsProcessing(false)
        
        if (data?.type === "order" && data.order) {
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
            }
          } catch {
            // Continue with order placement even if SMS fails
          }
          
          router.push(`/order-confirmation/${data.order.id}`)
        } else if (data?.type === "cart" && (data as { error: { message: string } }).error) {
          setErrorMessage(data.error.message)
        } else {
        }
      },
      onError: (error) => {
        setErrorMessage(error.message)
        setOrderStatus('error')
        setIsProcessing(false)
      },
    })

  const onPaymentCompleted = () => {
    setIsProcessing(true)
    setOrderStatus('processing')
    setErrorMessage(null)
    placeOrder.mutate(null)
  }

  const handlePayment = () => {
    onPaymentCompleted()
  }

  const resetOrder = () => {
    setOrderStatus('idle')
    setIsProcessing(false)
    setErrorMessage(null)
  }

  const getButtonContent = () => {
    switch (orderStatus) {
      case 'processing':
        return (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Processing Order...</span>
          </div>
        )
      case 'success':
        return (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse">✅</div>
            <span>Order Placed!</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-bounce">❌</div>
            <span>Try Again</span>
          </div>
        )
      default:
        return 'Place Order'
    }
  }

  const getButtonStyles = () => {
    const baseStyles = "px-2 xl:px-3 py-1 xl:py-2 rounded-md text-xs xl:text-sm font-medium transition-all duration-300 w-full transform"
    
    switch (orderStatus) {
      case 'processing':
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 animate-pulse`
      case 'success':
        return `${baseStyles} bg-green-600 text-white hover:bg-green-700 scale-105`
      case 'error':
        return `${baseStyles} bg-red-600 text-white hover:bg-red-700 animate-pulse`
      default:
        return `${baseStyles} bg-green-600 text-white hover:bg-green-700 hover:scale-105`
    }
  }

  return (
    <>
      <Button
        disabled={notReady || isProcessing}
        onClick={handlePayment}
        className={getButtonStyles()}
      >
        {getButtonContent()}
      </Button>
      
      {orderStatus === 'processing' && (
        <div className="mt-2 text-center">
          <div className="text-sm text-gray-600 animate-pulse">
            Please wait while we process your order...
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
        </div>
      )}
      
      {orderStatus === 'success' && (
        <div className="mt-2 text-center animate-fade-in">
          <div className="text-sm text-green-600 font-medium">
            🎉 Order placed successfully! Redirecting...
          </div>
        </div>
      )}
      
      {orderStatus === 'error' && (
        <div className="mt-2 text-center">
          <Button
            onClick={resetOrder}
            className="bg-gray-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-700 transition-colors"
          >
            Try Again
          </Button>
        </div>
      )}
      
      <ErrorMessage error={errorMessage} />
    </>
  )
}

export default withReactQueryProvider(PaymentButton)
