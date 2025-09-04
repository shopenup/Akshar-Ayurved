import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../components';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
            <div className="w-24 h-1 bg-gray-300 mx-auto"></div>
          </div>

          {/* Content */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-gray-600 mb-8 text-lg">
            Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <Link href="/">
              <Button variant="primary" size="lg" fullWidth>
                Go Back Home
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" size="lg" fullWidth>
                Contact Support
              </Button>
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Popular Pages</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/products" className="text-green-600 hover:text-green-700">
                Products
              </Link>
              <Link href="/about" className="text-green-600 hover:text-green-700">
                About Us
              </Link>
              <Link href="/contact" className="text-green-600 hover:text-green-700">
                Contact
              </Link>
              <Link href="/help" className="text-green-600 hover:text-green-700">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
