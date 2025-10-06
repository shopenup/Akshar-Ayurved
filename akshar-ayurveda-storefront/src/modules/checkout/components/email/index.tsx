"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { twJoin } from "tailwind-merge"
import { z } from "zod"
import { SubmitButton } from "@modules/common/components/submit-button"
import { Button } from "@components/Button"
import { Form, InputField } from "@components/Forms"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useCustomer } from "hooks/customer"
import { useSetEmail } from "hooks/cart"
import { StoreCart } from "@shopenup/types"
import Link from "next/link"

export const emailFormSchema = z.object({
  email: z.string().min(3).email("Enter a valid email address."),
})

const Email = ({
  countryCode,
  cart,
}: {
  countryCode: string
  cart: StoreCart
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const { data: customer, isPending: customerPending } = useCustomer()

  const isOpen = searchParams.get("step") === "email"

  const { mutate, isPending, data } = useSetEmail()

  // Ensure we have a valid country code
  const validCountryCode = countryCode || 'in'

  const onSubmit = (values: z.infer<typeof emailFormSchema>) => {
    mutate(
      { ...values, country_code: validCountryCode },
      {
        onSuccess: (res) => {
          if (isOpen && res?.success) {
            router.push("/checkout?step=delivery", { scroll: false })
          }
        },
      }
    )
  }

  return (
    <>
      <div className="flex justify-between mb-6 md:mb-8">
        <div className="flex justify-between flex-wrap gap-5 flex-1">
          <div>
            <p
              className={twJoin(
                "transition-fontWeight duration-75 text-[#cd8973] font-semibold",
                isOpen && "font-semibold",
              )}
            >
              1. Email
            </p>
          </div>
        </div>
        {!isOpen && (
          <Button
            variant="link"
            onPress={() => {
              router.push("/checkout?step=email")
            }}
            className={"text-[#cd8973]"}
          >
            Change
          </Button>
        )}
      </div>
      {isOpen ? (
        <Form
          schema={emailFormSchema}
          onSubmit={onSubmit}
          formProps={{
            id: `email`,
          }}
          defaultValues={{ email: cart?.email || "" }}
        >
          {({ watch }) => {
            const formValue = watch("email")
            return (
              <>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    placeholder="Enter your email address"
                    name="email"
                    inputProps={{
                      autoComplete: "email",
                      title: "Enter a valid email address.",
                      className:"block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-300 focus:border-[#cd8973] focus:ring-[#cd8973] w-full shadow-sm hover:border-gray-400",
                    }}
                    data-testid="shipping-email-input"
                  />
                </div>
                <SubmitButton
                  isLoading={isPending}
                  isDisabled={!formValue}
                  className="bg-[#cd8973] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#cd8973]/90 transition-colors mt-4 w-full"
                >
                  Next
                </SubmitButton>
                <ErrorMessage error={data?.error} />
                
                {/* Optional login for guest users */}
                {isOpen && !customer && !customerPending && (
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>
                      Already have an account?{" "}
                      <Link href="/login" className="text-[#cd8973] hover:text-[#cd8973]/80 font-medium">
                        Login
                      </Link>
                      {" "}or continue as guest
                    </p>
                  </div>
                )}
              </>
            )
          }}
        </Form>
      ) : cart?.email ? (
        <ul className="flex max-sm:flex-col flex-wrap gap-y-2 gap-x-34">
          <li className="text-grayscale-500">Email :</li>
          <li className="text-grayscale-600 break-all ml-2">{cart.email}</li>
        </ul>
      ) : null}
    </>
  )
}

export default Email
