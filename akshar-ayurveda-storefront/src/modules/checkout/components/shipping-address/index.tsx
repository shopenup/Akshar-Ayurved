import { HttpTypes } from "@shopenup/types"
import React, { useEffect, useState } from "react"

import { CountrySelectField, InputField, StateSelectField } from "@components/Forms"
import CountrySelect from "@modules/checkout/components/country-select"
import StateSelect from "@modules/checkout/components/state-select"
import { Button } from "@components/Button"
import {
  UiCheckbox,
  UiCheckboxBox,
  UiCheckboxLabel,
  UiCheckboxCard,
} from "@components/ui/Checkbox"
import { useFormContext, useWatch } from "react-hook-form"
import { useAddressMutation } from "hooks/customer"
import { toast } from "sonner"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const addAddress = useAddressMutation()

  const { setValue, control } = useFormContext()

  const formData = useWatch({ control })
  const countryCode = useWatch({ control, name: "shipping_address.country_code" })
  const newAddressCountryCode = useWatch({ control, name: "new_address.country_code" })


  // Immediate initialization when component mounts with form data
  React.useEffect(() => {
    if (formData.shipping_address && customer?.addresses?.length && !selectedAddressId) {
      initializeSelectedAddress()
    }
  }, []) // Run only once on mount

  // Force re-initialization when form data changes (e.g., when clicking "Change")
  React.useEffect(() => {
    if (formData.shipping_address && customer?.addresses?.length) {
      const found = initializeSelectedAddress()
    }
  }, [formData.shipping_address?.first_name, formData.shipping_address?.last_name, formData.shipping_address?.address_1])

  // Function to find and set the correct selectedAddressId based on current form data
  const initializeSelectedAddress = () => {
    if (formData.shipping_address && customer?.addresses?.length) {
      const matchingAddress = customer.addresses.find((a) => {
        return (
          a.first_name === formData.shipping_address?.first_name &&
          a.last_name === formData.shipping_address?.last_name &&
          a.address_1 === formData.shipping_address?.address_1 &&
          a.address_2 === formData.shipping_address?.address_2 &&
          a.city === formData.shipping_address?.city &&
          a.postal_code === formData.shipping_address?.postal_code &&
          a.country_code === formData.shipping_address?.country_code &&
          a.province === formData.shipping_address?.province &&
          a.phone === formData.shipping_address?.phone
        )
      })

      if (matchingAddress) {
        setSelectedAddressId(matchingAddress.id)
        return true
      }
    }
    return false
  }

  useEffect(() => {
    // Only initialize if we don't have form data yet (first time load)
    if (customer?.addresses?.length && !selectedAddressId && !formData.shipping_address) {
      const defaultAddress = customer.addresses.find((a) => a.is_default_shipping) || customer.addresses[0]

      setSelectedAddressId(defaultAddress.id)

      // Also set the form data
      const regionCountry = cart?.region?.countries?.find(
        (c) => c.iso_2 === defaultAddress.country_code
      )

      // If country not found in region, use the first available country as fallback
      let countryCodeToUse = defaultAddress.country_code || ""
      if (!regionCountry && cart?.region?.countries?.length) {
        const fallbackCountry = cart.region.countries[0]
        countryCodeToUse = fallbackCountry.iso_2 || ""
      }

      const addressData = {
        first_name: defaultAddress.first_name || "",
        last_name: defaultAddress.last_name || "",
        address_1: defaultAddress.address_1 || "",
        address_2: defaultAddress.address_2 || "",
        company: defaultAddress.company || "",
        postal_code: defaultAddress.postal_code || "",
        city: defaultAddress.city || "",
        country_code: countryCodeToUse || "",
        province: defaultAddress.province || "",
        phone: defaultAddress.phone || "",
      }

      setValue("shipping_address", addressData)
    }

    // If cart has shipping address, try to match it (only if no form data exists)
    if (cart?.shipping_address && customer?.addresses?.length && !formData.shipping_address) {
      const matchingAddress = customer.addresses.find((a) => {
        return (
          a.first_name === cart.shipping_address?.first_name &&
          a.last_name === cart.shipping_address?.last_name &&
          a.address_1 === cart.shipping_address?.address_1 &&
          a.address_2 === cart.shipping_address?.address_2 &&
          a.city === cart.shipping_address?.city &&
          a.postal_code === cart.shipping_address?.postal_code &&
          a.country_code === cart.shipping_address?.country_code &&
          a.province === cart.shipping_address?.province &&
          a.phone === cart.shipping_address?.phone
        )
      })

      if (matchingAddress) {
        setSelectedAddressId(matchingAddress.id)
      }
    }
  }, [cart, customer, setValue, formData.shipping_address])

  // Initialize selectedAddressId when form data is available (e.g., when clicking "Change")
  useEffect(() => {
    if (formData.shipping_address && customer?.addresses?.length) {
      const found = initializeSelectedAddress()
      if (found) {
        setIsInitialized(true)
      }
    }
  }, [formData.shipping_address, customer?.addresses])

  // Sync selectedAddressId when form data changes
  useEffect(() => {
    if (formData.shipping_address && customer?.addresses?.length) {
      const matchingAddress = customer.addresses.find((a) => {
        return (
          a.first_name === formData.shipping_address?.first_name &&
          a.last_name === formData.shipping_address?.last_name &&
          a.address_1 === formData.shipping_address?.address_1 &&
          a.address_2 === formData.shipping_address?.address_2 &&
          a.city === formData.shipping_address?.city &&
          a.postal_code === formData.shipping_address?.postal_code &&
          a.country_code === formData.shipping_address?.country_code &&
          a.province === formData.shipping_address?.province &&
          a.phone === formData.shipping_address?.phone
        )
      })

      if (matchingAddress && matchingAddress.id !== selectedAddressId) {
        setSelectedAddressId(matchingAddress.id)
      } else if (!matchingAddress && selectedAddressId) {
        // If no matching address found but we have a selectedAddressId, clear it
        setSelectedAddressId(null)
      }
    }
  }, [formData.shipping_address, customer?.addresses, selectedAddressId])

  // Reset initialization when customer changes
  useEffect(() => {
    setIsInitialized(false)
    setSelectedAddressId(null)
  }, [customer?.id])

  // Sync selectedAddressId with form data changes
  // useEffect(() => {
  //   if (formData.shipping_address && customer?.addresses?.length) {
  //     const currentAddress = customer.addresses.find((a) => {
  //       return (
  //         a.first_name === formData.shipping_address?.first_name &&
  //         a.last_name === formData.shipping_address?.last_name &&
  //         a.address_1 === formData.shipping_address?.address_1 &&
  //         a.address_2 === formData.shipping_address?.address_2 &&
  //         a.city === formData.shipping_address?.city &&
  //         a.postal_code === formData.shipping_address?.postal_code &&
  //         a.country_code === formData.shipping_address?.country_code &&
  //         a.province === formData.shipping_address?.province &&
  //         a.phone === formData.shipping_address?.phone
  //       )
  //     })

  //     if (currentAddress && currentAddress.id !== selectedAddressId) {
  //       setSelectedAddressId(currentAddress.id)
  //     }
  //   }
  // }, [formData.shipping_address, customer?.addresses, selectedAddressId])
  useEffect(() => {

    if (formData.shipping_address && customer?.addresses?.length) {
      const currentAddress = customer.addresses.find((a) => {
        return (
          a.first_name === formData.shipping_address?.first_name &&
          a.last_name === formData.shipping_address?.last_name &&
          a.address_1 === formData.shipping_address?.address_1 &&
          a.address_2 === formData.shipping_address?.address_2 &&
          a.city === formData.shipping_address?.city &&
          a.postal_code === formData.shipping_address?.postal_code &&
          a.country_code === formData.shipping_address?.country_code &&
          a.province === formData.shipping_address?.province &&
          a.phone === formData.shipping_address?.phone
        )
      })

      if (currentAddress && currentAddress.id !== selectedAddressId) {
        setSelectedAddressId(currentAddress.id)
      }
    }
    // Remove selectedAddressId from dependencies
  }, [formData.shipping_address, customer?.addresses])


  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
  ) => {
    setValue(e.target.name, e.target.value)
  }

  return (
    <>
      {customer &&
        customer.addresses &&
        customer.addresses.length > 0 ? (
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Delivery Address</h3>
            <Button
              variant="outline"
              size="sm"
              className="text-[#cd8973] border-[#cd8973]/20 hover:bg-[#cd8973]/5"
              onPress={() => {
                setShowNewAddressForm(true)
              }}
            >
              Add New Address
            </Button>
          </div>

          <div className="space-y-4" key={`address-list-${selectedAddressId}-${formData.shipping_address?.first_name}`}>
            {customer?.addresses?.map((address) => {
              const isSelected = address.id === selectedAddressId

              return (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${isSelected
                      ? 'border-[#cd8973] bg-[#cd8973]/5'
                      : 'border-gray-200 hover:border-[#cd8973]/30'
                    }`}
                  onClick={() => {
                    setSelectedAddressId(address.id)

                    // Update the form
                    const addressData = {
                      first_name: address.first_name || "",
                      last_name: address.last_name || "",
                      address_1: address.address_1 || "",
                      address_2: address.address_2 || "",
                      company: address.company || "",
                      postal_code: address.postal_code || "",
                      city: address.city || "",
                      country_code: address.country_code || "",
                      province: address.province || "",
                      phone: address.phone || "",
                    }

                    setValue("shipping_address", addressData)
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${isSelected
                        ? 'border-[#cd8973] bg-[#cd8973]'
                        : 'border-gray-300'
                      }`}>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {[address.first_name, address.last_name].filter(Boolean).join(" ")}
                      </h4>
                      <div className="text-gray-800 space-y-1">
                        <p>{address.address_1}</p>
                        {address.address_2 && <p>{address.address_2}</p>}
                        <p>
                          {[address.city, address.province].filter(Boolean).join(", ")} {address.postal_code}
                        </p>
                        <p className="font-medium">
                          {cart?.region?.countries?.find((c) => c.iso_2 === address.country_code)?.display_name || address.country_code}
                        </p>
                        {address.phone && (
                          <p className="text-sm text-gray-600">📞 {address.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}


            {/* Show when no saved address is selected (using custom form data) */}
            {!selectedAddressId && formData.shipping_address && (
              <div className="p-4 border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-orange-400 bg-orange-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-800 mb-1">Custom Address</h4>
                    <p className="text-sm text-orange-600">
                      Using manually entered address details
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* New Address Form */}
          {showNewAddressForm && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Add New Address</h4>

              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  placeholder="First name"
                  name="new_address.first_name"
                  inputProps={{ required: true }}
                />
                <InputField
                  placeholder="Last name"
                  name="new_address.last_name"
                  inputProps={{ required: true }}
                />
                <InputField
                  placeholder="Address"
                  name="new_address.address_1"
                  inputProps={{ required: true }}
                />
                <InputField
                  placeholder="Apartment, suite, etc."
                  name="new_address.address_2"
                />
                <InputField
                  placeholder="Company"
                  name="new_address.company"
                />
                <InputField
                  placeholder="City"
                  name="new_address.city"
                  inputProps={{ required: true }}
                />
                <InputField
                  placeholder="Postal code"
                  name="new_address.postal_code"
                  inputProps={{ required: true }}
                />
                <StateSelect
                  placeholder="State / Province"
                  countryCode={newAddressCountryCode}
                  selectedKey={formData.new_address?.province || ""}
                  onSelectionChange={(value) => {
                    handleChange({
                      target: {
                        name: "new_address.province",
                        value: value,
                      },
                    })
                    // Force a re-render to update the state
                    setTimeout(() => {
                    }, 100)
                  }}
                  name="new_address.province"
                />
                <CountrySelect
                  placeholder="Country"
                  region={cart?.region}
                  selectedKey={formData.new_address?.country_code || ""}
                  onSelectionChange={(value) => {
                    handleChange({
                      target: {
                        name: "new_address.country_code",
                        value: value as string,
                      },
                    })
                    // Force a re-render to update the state
                    setTimeout(() => {
                    }, 100)
                  }}
                  name="new_address.country_code"
                />
                <InputField
                  placeholder="Phone"
                  name="new_address.phone"
                />
                <div className="col-span-2 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onPress={() => setShowNewAddressForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#cd8973] hover:bg-[#cd8973]/90"
                    onPress={async () => {
                      try {
                        const newAddressData = {
                          first_name: formData.new_address?.first_name || "",
                          last_name: formData.new_address?.last_name || "",
                          address_1: formData.new_address?.address_1 || "",
                          address_2: formData.new_address?.address_2 || "",
                          company: formData.new_address?.company || "",
                          city: formData.new_address?.city || "",
                          postal_code: formData.new_address?.postal_code || "",
                          province: formData.new_address?.province || "",
                          country_code: formData.new_address?.country_code || "",
                          phone: formData.new_address?.phone || "",
                        }


                        const result = await addAddress.mutateAsync(newAddressData)

                        // Set the newly added address as the selected address
                        if (result.success) {
                          // Find the correct country code format from region
                          const regionCountry = cart?.region?.countries?.find(
                            (c) => c.iso_2 === newAddressData.country_code
                          )

                          // If country not found in region, use the first available country as fallback
                          let countryCodeToUse = newAddressData.country_code || "IN"
                          if (!regionCountry && cart?.region?.countries?.length) {
                            const fallbackCountry = cart.region.countries[0]
                            countryCodeToUse = fallbackCountry.iso_2 || ""
                          }

                          const addressData = {
                            first_name: newAddressData.first_name || "",
                            last_name: newAddressData.last_name || "",
                            address_1: newAddressData.address_1 || "",
                            address_2: newAddressData.address_2 || "",
                            company: newAddressData.company || "",
                            postal_code: newAddressData.postal_code || "",
                            city: newAddressData.city || "",
                            country_code: countryCodeToUse || "",
                            province: newAddressData.province || "",
                            phone: newAddressData.phone || "",
                          }
                          setValue("shipping_address", addressData)
                        }

                        setShowNewAddressForm(false)
                        toast.success('Address added successfully!')
                      } catch {
                        toast.error('Failed to add address')
                      }
                    }}
                  >
                    Save Address
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* First Name */}
          <div className="space-y-2">
            <label htmlFor="shipping-first-name" className="block text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <InputField
              placeholder="Enter your first name"
              name="shipping_address.first_name"
              inputProps={{
                autoComplete: "given-name",
                className: "block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400"
              }}
              data-testid="shipping-first-name-input"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label htmlFor="shipping-last-name" className="block text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <InputField
              placeholder="Enter your last name"
              name="shipping_address.last_name"
              inputProps={{
                autoComplete: "family-name",
                className: "block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400"
              }}
              data-testid="shipping-last-name-input"
            />
          </div>
          {/* Address */}
          <div className="space-y-2 col-span-2">
            <label htmlFor="shipping-address" className="block text-sm font-medium text-gray-700">
              Street Address <span className="text-red-500">*</span>
            </label>
            <InputField
              placeholder="Enter your street address"
              name="shipping_address.address_1"
              inputProps={{
                autoComplete: "address-line1",
                className: "block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400"
              }}
              data-testid="shipping-address-input"
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <label htmlFor="shipping-company" className="block text-sm font-medium text-gray-700">
              Company (Optional)
            </label>
            <InputField
              placeholder="Enter company name"
              name="shipping_address.company"
              inputProps={{
                autoComplete: "organization",
                className: "block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400"
              }}
              data-testid="shipping-company-input"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label htmlFor="shipping-phone" className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <InputField
              placeholder="Enter your phone number"
              name="shipping_address.phone"
              inputProps={{
                autoComplete: "tel",
                className: "block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400"
              }}
              data-testid="shipping-phone-input"
            />
          </div>
          {/* City */}
          <div className="space-y-2">
            <label htmlFor="shipping-city" className="block text-sm font-medium text-gray-700">
              City <span className="text-red-500">*</span>
            </label>
            <InputField
              placeholder="Enter your city"
              name="shipping_address.city"
              inputProps={{
                autoComplete: "address-level2",
                className: "block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400"
              }}
              data-testid="shipping-city-input"
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <label htmlFor="shipping-postal-code" className="block text-sm font-medium text-gray-700">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <InputField
              placeholder="Enter postal code"
              name="shipping_address.postal_code"
              inputProps={{
                autoComplete: "postal-code",
                className: "block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400"
              }}
              data-testid="shipping-postal-code-input"
            />
          </div>
          {/* Country */}
          <div className="space-y-2">
            <label htmlFor="shipping-country" className="block text-sm font-medium text-gray-700">
              Country <span className="text-red-500">*</span>
            </label>
            <CountrySelect
              placeholder="Select your country"
              region={cart?.region}
              selectedKey={formData.shipping_address?.country_code || ""}
              onSelectionChange={(value) => {
                handleChange({
                  target: {
                    name: "shipping_address.country_code",
                    value: value as string,
                  },
                })
              }}
              name="shipping_address.country_code"
            />
          </div>

          {/* State/Province */}
          <div className="space-y-2">
            <label htmlFor="shipping-state" className="block text-sm font-medium text-gray-700">
              State/Province <span className="text-red-500">*</span>
            </label>
            <StateSelect
              placeholder="Select your state"
              countryCode={countryCode}
              selectedKey={formData.shipping_address?.province || ""}
              onSelectionChange={(value) => {
                handleChange({
                  target: {
                    name: "shipping_address.province",
                    value: value,
                  },
                })
              }}
              name="shipping_address.province"
            />
          </div>
        </div>
      )}
      <div className="mt-6">
        <input
          type="hidden"
          name="same_as_billing"
          value={checked ? "on" : "off"}
        />
        <UiCheckboxCard
          isSelected={checked}
          onPress={() => {
            setValue("same_as_billing", checked ? "off" : "on")
            onChange()
          }}
          className={`transition-all duration-300 hover:scale-[1.02] bg-[#cd8973] ${checked ? 'ring-2 ring-[#cd8973]/20' : ''
            }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                Billing address same as shipping address
              </h3>
              <p className="text-sm text-gray-600">
                Check this box if your billing address is the same as your shipping address
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl">📋</div>
              {checked && (
                <div className="w-2 h-2 bg-[#cd8973] rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        </UiCheckboxCard>
      </div>
    </>
  )
}

export default ShippingAddress
