import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../components/ui';

export default function PaymentSuccessPage() {
  const orderDetails = {
    orderId: 'ORD' + Date.now(),
    amount: 1897.00,
    estimatedDelivery: '3-5 business days'
  };

  return (
    <>
      <Head>
        <title>Payment Successful - AKSHAR</title>
        <meta name="description" content="Payment completed successfully" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span className="text-gray-600">{orderDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount Paid:</span>
                  <span className="text-gray-600">₹{orderDetails.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Estimated Delivery:</span>
                  <span className="text-gray-600">{orderDetails.estimatedDelivery}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/orders" className="block">
                <Button variant="primary" className="w-full">
                  View My Orders
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-sm text-gray-500">
              <p>A confirmation email has been sent to your registered email address.</p>
              <p className="mt-2">You can track your order status in your account dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
