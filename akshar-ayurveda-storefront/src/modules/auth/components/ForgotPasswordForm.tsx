"use client"

import * as React from "react"
import { Form, InputField } from "@components/Forms"
import { SubmitButton } from "@modules/common/components/submit-button"
import { forgotPassword } from "@lib/shopenup/customer"
import { LocalizedButtonLink } from "@components/LocalizedLink"
import { z } from "zod"

const forgotPasswordFormSchema = z.object({
  email: z.string().min(3).email(),
})

export const ForgotPasswordForm: React.FC = () => {
  const [formState, setFormState] = React.useState<{
    state: "initial" | "success" | "error"
    error?: string
  }>({ state: "initial" })
  
  const [isPending, startTransition] = React.useTransition()

  const onSubmit = async (values: z.infer<typeof forgotPasswordFormSchema>) => {
    startTransition(() => {
      forgotPassword(null, values)
        .then((result) => {
          setFormState(result)
        })
        .catch(() => {
          setFormState({
            state: "error",
            error: "An unexpected error occurred. Please try again."
          })
        })
    })
  }

  if (formState.state === "success") {
    return (
      <>
        <h1 className="text-xl md:text-2xl mb-8">
          Your password is waiting for you!
        </h1>
        <div className="mb-8">
          <p>
            We&apos;ve sent you an email with further instructions on retrieving
            your account.
          </p>
        </div>
        <LocalizedButtonLink href="/" isFullWidth>
          Back to home page
        </LocalizedButtonLink>
      </>
    )
  }

  return (
    <Form onSubmit={onSubmit} schema={forgotPasswordFormSchema}>
      <h1 className="text-xl md:text-2xl mb-8">Forgot password?</h1>
      <div className="mb-8">
        <p>
          Enter your email address below and we will send you instructions on
          how to reset your password.
        </p>
      </div>
      <InputField
        placeholder="Email"
        name="email"
        className="flex-1 mb-8"
        type="email"
      />
      {formState.state === "error" && (
        <p className="text-red-primary text-sm">{formState.error}</p>
      )}
      <SubmitButton isFullWidth isLoading={isPending}>Reset your password</SubmitButton>
    </Form>
  )
}
