"use client"

import { useMemo } from "react"

import { HttpTypes } from "@shopenup/types"
import * as ReactAria from "react-aria-components"
import {
  UiSelectButton,
  UiSelectIcon,
  UiSelectListBox,
  UiSelectListBoxItem,
  UiSelectValue,
} from "@components/ui/Select"

export type CountrySelectProps = ReactAria.SelectProps<
  Exclude<HttpTypes.StoreRegion["countries"], undefined>[number]
> & {
  region?: HttpTypes.StoreRegion
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  placeholder = "Country",
  region,
  ...props
}) => {
  const countryOptions = useMemo(() => {
    
    if (!region || !region.countries) {
      // Fallback countries if no region data
      const fallback = [
        { value: 'in', label: 'India' },
        { value: 'us', label: 'United States' },
        { value: 'gb', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
        { value: 'au', label: 'Australia' },
      ]
      return fallback
    }

    const options = region.countries?.map((country) => ({
      value: country.iso_2,
      label: country.display_name,
    }))
    return options
  }, [region])

  // Temporary fallback to test if ReactAria is the issue
  if (true) {
    return (
      <select
        className="w-full h-12 sm:h-14 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 border-gray-200 focus:border-[#cd8973] focus:ring-[#cd8973]"
        value={props.selectedKey || ""}
        onChange={(e) => {
          if (props.onSelectionChange) {
            props.onSelectionChange(e.target.value)
          }
        }}
      >
        <option value="" className="color-[#cd8973]/20">{placeholder}</option>
        {countryOptions?.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <ReactAria.Select
      aria-label="Select country"
      {...props}
      placeholder={placeholder}
      selectedKey={props.selectedKey || null}
      onOpenChange={() => {
      }}
    >
      <UiSelectButton className="!h-14">
        <UiSelectValue className="text-base" />
        <UiSelectIcon />
      </UiSelectButton>
      <ReactAria.Popover className="w-[--trigger-width]">
        <UiSelectListBox>
          {countryOptions?.map(({ value, label }, index) => {
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
}

CountrySelect.displayName = "CountrySelect"

export default CountrySelect