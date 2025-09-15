
import { Button } from "@shopenup/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useCallback, useEffect, useState } from "react"
import  {useRazorpay, RazorpayOrderOptions } from "react-razorpay"
import { HttpTypes } from "@shopenup/types"
import { usePlaceOrder } from "@hooks/cart"
import { CurrencyCode } from "react-razorpay/dist/constants/currency"
import { triggerOrderPlacedEvent } from "@lib/services/sms-service"
import { useRouter } from 'next/router';
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
  const {Razorpay
   } = useRazorpay();
  
  const [orderData,setOrderData] = useState({razorpayOrder:{id:""}})
  const placeOrder = usePlaceOrder()

  
  const onPaymentCompleted = useCallback(async () => {
    try {
      const result = await placeOrder.mutateAsync(null);
      
      // Send SMS notification through subscriber system if order was successful
      if (result?.type === "order" && result.order) {
        try {
          if (cart.shipping_address?.phone) {
            const phoneNumber = cart.shipping_address.phone.startsWith('+91') 
              ? cart.shipping_address.phone 
              : `+91${cart.shipping_address.phone}`;
            
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
        const orderId = (result as { order?: { id?: string } })?.order?.id || `ORD${Date.now()}`;
        router.push(`/order-confirmation/${orderId}`);
      }
    } catch {
      setErrorMessage("An error occurred, please try again.")
      setSubmitting(false)
    }
  }, [
    placeOrder,
    router,
    cart.shipping_address?.phone,
    cart.email,
    cart.shipping_address?.first_name,
    cart.shipping_address?.last_name,
    cart.total,
    cart.items
  ])
  useEffect(()=>{
    setOrderData(session.data as {razorpayOrder:{id:string}})
  },[session.data])

  


  const handlePayment = useCallback(async() => {
    const onPaymentCancelled = async () => {
        setErrorMessage("PaymentCancelled")
        setSubmitting(false)
      }
    
    const options: RazorpayOrderOptions = {
      key:process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID??process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID??"your_key_id",
      callback_url: `${process.env.NEXT_PUBLIC_SHOPENUP_BACKEND_URL}/razorpay/hooks`,
      amount: session.amount*100*100,
      order_id: orderData.razorpayOrder.id,
      currency: cart.currency_code.toUpperCase() as CurrencyCode,
      name: process.env.COMPANY_NAME ?? "your company name ",
      description: `Order number ${orderData.razorpayOrder.id}`,
      remember_customer:true,
      

      image: "https://example.com/your_logo",
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
    
    
    const razorpay = new Razorpay(options);
    if(orderData.razorpayOrder.id)
    razorpay.open();
    razorpay.on("payment.failed", function (response: { error: { code: string; description: string } }) {
      setErrorMessage(JSON.stringify(response.error))
    });

    // @ts-expect-error: Razorpay types do not include "payment.authorized" event, but it is supported in practice.
    razorpay.on("payment.authorized", function () {
      placeOrder.mutate(null, {
        onSuccess: async (result) => {
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
      }
    });
    })
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
    orderData.razorpayOrder.id,
    session.amount,
    onPaymentCompleted,
    placeOrder
  ]);
  return (
    <>
      <Button
        disabled={submitting || notReady || !orderData?.razorpayOrder?.id||orderData?.razorpayOrder?.id == ''}
        onClick={()=>{
          handlePayment()}
        }
      >
        {submitting ? <Spinner name="loader" /> : "Checkout"}
      </Button>
      {errorMessage && (
        <div className="text-red-500 text-small-regular mt-2">
          {errorMessage}
        </div>
      )}
    </>
  )
}