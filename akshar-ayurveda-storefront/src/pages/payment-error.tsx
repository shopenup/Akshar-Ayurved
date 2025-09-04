import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../components/ui';

export default function PaymentErrorPage() {
  return (
    <>
      <Head>
        <title>Payment Failed - AKSHAR</title>
        <meta name="description" content="Payment was not completed" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-gray-600 mb-6">
              We&apos;re sorry, but your payment could not be processed. This could be due to insufficient funds, incorrect card details, or a temporary issue.
            </p>

            {/* Common Issues */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-yellow-800 mb-2">Common Issues:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Insufficient funds in your account</li>
                <li>• Incorrect card details or CVV</li>
                <li>• Card expired or blocked</li>
                <li>• Network connectivity issues</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/checkout" className="block">
                <Button variant="primary" className="w-full">
                  Try Again
                </Button>
              </Link>
              <Link href="/cart" className="block">
                <Button variant="outline" className="w-full">
                  Back to Cart
                </Button>
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-6 text-sm text-gray-500">
              <p>Need help? Contact our support team:</p>
              <p className="mt-1 font-medium">support@akshar.com</p>
              <p className="mt-1">+91 98765 43210</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
