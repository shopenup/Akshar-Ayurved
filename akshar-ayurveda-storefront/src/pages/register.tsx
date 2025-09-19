import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Input, Card } from '../components/ui';
import { useSignup } from '../hooks/customer';
import { useAppContext } from '../context/AppContext';
import { sdk } from "@lib/config";

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

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const { mutate: signup, isPending } = useSignup();
  const { setLoggedIn } = useAppContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Call the signup API
    signup({
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      password: formData.password,
    }, {
      onSuccess:async (result) => {
        if (result.success) {
          setLoggedIn(true);
           // Get token from cookie
          const customerToken = getCookie("_shopenup_jwt");

          if (customerToken) {
            await ensureWishlist(customerToken);
            await syncGuestWishlist(customerToken);
          }

          router.push('/?message=Registration successful! Welcome to AKSHAR AYURVED.');
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      },
      onError: (error) => {
        setError(error.message || 'Registration failed. Please try again.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-800">Create Account</h1>
          <p className="mt-2 text-gray-600">Join AKSHAR AYURVED today</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full"
              />
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-green-600 hover:text-green-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-green-600 hover:text-green-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isPending}
            >
              {isPending ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-green-600 hover:text-green-500 font-medium">
                  Sign in here
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
  );
}