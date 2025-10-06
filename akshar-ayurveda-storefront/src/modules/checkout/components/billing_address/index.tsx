import React, { useEffect, useMemo, useState } from "react"

import { HttpTypes } from "@shopenup/types"
import { InputField } from "@components/Forms"
import { Button } from "@components/Button"
import { useCountryCode } from "hooks/country-code"
import { twMerge } from "tailwind-merge"
import { useFormContext } from "react-hook-form"
import { useAddressMutation } from "hooks/customer"
import { toast } from "sonner"
import CountrySelect from "@modules/checkout/components/country-select"
import StateSelect from "@modules/checkout/components/state-select"

const isBillingAddressEmpty = (formData: {
  billing_address?: Pick<
    HttpTypes.StoreCartAddress,
    | "first_name"
    | "last_name"
    | "address_1"
    | "address_2"
    | "company"
    | "postal_code"
    | "city"
    | "country_code"
    | "province"
    | "phone"
  >
}) => {
  return (
    !formData?.billing_address?.first_name &&
    !formData?.billing_address?.last_name &&
    !formData?.billing_address?.address_1 &&
    !formData?.billing_address?.address_2 &&
    !formData?.billing_address?.company &&
    !formData?.billing_address?.postal_code &&
    !formData?.billing_address?.city &&
    !formData?.billing_address?.country_code &&
    !formData?.billing_address?.province &&
    !formData?.billing_address?.phone
  )
}

