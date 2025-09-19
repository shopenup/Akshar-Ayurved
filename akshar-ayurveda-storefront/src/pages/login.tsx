import React, { useState } from "react"
import { useRouter } from "next/router"
import { Button, Input, Card } from '../components/ui'
import { useAppContext } from '../context/AppContext'
import { useLogin } from '../hooks/customer'
import { EyeIcon, EyeOffIcon } from '../utils/icons'
import Link from 'next/link';
import { sdk } from '@lib/config';

interface LoginFormData {
  email: string;
  password: string;
}

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


  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const ensureWishlist = async (customerToken: string) => {
  let wishlist;

  try {
    const wishlistRes: { wishlist?: any } = await sdk.client.fetch(
      "/store/customers/me/wishlists",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || "",
          "Authorization": `Bearer ${customerToken}`,
        },
      }
    );

    wishlist = wishlistRes?.wishlist;
  } catch (err) {
    console.error("Error fetching wishlist:", err);
  }

  // Create if missing
  if (!wishlist) {
    try {
      const createRes: { wishlist?: any } = await sdk.client.fetch(
        "/store/customers/me/wishlists",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || "",
            "Authorization": `Bearer ${customerToken}`,
          },
        }
      );
      wishlist = createRes?.wishlist;
    } catch (err) {
      console.error("Error creating wishlist:", err);
    }
  }

  return wishlist;
};
  
  const syncGuestWishlist = async (token: string) => {
  const guestWishlist = JSON.parse(localStorage.getItem("guest_wishlist") || "[]")
  if (!guestWishlist.length) return

  try {
    await Promise.all(
      guestWishlist.map((variantId: string) =>
        sdk.client.fetch("/store/customers/me/wishlists/items", {
          method: "POST",
          body: { variant_id: variantId }, 
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || "",
            "Authorization": `Bearer ${token}`,
          },
        })
      )
    )
  } catch (err) {
    console.error("Wishlist sync failed:", err)
  }

  localStorage.removeItem("guest_wishlist")
}


  // const onSubmit = (values: z.infer<typeof loginFormSchema>) => {
  const onSubmit = (values: LoginFormData) => {
    mutate(
      { ...values, redirect_url: redirectUrl },
      {
        onSuccess:async (res) => {
          if (res.success) {
            setLoggedIn(true)

            //get Cookie from local storage
            const customerToken = getCookie('_shopenup_jwt');
           
             // Sync guest wishlist if token exists
            if (customerToken) {
              await ensureWishlist(customerToken);
              await syncGuestWishlist(customerToken)
            }

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