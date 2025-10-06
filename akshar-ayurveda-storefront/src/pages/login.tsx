import React, { useState, useEffect } from "react"
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
  const [googleMessage, setGoogleMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Handle Google OAuth callback results
  useEffect(() => {
    const { google_success, email, name, error } = router.query;
    
    if (google_success === 'true' && email) {
      setGoogleMessage({
        type: 'success',
        message: `Welcome back, ${name || email}! Google authentication successful.`
      });
      // Clear the message after 5 seconds
      setTimeout(() => setGoogleMessage(null), 5000);
    } else if (error) {
      let errorMessage = 'Google authentication failed.';
      switch (error) {
        case 'oauth_error':
          errorMessage = 'OAuth authentication was cancelled or failed.';
          break;
        case 'no_code':
          errorMessage = 'No authorization code received from Google.';
          break;
        case 'callback_error':
          errorMessage = 'Error processing Google authentication.';
          break;
      }
      setGoogleMessage({
        type: 'error',
        message: errorMessage
      });
      // Clear the message after 5 seconds
      setTimeout(() => setGoogleMessage(null), 5000);
    }
  }, [router.query]);


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
    <div className={`min-h-screen bg-gradient-to-br from-[#E7E4D1] to-[#D8BFA3] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${className || ''}`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#3C2415]">Welcome Back</h1>
          <p className="mt-2 text-[#5D4037]">Sign in to your AKSHAR AYURVED account</p>
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
                {/* Google OAuth Messages */}
                {googleMessage && (
                  <div className={`px-4 py-3 rounded-md ${
                    googleMessage.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-700' 
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {googleMessage.message}
                  </div>
                )}

                {/* Regular Login Error Messages */}
                {!data?.success && data?.message && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {data.message}
                  </div>
                )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#3C2415] mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="w-full text-black"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#3C2415] mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="w-full pr-10 text-black"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-[#5D4037] hover:text-[#3C2415]" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-[#5D4037] hover:text-[#3C2415]" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              {/* Google Login Button */}
              {/* <Button
                type="button"
                variant="custom"
                size="md"
                className="bg-white border border-[#5D4037] text-[#3C2415] hover:bg-[#5D4037] transition-all duration-300 py-2 px-4 font-semibold"
                onClick={() => {
                  // Google OAuth navigation
                  router.push('/api/auth/google');
                }}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button> */}

              <div className="text-sm">
                <Link href="/forgot-password" className="text-[#5D4037] hover:text-[#3C2415] underline">
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
              <p className="text-sm text-[#5D4037]">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-[#3C2415] hover:text-[#5D4037] font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </Card>

                  
      </div>
    </div>
  )
}