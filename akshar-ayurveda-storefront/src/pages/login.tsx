import React, { useState } from "react"
import { useRouter } from "next/router"
import { Button, Input, Card } from '../components/ui'
import { useAppContext } from '../context/AppContext'
import { z } from "zod"
import { useLogin } from '../hooks/customer'
import { EyeIcon, EyeOffIcon } from '../utils/icons'
import Link from 'next/link';

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

interface LoginFormProps {
  className?: string
  redirectUrl?: string
  handleCheckout?: (values: { email: string }) => void
}

export default function LoginForm({ className, redirectUrl, handleCheckout }: LoginFormProps) {
  const { isPending, data, mutate } = useLogin()
  const router = useRouter()
  const { setLoggedIn } = useAppContext()
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = (values: z.infer<typeof loginFormSchema>) => {
    mutate(
      { ...values, redirect_url: redirectUrl },
      {
        onSuccess: (res) => {
          if (res.success) {
            setLoggedIn(true)
            if (handleCheckout) {
              handleCheckout({ email: values.email })
            } else {
              router.push(res.redirectUrl || redirectUrl || "/")
            }
          }
        },
      }
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${className || ''}`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-800">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your AKSHAR AYURVED account</p>
        </div>

        <Card className="p-8">
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            onSubmit({
              email: formData.get('email') as string,
              password: formData.get('password') as string,
            })
          }} className="space-y-6">
            {!data?.success && data?.message && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {data.message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="text-green-600 hover:text-green-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isPending}
            >
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-green-600 hover:text-green-500 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-green-600 hover:text-green-500 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}