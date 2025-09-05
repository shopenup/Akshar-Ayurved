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
    console.log('CountrySelect - region:', region)
    console.log('CountrySelect - region.countries:', region?.countries)
    console.log('CountrySelect - selectedKey:', props.selectedKey)
    
    if (!region || !region.countries) {
      // Fallback countries if no region data
      const fallback = [
        { value: 'in', label: 'India' },
        { value: 'us', label: 'United States' },
        { value: 'gb', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
        { value: 'au', label: 'Australia' },
      ]
      console.log('CountrySelect - using fallback:', fallback)
      return fallback
    }

    const options = region.countries?.map((country) => ({
      value: country.iso_2,
      label: country.display_name,
    }))
    console.log('CountrySelect - mapped options:', options)
    return options
  }, [region])

  // Temporary fallback to test if ReactAria is the issue
  if (true) {
    return (
      <select
        className="w-full h-14 px-3 border border-gray-300 rounded-md bg-white text-base"
        value={props.selectedKey || ""}
        onChange={(e) => {
          console.log('HTML select changed:', e.target.value)
          if (props.onSelectionChange) {
            props.onSelectionChange(e.target.value)
          }
        }}
      >
        <option value="">{placeholder}</option>
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
      onOpenChange={(isOpen) => {
        console.log('Dropdown open state:', isOpen)
      }}
    >
      <UiSelectButton className="!h-14">
        <UiSelectValue className="text-base" />
        <UiSelectIcon />
      </UiSelectButton>
      <ReactAria.Popover className="w-[--trigger-width]">
        <UiSelectListBox>
          {countryOptions?.map(({ value, label }, index) => {
            console.log('Rendering option:', { value, label, index })
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