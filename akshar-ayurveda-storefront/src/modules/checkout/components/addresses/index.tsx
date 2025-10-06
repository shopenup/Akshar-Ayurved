"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { twJoin } from "tailwind-merge"
import compareAddresses from "@lib/util/compare-addresses"
import { SubmitButton } from "@modules/common/components/submit-button"
import BillingAddress from "@modules/checkout/components/billing_address"
import ErrorMessage from "@modules/checkout/components/error-message"
import ShippingAddress from "@modules/checkout/components/shipping-address"
import { Button } from "@components/Button"
import { Form } from "@components/Forms"
import { z } from "zod"
import { useCustomer } from "hooks/customer"
import { useSetShippingAddress } from "hooks/cart"
import { StoreCart } from "@shopenup/types"

const addressesFormSchema = z
  .object({
    shipping_address: z.object({
      first_name: z.string().min(1),
      last_name: z.string().min(1),
      company: z.string().optional().nullable(),
      address_1: z.string().min(1),
      address_2: z.string().optional().nullable(),
      city: z.string().min(1),
      postal_code: z.string().min(1),
      province: z.string().optional().nullable(),
      country_code: z.string().min(2),
      phone: z.string().optional().nullable(),
    }),
  })
  .and(
    z.discriminatedUnion("same_as_billing", [
      z.object({
        same_as_billing: z.literal("on"),
      }),
      z.object({
        same_as_billing: z.literal("off").optional(),
        billing_address: z.object({
          first_name: z.string().min(1),
          last_name: z.string().min(1),
          company: z.string().optional().nullable(),
          address_1: z.string().min(1),
          address_2: z.string().optional().nullable(),
          city: z.string().min(1),
          postal_code: z.string().min(1),
          province: z.string().optional().nullable(),
          country_code: z.string().min(2),
          phone: z.string().optional().nullable(),
        }),
      }),
    ])
  )

