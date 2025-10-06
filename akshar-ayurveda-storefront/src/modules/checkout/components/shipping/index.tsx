"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { twJoin } from "tailwind-merge"
import { convertToLocale } from "@lib/util/money"
import ErrorMessage from "@modules/checkout/components/error-message"
import { Button } from "@components/Button"
import {
  UiRadio,
  UiRadioBox,
  UiRadioGroup,
  UiRadioLabel,
} from "@components/ui/Radio"
import { UiCheckboxCard } from "@components/ui/Checkbox"
import { useCartShippingMethods, useSetShippingMethod } from "hooks/cart"
import { StoreCart } from "@shopenup/types"

const Shipping = ({ cart }: { cart: StoreCart }) => {
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const isOpen = searchParams.get("step") === "shipping"

  const { data: availableShippingMethods } = useCartShippingMethods(cart.id)


  const { mutate, isPending } = useSetShippingMethod({ cartId: cart.id })
  const selectedShippingMethod = availableShippingMethods?.find(
    (method) => method.id === cart.shipping_methods?.[0]?.shipping_option_id
  )

  const handleSubmit = () => {
    router.push("/checkout?step=payment", { scroll: false })
  }

  const set = (id: string) => {
    mutate(
      { shippingMethodId: id },
      { onError: (err) => setError(err.message) }
    )
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

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
            3. Shipping
          </p>
        </div>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Button
              variant="link"
              onPress={() => {
                router.push("/checkout?step=shipping", { scroll: false })
              }}
               className={"text-[#cd8973]"}
            >
              Change
            </Button>
          )}
      </div>
      {isOpen ? (
        availableShippingMethods?.length === 0 ? (
          <div>
            <p className="text-red-900">
              There are no shipping methods available for your location. Please
              contact us for further assistance.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-4 mb-8">
              {availableShippingMethods?.map((option) => {
                const isSelected = selectedShippingMethod?.id === option.id
                return (
                  <UiCheckboxCard
                    key={option.id}
                    isSelected={isSelected}
                    onPress={() => set(option.id)}
                    className={`transition-all duration-300 hover:scale-[1.02] ${
                      isSelected ? 'ring-2 ring-[#cd8973]/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {option.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {option.name === 'Standard Shipping' ? 'Standard delivery service' : 'Express delivery service'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🚚</span>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 text-lg">
                            {convertToLocale({
                              amount: option.amount!,
                              currency_code: cart?.currency_code,
                            })}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 bg-[#cd8973] rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </UiCheckboxCard>
                )
              })}
            </div>

            <ErrorMessage error={error} />

            <Button
              onPress={handleSubmit}
              isLoading={isPending}
              isDisabled={!cart.shipping_methods?.[0]}
              className={"bg-[#cd8973] text-white px-2 xl:px-3 py-1 xl:py-2 rounded-md text-xs xl:text-sm font-medium hover:bg-[#cd8973]/90 transition-colors"}
            >
              Next
            </Button>
          </div>
        )
      ) : cart &&
        (cart.shipping_methods?.length ?? 0) > 0 &&
        selectedShippingMethod ? (
        <ul className="flex max-sm:flex-col flex-wrap gap-y-2 gap-x-28">
          <li className="text-grayscale-500">Shipping : </li>
          <li className="text-grayscale-600 ml-2">{selectedShippingMethod.name}</li>
        </ul>
      ) : null}
    </>
  )
}

export default Shipping
