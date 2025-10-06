"use client"

import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CreditCard } from "@shopenup/icons"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"
import { twJoin } from "tailwind-merge"
import { capitalize } from "lodash"

import { isStripe as isStripeFunc } from "@lib/constants"
import PaymentContainer from "@modules/checkout/components/payment-container"
import { StripeContext } from "@modules/checkout/components/payment-wrapper"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentCardButton from "@modules/checkout/components/payment-card-button"

import { Button } from "@components/Button"
import { UiRadioGroup } from "@components/ui/Radio"
import { Input } from "@components/Forms"
import {
  useCartPaymentMethods,
  useGetPaymentMethod,
  useSetPaymentMethod,
} from "hooks/cart"
import { StoreCart, StorePaymentSession } from "@shopenup/types"

// Payment info map for available methods - override admin labels only on UI
const paymentInfoMap: Record<string, { title: string; icon: React.ReactNode }> = {
  // Stripe generic card
  'pp_stripe_stripe': { title: 'Credit/Debit Card', icon: '💳' },
  // Stripe alternative methods
  'pp_stripe-bancontact_stripe': { title: 'Bancontact', icon: '🏦' },
  'pp_stripe-blik_stripe': { title: 'BLIK', icon: '📱' },
  'pp_stripe-giropay_stripe': { title: 'Giropay', icon: '🏦' },
  // Razorpay
  'pp_razorpay_razorpay': { title: 'Razorpay (UPI / Cards / Wallets)', icon: '💳' },
  // System/manual
  'pp_system_default': { title: 'Manual Payment', icon: '📝' },
}

