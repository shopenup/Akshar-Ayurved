"use client"

import * as React from "react"
import { resetPassword } from "@lib/shopenup/customer"
import { Card, Input, Button } from "@components/ui"

export const ChangePasswordForm: React.FC<{
  email: string
  token: string
  customer?: boolean
}> = ({ email, token, customer }) => {
  const [isPending, setIsPending] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [isSuccess, setIsSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setMessage("")
    setIsSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get("new_password") as string
    const confirmPassword = formData.get("confirm_new_password") as string
    const currentPassword = formData.get("current_password") as string

    // Validation
    if (newPassword !== confirmPassword) {
      setMessage("Passwords must match")
      setIsPending(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long")
      setIsPending(false)
      return
    }

    if (customer && currentPassword === newPassword) {
      setMessage("New password must be different from the current password")
      setIsPending(false)
      return
    }

    try {
      // Prepare the form data for the API
      const values = {
        type: (customer ? "reset" : "forgot") as "reset" | "forgot",
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      } as const

      // Call the actual resetPassword API
      const result = await resetPassword({ email, token }, values)
      
      if (result.state === "success") {
        setMessage("Password reset successful! You can now log in with your new password.")
        setIsSuccess(true)
      } else if (result.state === "error") {
        setMessage(result.error || "Failed to reset password. Please try again.")
      }
    } catch (error) {
      console.error("Password reset error:", error)
      setMessage("An unexpected error occurred. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  // Show success message with redirect option
  if (isSuccess) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Password Reset Successful!</h2>
          <p className="text-gray-600">
            Your password has been successfully reset. You can now use your new password to log in.
          </p>
          <Button
            onClick={() => window.location.href = "/login"}
            variant="primary"
            size="lg"
            fullWidth
          >
            Go to Login
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-md ${isSuccess ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {message}
          </div>
        )}

        {customer && (
          <Input
            label="Current Password"
            type="password"
            name="current_password"
            required
            fullWidth
            placeholder="Enter your current password"
          />
        )}
        
        <Input
          label="New Password"
          type="password"
          name="new_password"
          required
          fullWidth
          placeholder="Enter your new password"
        />
        
        <Input
          label="Confirm New Password"
          type="password"
          name="confirm_new_password"
          required
          fullWidth
          placeholder="Confirm your new password"
        />
        
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isPending}
        >
          {isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Resetting...
            </div>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </Card>
  )
}