const Addresses = ({ cart }: { cart: StoreCart }) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const isOpen = searchParams.get("step") === "delivery"

  const [sameAsBilling, setSameAsBilling] = React.useState(true)

  const { data: customer } = useCustomer()

  React.useEffect(() => {
    if (cart?.shipping_address && cart?.billing_address) {
      setSameAsBilling(
        compareAddresses(cart.shipping_address, cart.billing_address)
      )
    }
  }, [cart?.billing_address, cart?.shipping_address])

  const toggleSameAsBilling = React.useCallback(() => {
    setSameAsBilling((prev) => !prev)
  }, [setSameAsBilling])

  const { mutate, isPending, data } = useSetShippingAddress()

  const onSubmit = (values: z.infer<typeof addressesFormSchema>) => {
    
    // Check for null values in required fields
    const requiredFields = ['first_name', 'last_name', 'address_1', 'city', 'postal_code', 'country_code']
    const shippingIssues = requiredFields.filter(field => 
      !values.shipping_address[field as keyof typeof values.shipping_address] || 
      values.shipping_address[field as keyof typeof values.shipping_address] === null
    )
    
    if (shippingIssues.length > 0) {
    }
    
    // Handle billing address based on discriminated union
    if (values.same_as_billing === "off" && 'billing_address' in values) {
      const billingAddress = (values as { billing_address: Record<string, unknown> }).billing_address
      const billingIssues = requiredFields.filter(field => 
        !billingAddress[field] || billingAddress[field] === null
      )
      
      if (billingIssues.length > 0) {
      }
    }
    
    
    mutate(values, {
              onSuccess: (data) => {
          if (isOpen && data.success) {
            router.push("/checkout?step=shipping", { scroll: false })
          }
        },
    })
  }
  if (!cart) {
    return null
  }

  return (
    <>
      <div className="flex justify-between mb-6 md:mb-8 border-t border-grayscale-200 pt-8 mt-8">
        <div>
          <p
            className={twJoin(
              "transition-fontWeight duration-75 text-[#cd8973] font-semibold",
              isOpen && "font-semibold"
            )}
          >
            2. Delivery details
          </p>
        </div>
        {!isOpen && cart?.shipping_address && (
          <Button
            variant="link"
            onPress={() => {
              router.push("/checkout?step=delivery")
            }}
             className={"text-[#cd8973]"}
          >
            Change
          </Button>
        )}
      </div>
      {isOpen ? (
        <Form
          schema={addressesFormSchema}
          onSubmit={onSubmit}
          formProps={{
            id: `email`,
          }}
          defaultValues={
            sameAsBilling
              ? {
                  shipping_address: cart?.shipping_address || {
                    first_name: "",
                    last_name: "",
                    company: "",
                    province: "",
                    city: "",
                    postal_code: "",
                    country_code: "",
                    address_1: "",
                    address_2: "",
                    phone: "",
                  },
                  same_as_billing: "on",
                }
              : {
                  shipping_address: cart?.shipping_address || {
                    first_name: "",
                    last_name: "",
                    company: "",
                    province: "",
                    city: "",
                    postal_code: "",
                    country_code: "",
                    address_1: "",
                    address_2: "",
                    phone: "",
                  },
                  same_as_billing: "off",
                  billing_address: cart?.billing_address || {
                    first_name: "",
                    last_name: "",
                    company: "",
                    province: "",
                    city: "",
                    postal_code: "",
                    country_code: "",
                    address_1: "",
                    address_2: "",
                    phone: "",
                  },
                }
          }
        >
          {({ watch }) => {
            const shippingData = watch("shipping_address")
            const isDisabled =
              !customer?.addresses?.length &&
              !Object.values(shippingData).some((value) => value)
            return (
              <>
                <ShippingAddress
                  customer={customer || null}
                  checked={sameAsBilling}
                  onChange={toggleSameAsBilling}
                  cart={cart}
                />

                {!sameAsBilling && (
                  <BillingAddress 
                  cart={cart} 
                  customer={customer || null}
                  shippingAddress={shippingData}
                />
                )}

                <SubmitButton
                  className="bg-[#cd8973] text-white px-2 xl:px-3 py-1 xl:py-2 rounded-md text-xs xl:text-sm font-medium hover:bg-[#cd8973]/90 transition-colors mt-8"
                  isLoading={isPending}
                  isDisabled={isDisabled}
                  
                >
                  Next
                </SubmitButton>
                <ErrorMessage error={data?.error} />
              </>
            )
          }}
        </Form>
      ) : cart?.shipping_address ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          {/* Header with Change button */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-[#cd8973]">📍</span>
              Delivery Address
            </h3>
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                router.push("/checkout?step=delivery")
              }}
              className="text-[#cd8973] border-[#cd8973]/20 hover:bg-[#cd8973]/5 hover:border-[#cd8973]/30"
            >
              Change Address
            </Button>
          </div>

          {/* Address Display */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#cd8973]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#cd8973] text-sm font-medium">
                    {cart.shipping_address.first_name?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {[
                      cart.shipping_address.first_name,
                      cart.shipping_address.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </h4>
                  <div className="text-gray-800 space-y-1">
                    <p>
                      {[
                        cart.shipping_address.address_1,
                        cart.shipping_address.address_2,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p>
                      {[cart.shipping_address.city, cart.shipping_address.province]
                        .filter(Boolean)
                        .join(", ")} {cart.shipping_address.postal_code}
                    </p>
                    <p className="font-medium">
                      {cart.shipping_address.country_code?.toUpperCase()}
                    </p>
                    {cart.shipping_address.phone && (
                      <p className="text-sm text-gray-600">
                        📞 {cart.shipping_address.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            {sameAsBilling || cart.billing_address ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-medium">💳</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Billing Address</h4>
                    <div className="text-gray-800">
                      {sameAsBilling ? (
                        <p className="text-[#cd8973] font-medium">Same as delivery address</p>
                      ) : (
                        <div className="space-y-1">
                          <p>
                            {[
                              cart.billing_address?.first_name,
                              cart.billing_address?.last_name,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          </p>
                          <p>
                            {[
                              cart.billing_address?.address_1,
                              cart.billing_address?.address_2,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <p>
                            {[
                              cart.billing_address?.city,
                              cart.billing_address?.province,
                            ]
                              .filter(Boolean)
                              .join(", ")} {cart.billing_address?.postal_code}
                          </p>
                          <p className="font-medium">
                            {cart.billing_address?.country_code?.toUpperCase()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Addresses