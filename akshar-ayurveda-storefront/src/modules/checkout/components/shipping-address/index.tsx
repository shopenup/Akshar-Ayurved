import { HttpTypes } from "@shopenup/types"
import React, { useEffect, useState } from "react"

import { CountrySelectField, InputField } from "@components/Forms"
import { Button } from "@components/Button"
import {
  UiCheckbox,
  UiCheckboxBox,
  UiCheckboxLabel,
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
  const addAddress = useAddressMutation()

  const { setValue, control } = useFormContext()

  const formData = useWatch({ control })

  // Debug logging
  console.log('Customer addresses:', customer?.addresses)
  console.log('Selected address ID:', selectedAddressId)
  console.log('Form data:', formData)
  console.log('Cart region:', cart?.region)
  console.log('Cart region ID:', cart?.region?.id)
  console.log('Cart region countries:', cart?.region?.countries)
  console.log('Cart region countries ISO codes:', cart?.region?.countries?.map(c => ({ 
    id: c.id, 
    iso_2: c.iso_2, 
    iso_3: c.iso_3, 
    name: c.display_name,
    numeric_code: c.num_code 
  })))




  useEffect(() => {
    console.log('useEffect triggered - cart:', cart, 'customer:', customer)
    
    // If customer has addresses and no address is selected yet, select the first one
    if (customer?.addresses?.length && !selectedAddressId) {
      console.log('Setting default address selection')
      const defaultAddress = customer.addresses.find((a) => a.is_default_shipping) || customer.addresses[0]
      console.log('Default address:', defaultAddress)
      
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
        console.warn(`Default address country ${defaultAddress.country_code} not found in region. Using fallback: ${fallbackCountry.iso_2} (${fallbackCountry.display_name})`)
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
      
      console.log('Setting form data:', addressData)
      setValue("shipping_address", addressData)
    }
    
    // If cart has shipping address, try to match it
    if (cart?.shipping_address && customer?.addresses?.length) {
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
        console.log('Found matching address:', matchingAddress.id)
        setSelectedAddressId(matchingAddress.id)
      }
    }
  }, [cart, customer, selectedAddressId, setValue])


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
              className="text-green-600 border-green-200 hover:bg-green-50"
              onPress={() => {
                setShowNewAddressForm(true)
              }}
            >
              Add New Address
            </Button>
          </div>
          
          <div className="space-y-4">
            {customer?.addresses?.map((address) => {
              const isSelected = address.id === selectedAddressId
              console.log('Rendering address:', address.id, 'Selected:', selectedAddressId, 'IsSelected:', isSelected)
              
              return (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => {
                    console.log('Address clicked:', address.id)
                    console.log('Address country_code:', address.country_code)
                    console.log('Cart region countries:', cart?.region?.countries)
                    
                    // Check if the address country is in the region
                    const regionCountry = cart?.region?.countries?.find(
                      (c) => c.iso_2 === address.country_code
                    )
                    
                    console.log('Found region country:', regionCountry)
                    
                    // If country not found in region, use the first available country as fallback
                    let countryCodeToUse = address.country_code || ""
                    if (!regionCountry && cart?.region?.countries?.length) {
                      const fallbackCountry = cart.region.countries[0]
                      countryCodeToUse = fallbackCountry.iso_2 || ""
                      console.warn(`Country ${address.country_code} not found in region. Using fallback: ${fallbackCountry.iso_2} (${fallbackCountry.display_name})`)
                    }
                    
                    if (!regionCountry) {
                      console.warn('Address country not found in region! Available countries:', 
                        cart?.region?.countries?.map(c => ({ iso_2: c.iso_2, name: c.display_name }))
                      )
                    }
                    
                    setSelectedAddressId(address.id)
                    
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
                    
                    console.log('Setting address data:', addressData)
                    setValue("shipping_address", addressData)
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                      isSelected 
                        ? 'border-green-500 bg-green-500' 
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
                      <div className="text-gray-600 space-y-1">
                        <p>{address.address_1}</p>
                        {address.address_2 && <p>{address.address_2}</p>}
                        <p>
                          {[address.city, address.province]
                            .filter(Boolean)
                            .join(", ")} {address.postal_code}
                        </p>
                        <p className="font-medium">
                    {cart?.region?.countries?.find(
                            (c) => c.iso_2 === address.country_code
                          )?.display_name || address.country_code}
                  </p>
                        {address.phone && (
                          <p className="text-sm text-gray-500">📞 {address.phone}</p>
                        )}
                </div>
                </div>
              </div>
                </div>
              )
            })}
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
                <InputField
                  placeholder="Province"
                  name="new_address.province"
                />
                <CountrySelectField
                  name="new_address.country_code"
                  selectProps={{ region: cart?.region, isRequired: true }}
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
                    className="bg-green-600 hover:bg-green-700"
                    onPress={async () => {
                      try {
                        const newAddressData = {
                          first_name: (document.querySelector('input[name="new_address.first_name"]') as HTMLInputElement)?.value,
                          last_name: (document.querySelector('input[name="new_address.last_name"]') as HTMLInputElement)?.value,
                          address_1: (document.querySelector('input[name="new_address.address_1"]') as HTMLInputElement)?.value,
                          address_2: (document.querySelector('input[name="new_address.address_2"]') as HTMLInputElement)?.value,
                          company: (document.querySelector('input[name="new_address.company"]') as HTMLInputElement)?.value,
                          city: (document.querySelector('input[name="new_address.city"]') as HTMLInputElement)?.value,
                          postal_code: (document.querySelector('input[name="new_address.postal_code"]') as HTMLInputElement)?.value,
                          province: (document.querySelector('input[name="new_address.province"]') as HTMLInputElement)?.value,
                          country_code: (document.querySelector('select[name="new_address.country_code"]') as HTMLSelectElement)?.value,
                          phone: (document.querySelector('input[name="new_address.phone"]') as HTMLInputElement)?.value,
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
                            console.warn(`New address country ${newAddressData.country_code} not found in region. Using fallback: ${fallbackCountry.iso_2} (${fallbackCountry.display_name})`)
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
        <div className="grid grid-cols-2 gap-4 mb-8 ">
          <InputField
            placeholder="First name"
            name="shipping_address.first_name"
            inputProps={{ autoComplete: "given-name",className:"block  px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 border-gray-200 focus:border-green-400 focus:ring-green-400  w-full" }}
            data-testid="shipping-first-name-input"
          />
          <InputField
            placeholder="Last name"
            name="shipping_address.last_name"
            inputProps={{ autoComplete: "family-name",className:"block  px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 border-gray-200 focus:border-green-400 focus:ring-green-400  w-full" }}
            data-testid="shipping-last-name-input"
          />
          <InputField
            placeholder="Address"
            name="shipping_address.address_1"
            inputProps={{ autoComplete: "address-line1",className:"block  px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 border-gray-200 focus:border-green-400 focus:ring-green-400  w-full" }}
            data-testid="shipping-address-input"
          />
          <InputField
            placeholder="Company"
            name="shipping_address.company"
            inputProps={{ autoComplete: "organization",className:"block  px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 border-gray-200 focus:border-green-400 focus:ring-green-400  w-full" }}
            data-testid="shipping-company-input"
          />
          <InputField
            placeholder="Postal code"
            name="shipping_address.postal_code"
            inputProps={{ autoComplete: "postal-code",className:"block  px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 border-gray-200 focus:border-green-400 focus:ring-green-400  w-full" }}
            data-testid="shipping-postal-code-input"
          />
          <InputField
            placeholder="City"
            name="shipping_address.city"
            inputProps={{ autoComplete: "address-level2",className:"block  px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 border-gray-200 focus:border-green-400 focus:ring-green-400  w-full" }}
            data-testid="shipping-city-input"
          />
          <CountrySelectField
            name="shipping_address.country_code"
            selectProps={{
              placeholder: "Country",
              autoComplete: "country",
              region: cart?.region,
              selectedKey: formData["shipping_address.country_code"] || null,
              onSelectionChange: (value) => {
                console.log('Country selected:', value)
                handleChange({
                  target: {
                    name: "shipping_address.country_code",
                    value: `${value}`,
                  },
                })
              },
            }}
            data-testid="shipping-country-select"
          />
          <InputField
            placeholder="State / Province"
            name="shipping_address.province"
            inputProps={{ autoComplete: "address-level1" ,className:"block  px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 border-gray-200 focus:border-green-400 focus:ring-green-400  w-full"
        }}
            data-testid="shipping-province-input"
          />
          <InputField
            placeholder="Phone"
            name="shipping_address.phone"
            inputProps={{ autoComplete: "tel",className:"block  px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 border-gray-200 focus:border-green-400 focus:ring-green-400  w-full"
 }}
            data-testid="shipping-phone-input"
          />
        </div>
      )}
      <div>
        <input
          type="hidden"
          name="same_as_billing"
          value={checked ? "on" : "off"}
        />
        <UiCheckbox
          isSelected={checked}
          onPress={() => {
            setValue("same_as_billing", checked ? "off" : "on")
            onChange()
          }}
          data-testid="billing-address-checkbox"
        >
          <UiCheckboxBox isSelected={checked} />
          <UiCheckboxLabel>
            Billing address same as shipping address
          </UiCheckboxLabel>
        </UiCheckbox>
      </div>
    </>
  )
}

export default ShippingAddress