const Payment = ({ cart }: { cart: StoreCart }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  const isOpen = searchParams.get("step") === "payment"

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#050505",
          "::placeholder": {
            color: "#808080",
          },
          fontSize: "16px",
        },
      },
      classes: {
        base: "pt-[18px] pb-1 block w-full h-14.5 px-4 mt-0 border rounded-xs appearance-none focus:outline-none focus:ring-0 border-grayscale-200 hover:border-grayscale-500 focus:border-grayscale-500 transition-all ease-in-out",
      },
    }
  }, [])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push("/checkout?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const setPaymentMethod = useSetPaymentMethod()

  const activeSession = undefined
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const { data: availablePaymentMethods } = useCartPaymentMethods(
    cart?.region?.id ?? ""
  )
  
  // Only allow providers enabled in admin for this region
  const allowedProviderIds = useMemo(
    () => (availablePaymentMethods ?? []).map((m) => m.id),
    [availablePaymentMethods]
  )

  // Initialize selected payment method from cart's payment collection
  useEffect(() => {
    if (cart?.payment_collection?.payment_sessions && cart.payment_collection.payment_sessions.length > 0 && !selectedPaymentMethod) {
      const currentPaymentSession = cart.payment_collection.payment_sessions[0]
      if (currentPaymentSession?.provider_id && allowedProviderIds.includes(currentPaymentSession.provider_id)) {
        setSelectedPaymentMethod(currentPaymentSession.provider_id)
      }
    } else if (!selectedPaymentMethod && allowedProviderIds.length > 0) {
      // If no payment session exists, select the first available payment method
      setSelectedPaymentMethod(allowedProviderIds[0])
    }
  }, [cart?.payment_collection?.payment_sessions, selectedPaymentMethod, allowedProviderIds])

  // Reset selection if it isn't allowed anymore (prevents stale defaults like pp_razorpay)
  useEffect(() => {
    if (
      selectedPaymentMethod &&
      !allowedProviderIds.includes(selectedPaymentMethod)
    ) {
      setSelectedPaymentMethod(allowedProviderIds[0] ?? "")
    }
  }, [allowedProviderIds, selectedPaymentMethod])

  // Whether user has a valid, admin-enabled selection
  const hasValidSelection =
    !!selectedPaymentMethod && allowedProviderIds.includes(selectedPaymentMethod)
  

  const isStripe = isStripeFunc(selectedPaymentMethod)
  const stripeReady = useContext(StripeContext)

  const currentSession = cart?.payment_collection?.payment_sessions?.find(
    (s: StorePaymentSession) =>
      s.provider_id === selectedPaymentMethod && s.status === "pending"
  )
  const paymentMethodId = currentSession?.data?.payment_method_id as
    | string
    | undefined
  const { data: paymentMethod } = useGetPaymentMethod(paymentMethodId)

  const paymentReady =
    currentSession &&
    cart?.shipping_methods &&
    cart?.shipping_methods.length !== 0

  const handleRemoveCard = useCallback(() => {
    if (!currentSession?.id) {
      return
    }

    try {
      setPaymentMethod.mutate(
        { sessionId: currentSession.id, token: null },

        {
          onSuccess: () => {
            setCardBrand(null)
            setCardComplete(false)
          },
          onError: () => setError("Failed to remove card"),
        }
      )
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to remove card")
    }
  }, [currentSession?.id, setPaymentMethod])

  useEffect(() => {
    if (paymentMethod) {
      setCardBrand(capitalize(paymentMethod?.card?.brand))
      setCardComplete(true)
    }
  }, [paymentMethod])

  if (!cart) {
    return null
  }
  return (
    <>
      <div className="flex justify-between mb-6 md:mb-8 border-t border-grayscale-200 pt-8 mt-8">
        <div>
          <p
            className={twJoin(
              "transition-fontWeight duration-75 text-[#cd8973] font-semibold",
              isOpen && "font-semibold"
            )}
          >
            4. Payment
          </p>
        </div>
        {!isOpen && paymentReady && (
          <Button variant="link" onPress={handleEdit}  className={"text-[#cd8973]"}>
            Change
          </Button>
        )}
      </div>
      <div className={isOpen ? "block" : "hidden"}>
        {(availablePaymentMethods?.length ?? 0) > 0 && (
          <>
            <UiRadioGroup
              value={selectedPaymentMethod}
              onChange={setSelectedPaymentMethod}
              aria-label="Payment methods"
            >
              {availablePaymentMethods?.filter(method => allowedProviderIds.includes(method.id))
                .sort((a, b) => {
                  return a.id > b.id ? 1 : -1
                })

                .map((paymentMethod) => {
                                      return (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        key={paymentMethod.id}
                        isSelected={selectedPaymentMethod === paymentMethod.id}
                        onSelect={setSelectedPaymentMethod}
                      />
                    )
                })}
            </UiRadioGroup>
            {isStripe && stripeReady && (
              <div className="mt-5">
                {isStripeFunc(selectedPaymentMethod) &&
                  (paymentMethod?.card?.brand ? (
                    <Input
                      value={"**** **** **** " + paymentMethod?.card.last4}
                      placeholder="Card number"
                      disabled={true}
                    />
                  ) : (
                    <CardElement
                      options={useOptions as StripeCardElementOptions}
                      onChange={(e) => {
                        setCardBrand(
                          e.brand &&
                            e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                        )
                        setError(e.error?.message || null)
                        setCardComplete(e.complete)
                      }}
                    />
                  ))}
              </div>
            )}
          </>
        )}

        {/* {paidByGiftcard && (
          <div className="flex gap-10">
            <div className="text-grayscale-500">Payment method</div>
            <div>Gift card</div>
          </div>
        )} */}
        <ErrorMessage
          error={error}
          data-testid="payment-method-error-message"
        />
        {paymentMethod && isStripeFunc(selectedPaymentMethod) && (
          <Button
            className="mt-6 mr-6"
            onPress={handleRemoveCard}
            isLoading={isLoading}
            isDisabled={!cardComplete}
            data-testid="submit-payment-button"
          >
            Change card
          </Button>
        )}
        {hasValidSelection && (
          <PaymentCardButton
            setError={setError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            selectedPaymentMethod={selectedPaymentMethod}
            createQueryString={createQueryString}
            cart={cart}
            cardComplete={cardComplete}
          />
        )}
      </div>

      <div className={isOpen ? "hidden" : "block"}>
        {cart && paymentReady && currentSession ? (
          <div className="flex flex-col gap-4">
            <div className="flex max-sm:flex-col flex-wrap gap-y-2 gap-x-12">
              <div className="text-grayscale-500">Payment method</div>
              <div className="text-grayscale-600">
                {paymentInfoMap[selectedPaymentMethod]?.title ||
                  selectedPaymentMethod}
              </div>
            </div>
            <div className="flex max-sm:flex-col flex-wrap gap-y-2 gap-x-14.5">
              <div className="text-grayscale-500">Payment details</div>
              {isStripeFunc(selectedPaymentMethod) && cardBrand ? (
                <div className="text-grayscale-600 flex items-center gap-2">
                  {paymentInfoMap[selectedPaymentMethod]?.icon || (
                    <CreditCard />
                  )}
                  <p>{cardBrand}</p>
                </div>
              ) : (
                <div>
                  <p>Please enter card details</p>
                </div>
              )}
            </div>
          </div> /* : paidByGiftcard ? (
          <div className="flex gap-10">
            <div className="text-grayscale-500">Payment method</div>
            <div>Gift card</div>
          </div>
        ) */
        ) : null}
      </div>
    </>
  )
}

export default Payment
