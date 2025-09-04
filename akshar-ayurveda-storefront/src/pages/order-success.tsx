import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Button } from '../components/ui';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { orderId } = router.query;

  return (
    <>
      <Head>
        <title>Order Successful - AKSHAR</title>
        <meta name="description" content="Your order has been placed successfully" />
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

            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            
            {orderId && (
              <p className="text-gray-600 mb-4">
                Your order <span className="font-semibold">#{orderId}</span> has been confirmed.
              </p>
            )}
            
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. We've sent you a confirmation email and SMS with all the details.
            </p>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-3">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• You'll receive an email confirmation shortly</li>
                <li>• We'll notify you via SMS when your order ships</li>
                <li>• Estimated delivery: 3-5 business days</li>
                <li>• Track your order using the order ID above</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => router.push('/')}
              >
                Continue Shopping
              </Button>
              
              {orderId && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/order-confirmation/${orderId}`)}
                >
                  View Order Details
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/orders')}
              >
                View All Orders
              </Button>
            </div>

            {/* Support Information */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Need help? Contact our support team:</p>
              <p className="text-sm font-medium text-gray-900">support@akshar.com</p>
              <p className="text-sm text-gray-600">+91-1800-123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
