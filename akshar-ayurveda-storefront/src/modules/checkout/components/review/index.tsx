"use client"

import { twJoin } from "tailwind-merge"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@components/Button"
import PaymentButton from "@modules/checkout/components/payment-button"
import { StoreCart } from "@shopenup/types"

const Review = ({ cart }: { cart: StoreCart }) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const isOpen = searchParams.get("step") === "review"

  // const paidByGiftcard =
  //   cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0
  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods &&
    cart.shipping_methods.length > 0 &&
    cart.payment_collection

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
            5. Review
          </p>
        </div>
        {!isOpen &&
          previousStepsCompleted &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Button
              variant="link"
              onPress={() => {
                router.push("/checkout?step=review", { scroll: false })
              }}
               className={"text-[#cd8973]"}
            >
              View
            </Button>
          )}
      </div>
      {isOpen && previousStepsCompleted && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200 shadow-sm">
          {/* <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#cd8973] rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Complete Your Order?</h3>
            <p className="text-gray-600">Review your details and place your order securely</p>
          </div> */}
          
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 leading-relaxed">
                  By clicking the <strong className="text-[#cd8973]">Place Order</strong> button, you confirm that you have read, understand and accept our{' '}
                  <a href="/terms-of-use" className="text-[#cd8973] hover:underline font-medium">Terms of Use</a>,{' '}
                  <a href="/terms-of-sale" className="text-[#cd8973] hover:underline font-medium">Terms of Sale</a> and{' '}
                  <a href="/returns-policy" className="text-[#cd8973] hover:underline font-medium">Returns Policy</a>{' '}
                  and acknowledge that you have read Shopenup Store&apos;s{' '}
                  <a href="/privacy-policy" className="text-[#cd8973] hover:underline font-medium">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#cd8973] to-[#cd8973]/60 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <PaymentButton
                cart={cart}
                selectPaymentMethod={() => {
                  router.push("/order-confirmation", { scroll: false })
                }}
              />
            </div>
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse shadow-lg">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Review
