"use client"

import React from "react"
import { HttpTypes } from "@shopenup/types"

import { Form, InputField } from "@components/Forms"
import { codeFormSchema } from "@modules/cart/components/discount-code"
import { SubmitButton } from "@modules/common/components/submit-button"
import { useApplyPromotions } from "hooks/cart"
import { withReactQueryProvider } from "@lib/util/react-query"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const applyPromotions = useApplyPromotions()

  const { promotions = [] } = cart
  const activePromotion = promotions.length > 0 ? promotions[0] : null;

  const addPromotionCode = async (values: { code: string }) => {
    if (!values.code) {
      return
    }
    const codes = promotions
      .filter((p) => p.code === undefined)
      .map((p) => p.code!)
    codes.push(values.code)

    await applyPromotions.mutateAsync(codes)
  }

  const handleRemovePromotion = async () => {
    // Remove all promotion codes
    await applyPromotions.mutateAsync([])
  }

  return (
    <>
      {activePromotion ? (
        <div className="mb-6">
        <div className="flex items-center rounded-lg border border-[#cd8973]/20 bg-[#cd8973]/5 p-4 gap-4">
          <svg className="w-5 h-5 text-[#cd8973] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold text-[#cd8973] text-base mr-2">
            {activePromotion.application_method?.type === 'percentage'
              ? `${activePromotion.application_method.value}% off applied!`
              : activePromotion.application_method?.type === 'fixed' && activePromotion.application_method.currency_code
                ? `₹${activePromotion.application_method.value} off applied!`
                : 'Discount applied!'}
          </span>
          <span className="bg-[#cd8973]/10 text-[#cd8973] text-xs px-3 py-1 rounded ml-2">Code: {activePromotion.code}</span>
          <button
            onClick={handleRemovePromotion}
            className="ml-auto text-red-600 text-sm font-medium hover:underline"
            type="button"
          >
            Remove
          </button>
        </div>
      </div>
      ) : (
        <Form onSubmit={addPromotionCode} schema={codeFormSchema}>
          <div className="flex gap-2 mb-8">
            <InputField
              name="code"
              inputProps={{
                autoFocus: false,
                className:
                  "block px-4 py-2 text-base text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-l-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#cd8973] w-full",
              }}
              placeholder="Enter discount code"
              className="flex-1"
            />
            <SubmitButton className="bg-[#cd8973] text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-[#cd8973]/90 transition-colors">
              Apply
            </SubmitButton>
          </div>
        </Form>
      )}
    </>
  )
}

export default withReactQueryProvider(DiscountCode)
