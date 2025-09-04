"use client"

import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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

// Payment info map for available methods - only include what's actually configured
const paymentInfoMap: Record<string, { title: string; icon: React.ReactNode }> = {
  pp_stripe_stripe: { title: "Credit Card", icon: "💳" },
  pp_system_default: { title: "Manual Payment", icon: "📝" },
}

const Payment = ({ cart }: { cart: StoreCart }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

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

  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (paymentSession: StorePaymentSession) => paymentSession.status === "pending"
  )
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )
  const { data: availablePaymentMethods } = useCartPaymentMethods(
    cart?.region?.id ?? ""
  )
  
  // Debug: Log available payment methods
  console.log("🔍 Available payment methods:", availablePaymentMethods)
  
  // Filter to only show Stripe and Manual Payment
  const supportedPaymentMethods = availablePaymentMethods?.filter(method => 
    method.type === 'pp_stripe_stripe' || method.type === 'pp_system_default'
  ) || []
  
  // Add Manual Payment if not already present (for testing purposes)
  const finalPaymentMethods = supportedPaymentMethods.length > 0 ? supportedPaymentMethods : [
    { type: 'pp_system_default', id: 'manual' }
  ]
  
  // Debug: Log filtered payment methods
  console.log("✅ Supported payment methods:", supportedPaymentMethods)

  const isStripe = isStripeFunc(activeSession?.provider_id)
  const stripeReady = useContext(StripeContext)

  const paymentMethodId = activeSession?.data?.payment_method_id as string
  const { data: paymentMethod } = useGetPaymentMethod(paymentMethodId)

  const paymentReady =
    activeSession &&
    cart?.shipping_methods &&
    cart?.shipping_methods.length !== 0

  const handleRemoveCard = useCallback(() => {
    if (!activeSession?.id) {
      return
    }

    try {
      setPaymentMethod.mutate(
        { sessionId: activeSession.id, token: null },

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
  }, [activeSession?.id, setPaymentMethod])

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
              "transition-fontWeight duration-75",
              isOpen && "font-semibold"
            )}
          >
            4. Payment
          </p>
        </div>
        {!isOpen && paymentReady && (
          <Button variant="link" onPress={handleEdit}>
            Change
          </Button>
        )}
      </div>
      <div className={isOpen ? "block" : "hidden"}>
        {finalPaymentMethods?.length && (
          <>
            <UiRadioGroup
              value={selectedPaymentMethod}
              onChange={setSelectedPaymentMethod}
              aria-label="Payment methods"
            >
              {finalPaymentMethods
                .sort((a, b) => {
                  return a.id > b.id ? 1 : -1
                })

                .map((paymentMethod) => {
                                      return (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.type}
                        key={paymentMethod.type}
                        isSelected={selectedPaymentMethod === paymentMethod.type}
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
        <PaymentCardButton
          setError={setError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          selectedPaymentMethod={selectedPaymentMethod}
          createQueryString={createQueryString}
          cart={cart}
          cardComplete={cardComplete}
        />
      </div>

      <div className={isOpen ? "hidden" : "block"}>
        {cart && paymentReady && activeSession ? (
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
