import * as React from "react"

import { isManual } from "@lib/constants"
import { UiRadio } from "@components/ui/Radio"
import PaymentTest from "@modules/checkout/components/payment-test"

type PaymentContainerProps = {
  paymentProviderId: string
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: React.ReactNode }>
  isSelected?: boolean
  onSelect?: (id: string) => void
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  paymentInfoMap,
  disabled = false,
  isSelected = false,
  onSelect,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"

  const handleSelect = () => {
    if (!disabled && onSelect) {
      onSelect(paymentProviderId)
    }
  }

  return (
    <UiRadio
      variant="outline"
      className={`transition-all duration-300 hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-[#cd8973]/20' : ''
      }`}
      onPress={handleSelect}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h3 className="font-normal text-gray-900 text-[16px] md:text-base">
              {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
            </h3>
            {isManual(paymentProviderId) && isDevelopment && <PaymentTest />}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-2xl">
            {paymentInfoMap[paymentProviderId]?.icon}
          </span>
        </div>
      </div>
    </UiRadio>
  )
}

export default PaymentContainer
