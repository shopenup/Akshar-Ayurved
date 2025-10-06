
import { Button } from "@shopenup/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useCallback, useEffect, useState } from "react"
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay"
import { useRouter } from "next/navigation"
import { HttpTypes } from "@shopenup/types"
import { usePlaceOrder } from "@hooks/cart"
import { CurrencyCode } from "react-razorpay/dist/constants/currency"
import { triggerOrderPlacedEvent } from "@lib/services/sms-service"
// import { useRouter } from 'next/router';

type RazorpayOrderData =
  | { razorpayOrder: { id: string } }
  | { razorpay_order_id: string }
  | null


export const RazorpayPaymentButton = ({
  session,
  notReady,
  cart
}: {
  session: HttpTypes.StorePaymentSession
  notReady: boolean
  cart: HttpTypes.StoreCart
}) => {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [loadingStep, setLoadingStep] = useState<string>('')
  const { Razorpay
  } = useRazorpay();

  const [orderData, setOrderData] = useState<RazorpayOrderData>(null)

  const placeOrder = usePlaceOrder()

  const getOrderId = useCallback((data: RazorpayOrderData): string => {
    if (!data) return ''
    if ('razorpay_order_id' in data) return data.razorpay_order_id
    if ('razorpayOrder' in data) return data.razorpayOrder.id
    return ''
  }, [])


  const onPaymentCompleted = useCallback(async () => {
    try {
      setLoadingStep('Processing your order...')
      setIsProcessingOrder(true)
      
      const result = await placeOrder.mutateAsync(null);

      // Send SMS notification through subscriber system if order was successful
      if (result?.type === "order" && result.order) {
        try {
          const orderId = (result as { order?: { id?: string } })?.order?.id || `ORD${Date.now()}`;
          
          setLoadingStep('Preparing your order confirmation...')
          setIsNavigating(true)
          
          // Navigate immediately but show loading overlay
          router.push(`/order-confirmation/${orderId}`);
          
          if (cart.shipping_address?.phone) {
            const phoneNumber = cart.shipping_address.phone.startsWith('+91')
              ? cart.shipping_address.phone
              : `+91${cart.shipping_address.phone}`;

            setLoadingStep('Sending confirmation...')
            await triggerOrderPlacedEvent({
              id: (result as { order?: { id?: string } })?.order?.id || `ORD${Date.now()}`,
              customer: {
                phone: phoneNumber,
                email: cart.email || '',
                firstName: cart.shipping_address.first_name || '',
                lastName: cart.shipping_address.last_name || ''
              },
              total: cart.total || 0,
              items: cart.items || [],
              status: 'processing'
            });
          }
        } catch (smsError) {
          console.warn('⚠️ Failed to send SMS notification through subscriber:', smsError);
          // Don't block the order flow if SMS fails
        }

        // Redirect to order success page
        
      }
    } catch {
      setErrorMessage("An error occurred, please try again.")
      setSubmitting(false)
      setIsNavigating(false)
      setIsProcessingOrder(false)
      setLoadingStep('')
    }
  }, [
    placeOrder,
    router,
    cart.shipping_address?.phone,
    cart.email,
    cart.shipping_address?.first_name,
    cart.shipping_address?.last_name,
    cart.total,
    cart.items,
    router
  ])
  useEffect(() => {
    setOrderData(session.data as { razorpayOrder: { id: string } })
    setOrderData(session.data as RazorpayOrderData)
  }, [session.data])




  const handlePayment = useCallback(async () => {
    const onPaymentCancelled = async () => {
      setErrorMessage("PaymentCancelled")
      setSubmitting(false)
      setIsLoading(false)
    }

    const razorpayOrderId = getOrderId(orderData)

    if (!razorpayOrderId) {
      setErrorMessage("Razorpay order ID is missing. Please try again.")
      setSubmitting(false)
      setIsLoading(false)
      return
    }
    
    if (!session.amount || session.amount <= 0) {
      setErrorMessage("Invalid payment amount. Please try again.")
      setSubmitting(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setErrorMessage(undefined)
    
    const resolvedRazorpayKey = (session?.data as any)?.razorpay_key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID || "your_key_id"

    const options: RazorpayOrderOptions = {
      // key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID ?? "your_key_id",
      key: resolvedRazorpayKey,
      callback_url: `${process.env.NEXT_PUBLIC_SHOPENUP_BACKEND_URL}/razorpay/hooks`,
      // amount: session.amount * 100 * 100,
      amount: Math.round(session.amount * 100), // Convert to paise (backend already converts, so only multiply by 100 once)
      order_id: razorpayOrderId,
      currency: cart.currency_code.toUpperCase() as CurrencyCode,
      name: process.env.COMPANY_NAME ?? "your company name ",
      description: `Order number ${razorpayOrderId || 'N/A'}`,
      remember_customer: true,


      // image: "https://example.com/your_logo",
      modal: {
        backdropclose: true,
        escape: true,
        handleback: true,
        confirm_close: true,
        ondismiss: async () => {
          setSubmitting(false)
          setErrorMessage(`payment cancelled`)
          await onPaymentCancelled()
        },
        animation: true,
      },

      handler: async () => {
        onPaymentCompleted()
      },
      "prefill": {
        "name": cart.billing_address?.first_name + " " + cart?.billing_address?.last_name,
        "email": cart?.email,
        "contact": (cart?.shipping_address?.phone) ?? undefined
      },


    };
    //await waitForPaymentCompletion();


    try {
      const razorpay = new Razorpay(options);
      if(razorpayOrderId) {
        razorpay.open();
        setIsLoading(false) // Stop loading when Razorpay opens
      }
      
      razorpay.on("payment.failed", function (response: { error: { code: string; description: string } }) {
        setErrorMessage(JSON.stringify(response.error))
        setSubmitting(false)
        setIsLoading(false)
      });

      // @ts-expect-error: Razorpay types do not include "payment.authorized" event, but it is supported in practice.
      razorpay.on("payment.authorized", function () {
        setLoadingStep('Processing your order...')
        setIsProcessingOrder(true)
        setSubmitting(true)
        setIsLoading(false)
        
        placeOrder.mutate(null, {
          onSuccess: async (result) => {
            setSubmitting(false)
            setIsLoading(false)
            setIsProcessingOrder(false)
            if (result?.type === "order" && result.order) {
              // Send SMS notification through subscriber system
              try {
                if (cart.shipping_address?.phone) {
                  const phoneNumber = cart.shipping_address.phone.startsWith('+91')
                    ? cart.shipping_address.phone
                    : `+91${cart.shipping_address.phone}`;

                  await triggerOrderPlacedEvent({
                    id: result.order.id,
                    customer: {
                      phone: phoneNumber,
                      email: cart.email || '',
                      firstName: cart.shipping_address.first_name || '',
                      lastName: cart.shipping_address.last_name || ''
                    },
                    total: cart.total || 0,
                    items: cart.items || [],
                    status: 'processing'
                  });
                }
              } catch (smsError) {
                console.warn('⚠️ Failed to send SMS notification through subscriber:', smsError);
              }

              // Redirect to order confirmation page
              router.push(`/order-confirmation/${result.order.id}`)
            }
          },
        onError: (error) => {
          console.error('Order placement failed:', error);
          setErrorMessage('Order placement failed. Please try again.');
          setSubmitting(false)
          setIsLoading(false)
          setIsProcessingOrder(false)
        }
        });
      });
    } catch (error) {
      console.error('Razorpay initialization failed:', error)
      setErrorMessage('Failed to initialize payment. Please try again.')
      setSubmitting(false)
      setIsLoading(false)
    }
    // razorpay.on("payment.captured", function (response: any) {

    // }
    // )
  }, [
    Razorpay,
    router,
    cart.billing_address?.first_name,
    cart.billing_address?.last_name,
    cart.currency_code,
    cart.email,
    cart.shipping_address?.phone,
    cart.items,
    cart.shipping_address?.first_name,
    cart.shipping_address?.last_name,
    cart.total,
    orderData,
    session.amount,
    onPaymentCompleted,
    placeOrder,
    getOrderId
  ]);
  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false)
        setErrorMessage('Payment initialization timed out. Please try again.')
      }, 10000) // 10 second timeout

      return () => clearTimeout(timeout)
    }
  }, [isLoading])

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

  const razorpayOrderId = getOrderId(orderData)
  const isDisabled = submitting || notReady || !razorpayOrderId || razorpayOrderId == '' || isLoading || isProcessingOrder || isNavigating
  const buttonText = isNavigating ? 'Redirecting...' : isProcessingOrder ? 'Processing Order...' : submitting ? 'Processing...' : isLoading ? 'Initializing...' : 'Place Order'
  
  return (
    <>
      {/* Loading Overlay */}
      {(isNavigating || isProcessingOrder) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="w-16 h-16 border-4 border-[#cd8973]/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-[#cd8973] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isProcessingOrder ? 'Processing Your Order...' : 'Order Successful! 🎉'}
              </h3>
              <p className="text-gray-600 mb-4">{loadingStep}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Payment processed</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isProcessingOrder ? 'bg-[#cd8973]' : 'bg-green-500'}`} style={{animationDelay: '0.5s'}}></div>
                <span>{isProcessingOrder ? 'Completing order...' : 'Order confirmed'}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isProcessingOrder ? 'bg-gray-300' : 'bg-blue-500'}`} style={{animationDelay: '1s'}}></div>
                <span>{isProcessingOrder ? 'Please wait...' : 'Preparing confirmation'}</span>
              </div>
            </div>
            
            <div className="mt-6 text-xs text-gray-400">
              {isProcessingOrder ? 'This may take a few moments...' : 'Please wait while we redirect you...'}
            </div>
          </div>
        </div>
      )}
      
      <div className="relative group">
      {/* Glow effect background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#cd8973] via-[#cd8973]/80 to-[#cd8973] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      
      {/* Main button */}
      <Button
        disabled={isDisabled}
        onClick={() => {
          handlePayment()
        }}
        className="relative w-full bg-gradient-to-r from-[#cd8973] via-[#cd8973] to-[#cd8973]/90 text-white px-12 py-6 rounded-2xl text-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-500 border-0 focus:ring-8 focus:ring-[#cd8973]/30 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Diagonal swipe effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        {/* Button content */}
        <div className="relative flex items-center justify-center space-x-4">
          {(submitting || isLoading || isProcessingOrder) ? (
            <div className="flex items-center space-x-3">
              {isProcessingOrder ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div
              className="relative flex items-center justify-center space-x-4"
              style={{ backgroundColor: '#cd8973', borderRadius: 10 }}
            >
              <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="tracking-wide" >{buttonText}</span>
              <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300 group-hover:translate-x-1 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </>
          )}
        </div>
        
        {/* Status indicator */}
        {!submitting && !isLoading && !isProcessingOrder && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse shadow-lg">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </Button>
      
      {/* Success message overlay when processing order */}
      {isProcessingOrder && (
        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</h3>
              <p className="text-green-700 font-medium mb-2">Your payment has been processed successfully.</p>
              <p className="text-green-600 text-sm">Please wait while we process your order and redirect you to the confirmation page...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message with enhanced styling */}
      {errorMessage && (
        <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Payment Error</h3>
              <p className="text-red-700 font-medium mb-4">{errorMessage}</p>
              <button 
                onClick={() => {
                  setErrorMessage(undefined)
                  setIsLoading(false)
                  setSubmitting(false)
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}