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

  return (
    <Form onSubmit={addPromotionCode} schema={codeFormSchema}>
      <div className="flex max-sm:flex-col gap-x-6 gap-y-4 mb-8">
        <InputField
          name="code"
          inputProps={{ autoFocus: false, className: "block  px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 border-gray-200 focus:border-green-400 focus:ring-green-400  w-full" }}
          placeholder="Discount code"
          className="flex-1"
        />
        <SubmitButton className="bg-green-600 text-white px-2 xl:px-3 py-1 xl:py-2 rounded-md text-xs xl:text-sm font-medium hover:bg-green-700 transition-colors ml-2 mt-1">
          Apply
        </SubmitButton>
      </div>
    </Form>
  )
}

export default withReactQueryProvider(DiscountCode)
