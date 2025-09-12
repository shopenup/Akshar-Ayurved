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
      company: z.string().optional(),
      address_1: z.string().min(1),
      address_2: z.string().optional(),
      city: z.string().min(1),
      postal_code: z.string().min(1),
      province: z.string().optional(),
      country_code: z.string().min(2),
      phone: z.string().optional(),
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
          company: z.string().optional(),
          address_1: z.string().min(1),
          address_2: z.string().optional(),
          city: z.string().min(1),
          postal_code: z.string().min(1),
          province: z.string().optional(),
          country_code: z.string().min(2),
          phone: z.string().optional(),
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
              "transition-fontWeight duration-75 text-green-800 font-semibold",
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
             className={"text-green-600"}
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
                  <BillingAddress cart={cart} customer={customer || null} />
                )}

                <SubmitButton
                  className="bg-green-600 text-white px-2 xl:px-3 py-1 xl:py-2 rounded-md text-xs xl:text-sm font-medium hover:bg-green-700 transition-colors mt-8"
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
              <span className="text-green-600">📍</span>
              Delivery Address
            </h3>
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                router.push("/checkout?step=delivery")
              }}
              className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
            >
              Change Address
            </Button>
          </div>

          {/* Address Display */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 text-sm font-medium">
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
                  <div className="text-gray-600 space-y-1">
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
                      <p className="text-sm text-gray-500">
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
                    <div className="text-gray-600">
                      {sameAsBilling ? (
                        <p className="text-green-600 font-medium">Same as delivery address</p>
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
