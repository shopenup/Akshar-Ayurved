import * as React from "react"

import { isManual } from "@lib/constants"
import { UiRadio, UiRadioBox, UiRadioLabel } from "@components/ui/Radio"
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
      key={paymentProviderId}
      value={paymentProviderId}
      variant="outline"
      className={`gap-4 transition-all duration-200 ${isSelected ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-200 hover:border-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onPress={handleSelect}
    >
      <UiRadioBox 
        value={paymentProviderId}
        isSelected={isSelected}
        isDisabled={disabled}
        onChange={onSelect}
      />
      <UiRadioLabel className="flex-1">
        {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}

        {isManual(paymentProviderId) && isDevelopment && <PaymentTest />}
      </UiRadioLabel>
      <span className="ml-auto text-lg">
        {paymentInfoMap[paymentProviderId]?.icon}
      </span>
    </UiRadio>
  )
}

export default PaymentContainer
