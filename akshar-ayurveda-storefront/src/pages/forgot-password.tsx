import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button, Input, Card } from '../components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>Forgot Password - AKSHAR</title>
        <meta name="description" content="Reset your password for AKSHAR account" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
            <p className="mt-2 text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <Card className="p-8">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    fullWidth
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Check Your Email</h3>
                <p className="text-gray-600 mb-6">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-green-600 hover:text-green-500"
                  >
                    try again
                  </button>
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link href="/login" className="text-green-600 hover:text-green-500 text-sm">
                Back to Login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
