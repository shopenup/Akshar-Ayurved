"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { twJoin } from "tailwind-merge"
import { z } from "zod"
import { SubmitButton } from "@modules/common/components/submit-button"
import { Button } from "@components/Button"
import { Form, InputField } from "@components/Forms"
import { UiCloseButton, UiDialog, UiDialogTrigger } from "@components/Dialog"
import { UiModal, UiModalOverlay } from "@components/ui/Modal"
import { Icon } from "@components/Icon"
import { LoginForm } from "@modules/auth/components/LoginForm"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useCustomer } from "hooks/customer"
import { useSetEmail } from "hooks/cart"
import { StoreCart } from "@shopenup/types"

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
  const pathname = usePathname()

  const { data: customer, isPending: customerPending } = useCustomer()

  const isOpen = searchParams.get("step") === "email"

  const { mutate, isPending, data } = useSetEmail()

  // Ensure we have a valid country code
  const validCountryCode = countryCode || 'in'

  const onSubmit = (values: z.infer<typeof emailFormSchema>) => {
    console.log("🔍 Email form submitted with:", { email: values.email, countryCode: validCountryCode })
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
                "transition-fontWeight duration-75",
                isOpen && "font-semibold"
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
          defaultValues={{ email: "" }}
        >
          {({ watch }) => {
            const formValue = watch("email")
            return (
              <>
                <InputField
                  placeholder="Email"
                  name="email"
                  inputProps={{
                    autoComplete: "email",
                    title: "Enter a valid email address.",
                  }}
                  data-testid="shipping-email-input"
                />
                <SubmitButton
                  className="mt-8"
                  isLoading={isPending}
                  isDisabled={!formValue}
                >
                  Next
                </SubmitButton>
                <ErrorMessage error={data?.error} />
                
                {/* Optional login for guest users */}
                {isOpen && !customer && !customerPending && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    <p>
                      Already have an account?{" "}
                      <span className="text-blue-600 underline cursor-pointer">
                        Log in
                      </span>
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
          <li className="text-grayscale-500">Email</li>
          <li className="text-grayscale-600 break-all">{cart.email}</li>
        </ul>
      ) : null}
    </>
  )
}

export default Email
