import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../components';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 - Server Error</title>
        <meta name="description" content="Something went wrong on our end." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* 500 Icon */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-red-300 mb-4">500</div>
            <div className="w-24 h-1 bg-red-300 mx-auto"></div>
          </div>

          {/* Content */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Server Error
          </h1>
          
          <p className="text-gray-600 mb-8 text-lg">
            Oops! Something went wrong on our end. We&apos;re working to fix this issue. Please try again in a few moments.
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            
            <Link href="/">
              <Button variant="outline" size="lg" fullWidth>
                Go Back Home
              </Button>
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Need Help?</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/contact" className="text-green-600 hover:text-green-700">
                Contact Support
              </Link>
              <Link href="/help" className="text-green-600 hover:text-green-700">
                Help Center
              </Link>
              <Link href="/status" className="text-green-600 hover:text-green-700">
                System Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
