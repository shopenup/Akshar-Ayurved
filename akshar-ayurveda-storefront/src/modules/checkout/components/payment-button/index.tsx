"use client"

import { OnApproveActions, OnApproveData } from "@paypal/paypal-js"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import React, { useState, useContext, useEffect } from "react"
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
          className="w-full bg-gradient-to-r from-[#cd8973] via-[#cd8973] to-[#cd8973]/80 text-white px-10 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-[1.03] transition-all duration-500 border-0 focus:ring-8 focus:ring-[#cd8973]/30 relative overflow-hidden group"
          onClick={() => {
            selectPaymentMethod()
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center space-x-4">
            <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="tracking-wide">Select a Payment Method</span>
            <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300 group-hover:translate-x-1 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
        className="w-full bg-gradient-to-r from-[#cd8973] via-[#cd8973] to-[#cd8973]/80 text-white px-10 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-[1.03] transition-all duration-500 border-0 focus:ring-8 focus:ring-[#cd8973]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center justify-center space-x-4"  style={{backgroundColor: '#cd8973', borderRadius: 10}}>
          <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <span className="tracking-wide">Place Order</span>
          <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300 group-hover:translate-x-1 transition-transform duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
  const [isNavigating, setIsNavigating] = useState(false)
  const [loadingStep, setLoadingStep] = useState<string>('')
  const [orderStatus, setOrderStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const router = useRouter()

  // Add timeout to prevent infinite processing
  useEffect(() => {
    if (isProcessing) {
      const timeout = setTimeout(() => {
        setIsProcessing(false)
        setOrderStatus('error')
        setErrorMessage('Order processing timed out. Please try again.')
      }, 15000) // 15 second timeout for manual payment

      return () => clearTimeout(timeout)
    }
  }, [isProcessing])

  // Add timeout for navigation loading overlay
  useEffect(() => {
    if (isNavigating) {
      const timeout = setTimeout(() => {
        setIsNavigating(false)
        setLoadingStep('')
      }, 5000) // 5 second timeout for navigation

      return () => clearTimeout(timeout)
    }
  }, [isNavigating])

  // Listen for order processing events
  useEffect(() => {
    const handleOrderProcessing = (event: CustomEvent) => {
      if (event.detail?.step) {
        setLoadingStep(event.detail.step)
      }
    }

    window.addEventListener('order-processing', handleOrderProcessing as EventListener)
    
    return () => {
      window.removeEventListener('order-processing', handleOrderProcessing as EventListener)
    }
  }, [])

  const placeOrder = usePlaceOrder({
    onSuccess: async (data) => {
        
        setOrderStatus('success')
        setIsProcessing(false)
        
        if (data?.type === "order" && data.order) {
          setLoadingStep('Preparing your order confirmation...')
          setIsNavigating(true)
          
          // Navigate immediately but show loading overlay
          router.push(`/order-confirmation/${data.order.id}`)
          
          // Send SMS notification through subscriber system
          try {
            if (data.order.shipping_address?.phone) {
              const phoneNumber = data.order.shipping_address.phone.startsWith('+91') 
                ? data.order.shipping_address.phone 
                : `+91${data.order.shipping_address.phone}`;
              
              setLoadingStep('Sending confirmation...')
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
        } else if (data?.type === "cart" && (data as { error: { message: string } }).error) {
          setErrorMessage(data.error.message)
        } else {
        }
      },
      onError: (error) => {
        setErrorMessage(error.message)
        setOrderStatus('error')
        setIsProcessing(false)
        setIsNavigating(false)
        setLoadingStep('')
      },
    })

  const onPaymentCompleted = () => {
    setLoadingStep('Processing your order...')
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
    setIsNavigating(false)
    setLoadingStep('')
    setErrorMessage(null)
  }

  const getButtonContent = () => {
    switch (orderStatus) {
      case 'processing':
        return (
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Processing Order...</span>
          </div>
        )
      case 'success':
        return (
          <div className="flex items-center justify-center space-x-3">
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Order Placed!</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center justify-center space-x-3">
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Try Again</span>
          </div>
        )
      default:
        return (
          <>
            {/* <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div> */}
            <div
              className="relative flex items-center justify-center space-x-4"
              style={{ backgroundColor: '#cd8973', borderRadius: 10 }}
            >
              <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="tracking-wide" >Place Order</span>
              <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300 group-hover:translate-x-1 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
            {/* <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div> */}
          </>
        )
    }
  }

  const getButtonStyles = () => {
    const baseStyles = "px-10 rounded-2xl text-xl font-bold shadow-2xl transition-all duration-500 w-full transform border-0 focus:ring-8 relative overflow-hidden group"
    
    switch (orderStatus) {
      case 'processing':
        return `${baseStyles} bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white hover:shadow-3xl animate-pulse focus:ring-blue-300`
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-[#cd8973] via-[#cd8973] to-[#cd8973]/80 text-white hover:shadow-3xl scale-105 focus:ring-[#cd8973]/30`
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white hover:shadow-3xl animate-pulse focus:ring-red-300`
      default:
        return `${baseStyles} bg-gradient-to-r from-[#cd8973] via-[#cd8973] to-[#cd8973]/80 text-white hover:shadow-3xl hover:scale-[1.03] focus:ring-[#cd8973]/30`
    }
  }

  return (
    <>
      {/* Loading Overlay */}
      {(isNavigating || isProcessing) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="w-16 h-16 border-4 border-[#cd8973]/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-[#cd8973] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isProcessing ? 'Processing Your Order...' : 'Order Successful! 🎉'}
              </h3>
              <p className="text-gray-600 mb-4">{loadingStep}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Payment processed</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isProcessing ? 'bg-[#cd8973]' : 'bg-green-500'}`} style={{animationDelay: '0.5s'}}></div>
                <span>{isProcessing ? 'Completing order...' : 'Order confirmed'}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isProcessing ? 'bg-gray-300' : 'bg-blue-500'}`} style={{animationDelay: '1s'}}></div>
                <span>{isProcessing ? 'Please wait...' : 'Preparing confirmation'}</span>
              </div>
            </div>
            
            <div className="mt-6 text-xs text-gray-400">
              {isProcessing ? 'This may take a few moments...' : 'Please wait while we redirect you...'}
            </div>
          </div>
        </div>
      )}
      
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
          <div className="text-sm text-[#cd8973] font-medium">
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
