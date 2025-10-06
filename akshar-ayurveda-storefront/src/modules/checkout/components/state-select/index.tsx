"use client"

import { useMemo } from "react"
import * as ReactAria from "react-aria-components"
import {
  UiSelectButton,
  UiSelectIcon,
  UiSelectListBox,
  UiSelectListBoxItem,
  UiSelectValue,
} from "@components/ui/Select"
import { getCountryProvinceObjectByIso2 } from "../../../../data/country-states"

export type StateSelectProps = {
  countryCode?: string | null
  placeholder?: string
  selectedKey?: string | null
  onSelectionChange?: (key: string) => void
  name?: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: () => void
  value?: string
  disabled?: boolean
  [key: string]: any // Allow additional props
}

const StateSelect: React.FC<StateSelectProps> = ({
  placeholder = "State/Province",
  countryCode,
  selectedKey,
  onSelectionChange,
  onChange,
  onBlur,
  value,
  disabled,
  name,
  ...props
}) => {
  const stateOptions = useMemo(() => {
    if (!countryCode) {
      return []
    }

    // Ensure country code is uppercase
    const normalizedCountryCode = countryCode.toUpperCase()

    const countryData = getCountryProvinceObjectByIso2(normalizedCountryCode)
    
    if (!countryData || !countryData.options) {
      return []
    }

    const options = Object.entries(countryData.options).map(([value, label]) => ({
      value,
      label,
    }))
    return options
  }, [countryCode])

  // Use simple select for now (similar to CountrySelect)
  return (
    <select
      className="w-full h-12 sm:h-14 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 border-gray-200 focus:border-[#cd8973] focus:ring-[#cd8973]"
      value={selectedKey || value || ""}
      onChange={(e) => {
        if (onSelectionChange) {
          onSelectionChange(e.target.value)
        }
        if (onChange) {
          onChange(e)
        }
      }}
      onBlur={onBlur}
      disabled={disabled || !countryCode || stateOptions.length === 0}
      name={name}
    >
      <option value="" className="color-[#cd8973]/20">
        {stateOptions.length === 0 ? "Select country first" : placeholder}
      </option>
      {stateOptions.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )

  // Uncomment this section if you want to use ReactAria Select instead
  /*
  return (
    <ReactAria.Select
      aria-label="Select state/province"
      {...props}
      placeholder={placeholder}
      selectedKey={props.selectedKey || null}
      onOpenChange={() => {}}
      isDisabled={!countryCode || stateOptions.length === 0}
    >
      <UiSelectButton className="!h-14">
        <UiSelectValue className="text-base" />
        <UiSelectIcon />
      </UiSelectButton>
      <ReactAria.Popover className="w-[--trigger-width]">
        <UiSelectListBox>
          {stateOptions.map(({ value, label }, index) => {
            return (
              <UiSelectListBoxItem key={value || index} id={value}>
                {label}
              </UiSelectListBoxItem>
            )
          })}
        </UiSelectListBox>
      </ReactAria.Popover>
    </ReactAria.Select>
  )
  */
}

StateSelect.displayName = "StateSelect"

export default StateSelect