const BillingAddress = ({
  cart,
  customer,
  shippingAddress,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  shippingAddress?: any
}) => {
  const countryCode = useCountryCode()
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const addAddress = useAddressMutation()

  const { setValue, watch, control } = useFormContext()
  
  const formData = watch()
  const newAddressCountryCode = watch("new_address.country_code")
  const billingCountryCode = watch("billing_address.country_code")
  

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
  ) => {
    setValue(e.target.name, e.target.value)
  }

  const copyShippingToBilling = () => {
    if (shippingAddress) {
      setValue("billing_address", {
        first_name: shippingAddress.first_name || "",
        last_name: shippingAddress.last_name || "",
        address_1: shippingAddress.address_1 || "",
        address_2: shippingAddress.address_2 || "",
        company: shippingAddress.company || "",
        postal_code: shippingAddress.postal_code || "",
        city: shippingAddress.city || "",
        country_code: shippingAddress.country_code || "",
        province: shippingAddress.province || "",
        phone: shippingAddress.phone || "",
      })
      
      // Clear selected address since we're using shipping address data
      setSelectedAddressId(null)
      
      toast.success("Billing address updated to match shipping address")
    }
  }

  // Get countries in the current region
  const countriesInRegion = useMemo(() => {
    if (!cart?.region?.countries) return []
    return cart.region.countries.map((c) => c.iso_2)
  }, [cart?.region?.countries])

  // Filter addresses that are in the current region
  const addressesInRegion = useMemo(() => {
    if (!customer?.addresses) return []
    return customer.addresses.filter(
      (a) => a.country_code && countriesInRegion.includes(a.country_code)
    )
  }, [customer?.addresses, countriesInRegion])

  useEffect(() => {
    // If customer has addresses and no address is selected yet, select the first one
    if (customer?.addresses?.length && !selectedAddressId) {
      const defaultAddress = customer.addresses.find((a) => a.is_default_billing) || customer.addresses[0]
      
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
      
      setValue("billing_address", addressData)
    }
    
    // If cart has billing address, try to match it
    if (cart?.billing_address && customer?.addresses?.length) {
      const matchingAddress = customer.addresses.find((a) => {
        return (
          a.first_name === cart.billing_address?.first_name &&
          a.last_name === cart.billing_address?.last_name &&
          a.address_1 === cart.billing_address?.address_1 &&
          a.city === cart.billing_address?.city &&
          a.postal_code === cart.billing_address?.postal_code
        )
      })
      
      if (matchingAddress) {
        setSelectedAddressId(matchingAddress.id)
      }
    }
  }, [cart, customer, selectedAddressId, setValue])

  // Sync selectedAddressId with form data changes
  useEffect(() => {
    if (formData.billing_address && customer?.addresses?.length) {
      const currentAddress = customer.addresses.find((a) => {
        return (
          a.first_name === formData.billing_address?.first_name &&
          a.last_name === formData.billing_address?.last_name &&
          a.address_1 === formData.billing_address?.address_1 &&
          a.address_2 === formData.billing_address?.address_2 &&
          a.city === formData.billing_address?.city &&
          a.postal_code === formData.billing_address?.postal_code &&
          a.country_code === formData.billing_address?.country_code &&
          a.province === formData.billing_address?.province &&
          a.phone === formData.billing_address?.phone
        )
      })
      
      if (currentAddress && currentAddress.id !== selectedAddressId) {
        setSelectedAddressId(currentAddress.id)
      }
    }
  }, [formData.billing_address, customer?.addresses, selectedAddressId])

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            onPress={copyShippingToBilling}
          >
            Use Same as Shipping
          </Button>
          {customer && customer.addresses && customer.addresses.length > 0 && (
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
          )}
        </div>
      </div>

      {/* Address Selection */}
      {customer && customer.addresses && customer.addresses.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-4">
            {addressesInRegion.map((address) => {
              const isSelected = address.id === selectedAddressId
              
              return (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => {
                    setSelectedAddressId(address.id)
                    
                    // Check if the address country is in the region
                    const regionCountry = cart?.region?.countries?.find(
                      (c) => c.iso_2 === address.country_code
                    )
                    
                    // If country not found in region, use the first available country as fallback
                    let countryCodeToUse = address.country_code || ""
                    if (!regionCountry && cart?.region?.countries?.length) {
                      const fallbackCountry = cart.region.countries[0]
                      countryCodeToUse = fallbackCountry.iso_2 || ""
                    }
                    
                    const addressData = {
                      first_name: address.first_name || "",
                      last_name: address.last_name || "",
                      address_1: address.address_1 || "",
                      address_2: address.address_2 || "",
                      company: address.company || "",
                      postal_code: address.postal_code || "",
                      city: address.city || "",
                      country_code: countryCodeToUse || "",
                      province: address.province || "",
                      phone: address.phone || "",
                    }
                    
                    setValue("billing_address", addressData)
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {[address.first_name, address.last_name]
                          .filter(Boolean)
                          .join(" ")}
                      </h4>
                      <div className="text-gray-800 space-y-1">
                        <p>
                          {[address.address_1, address.address_2]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p>
                          {[address.city, address.province]
                            .filter(Boolean)
                            .join(", ")} {address.postal_code}
                        </p>
                        <p className="font-medium">
                          {address.country_code?.toUpperCase()}
                        </p>
                        {address.phone && (
                          <p className="text-sm text-gray-600">
                            📞 {address.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Show when no saved address is selected (using custom form data) */}
            {!selectedAddressId && formData.billing_address && (
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
          
          {/* Add New Address Form */}
          {showNewAddressForm && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Add New Billing Address</h4>
              <div className="grid grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label htmlFor="billing-first-name" className="block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    placeholder="Enter your first name"
                    name="new_address.first_name"
                    inputProps={{ 
                      required: true,
                      className:"block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
                    }}
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label htmlFor="billing-last-name" className="block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    placeholder="Enter your last name"
                    name="new_address.last_name"
                    inputProps={{ 
                      required: true,
                      className:"block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
                    }}
                  />
                </div>

                {/* Address */}
                <div className="space-y-2 col-span-2">
                  <label htmlFor="billing-address" className="block text-sm font-medium text-gray-700">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    placeholder="Enter your street address"
                    name="new_address.address_1"
                    inputProps={{ 
                      required: true,
                      className:"block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
                    }}
                  />
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label htmlFor="billing-company" className="block text-sm font-medium text-gray-700">
                    Company (Optional)
                  </label>
                  <InputField
                    placeholder="Enter company name"
                    name="new_address.company"
                    inputProps={{ 
                      className:"block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
                    }}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="billing-phone" className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    placeholder="Enter your phone number"
                    name="new_address.phone"
                    inputProps={{ 
                      required: true,
                      className:"block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
                    }}
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    placeholder="Enter your city"
                    name="new_address.city"
                    inputProps={{ 
                      required: true,
                      className:"block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
                    }}
                  />
                </div>

                {/* Postal Code */}
                <div className="space-y-2">
                  <label htmlFor="billing-postal-code" className="block text-sm font-medium text-gray-700">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    placeholder="Enter postal code"
                    name="new_address.postal_code"
                    inputProps={{ 
                      required: true,
                      className:"block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
                    }}
                  />
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <label htmlFor="billing-country" className="block text-sm font-medium text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <CountrySelect
                    placeholder="Select your country"
                    region={cart?.region}
                    selectedKey={formData.new_address?.country_code || ""}
                    onSelectionChange={(value) => {
                      handleChange({
                        target: {
                          name: "new_address.country_code",
                          value: value as string,
                        },
                      })
                    }}
                    name="new_address.country_code"
                  />
                </div>

                {/* State/Province */}
                <div className="space-y-2">
                  <label htmlFor="billing-state" className="block text-sm font-medium text-gray-700">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <StateSelect
                    placeholder="Select your state"
                    countryCode={newAddressCountryCode}
                    selectedKey={formData.new_address?.province || ""}
                    onSelectionChange={(value) => {
                      handleChange({
                        target: {
                          name: "new_address.province",
                          value: value,
                        },
                      })
                    }}
                    name="new_address.province"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
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
                        setSelectedAddressId(result.addressId)
                        
                        // Find the newly added address from customer addresses
                        const newAddress = customer?.addresses?.find(a => a.id === result.addressId)
                        if (newAddress) {
                          // Set the form data
                          setValue("billing_address", {
                            first_name: newAddress.first_name || "",
                            last_name: newAddress.last_name || "",
                            address_1: newAddress.address_1 || "",
                            address_2: newAddress.address_2 || "",
                            company: newAddress.company || "",
                            postal_code: newAddress.postal_code || "",
                            city: newAddress.city || "",
                            country_code: newAddress.country_code || "",
                            province: newAddress.province || "",
                            phone: newAddress.phone || "",
                          })
                        }
                        
                        // Clear the new address form
                        setValue("new_address", {})
                        setShowNewAddressForm(false)
                        
                        toast.success("Address added successfully!")
                      }
                    } catch (error) {
                      toast.error("Failed to add address. Please try again.")
                    }
                  }}
                >
                  Save Address
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* First Name */}
          <div className="space-y-2">
            <label htmlFor="billing-first-name" className="block text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <InputField
              placeholder="Enter your first name"
              name="billing_address.first_name"
              inputProps={{ 
                autoComplete: "given-name",
                className:"block px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
              }}
              data-testid="billing-first-name-input"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label htmlFor="billing-last-name" className="block text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <InputField
              placeholder="Enter your last name"
              name="billing_address.last_name"
              inputProps={{ 
                autoComplete: "family-name",
                className:"block px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
              }}
              data-testid="billing-last-name-input"
            />
          </div>
          {/* Address */}
          <div className="space-y-2 col-span-2">
            <label htmlFor="billing-address" className="block text-sm font-medium text-gray-700">
              Street Address <span className="text-red-500">*</span>
            </label>
            <InputField
              placeholder="Enter your street address"
              name="billing_address.address_1"
              inputProps={{ 
                autoComplete: "address-line1",
                className:"block px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
              }}
              data-testid="billing-address-input"
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <label htmlFor="billing-company" className="block text-sm font-medium text-gray-700">
              Company (Optional)
            </label>
            <InputField
              placeholder="Enter company name"
              name="billing_address.company"
              inputProps={{ 
                autoComplete: "organization",
                className:"block px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
              }}
              data-testid="billing-company-input"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label htmlFor="billing-phone" className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <InputField
              placeholder="Enter your phone number"
              name="billing_address.phone"
              inputProps={{ 
                autoComplete: "tel",
                className:"block px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
              }}
              data-testid="billing-phone-input"
            />
          </div>
          {/* City */}
          <div className="space-y-2">
            <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700">
              City <span className="text-red-500">*</span>
            </label>
            <InputField
              placeholder="Enter your city"
              name="billing_address.city"
              inputProps={{ 
                autoComplete: "address-level2",
                className:"block px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
              }}
              data-testid="billing-city-input"
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <label htmlFor="billing-postal-code" className="block text-sm font-medium text-gray-700">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <InputField
              placeholder="Enter postal code"
              name="billing_address.postal_code"
              inputProps={{ 
                autoComplete: "postal-code",
                className:"block px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400" 
              }}
              data-testid="billing-postal-code-input"
            />
          </div>
          {/* Country */}
          <div className="space-y-2">
            <label htmlFor="billing-country" className="block text-sm font-medium text-gray-700">
              Country <span className="text-red-500">*</span>
            </label>
            <CountrySelect
              placeholder="Select your country"
              region={cart?.region}
              selectedKey={formData.billing_address?.country_code || ""}
              onSelectionChange={(value) => {
                handleChange({
                  target: {
                    name: "billing_address.country_code",
                    value: value as string,
                  },
                })
              }}
              name="billing_address.country_code"
            />
          </div>

          {/* State/Province */}
          <div className="space-y-2">
            <label htmlFor="billing-state" className="block text-sm font-medium text-gray-700">
              State/Province <span className="text-red-500">*</span>
            </label>
            <StateSelect
              placeholder="Select your state"
              countryCode={billingCountryCode}
              selectedKey={formData.billing_address?.province || ""}
              onSelectionChange={(value) => {
                handleChange({
                  target: {
                    name: "billing_address.province",
                    value: value,
                  },
                })
              }}
              name="billing_address.province"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default BillingAddress