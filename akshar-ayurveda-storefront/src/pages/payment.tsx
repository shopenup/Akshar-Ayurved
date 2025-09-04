import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PaymentPage() {
  const router = useRouter();

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      if (success) {
        router.push('/payment-success');
      } else {
        router.push('/payment-error');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Processing Payment - AKSHAR</title>
        <meta name="description" content="Processing your payment securely" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment</h1>
            <p className="text-gray-600 mb-6">
              Please wait while we securely process your payment...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
