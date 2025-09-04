import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card } from '../components/ui';

export default function ReturnRefundPage() {
  return (
    <>
      <Head>
        <title>Return & Refund Policy - AKSHAR</title>
        <meta name="description" content="Return and Refund Policy for AKSHAR Ayurvedic Products" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900">Return & Refund Policy</span>
              </li>
            </ol>
          </nav>

          <Card className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Return & Refund Policy</h1>
            <p className="text-gray-600 mb-6">Last updated: December 15, 2024</p>

            <div className="prose prose-lg max-w-none">
              <h2>1. Return Policy</h2>
              <p>We want you to be completely satisfied with your purchase. If you&apos;re not happy with your order, we accept returns within 30 days of delivery.</p>

              <h3>Eligible for Return</h3>
              <ul>
                <li>Products in original, unopened packaging</li>
                <li>Products with manufacturing defects</li>
                <li>Wrong products shipped</li>
                <li>Damaged products during shipping</li>
              </ul>

              <h3>Not Eligible for Return</h3>
              <ul>
                <li>Opened or used products</li>
                <li>Products past their expiry date</li>
                <li>Personal care items for hygiene reasons</li>
                <li>Custom or personalized orders</li>
              </ul>

              <h2>2. How to Return</h2>
              <ol>
                <li>Contact our customer support within 30 days of delivery</li>
                <li>Provide your order number and reason for return</li>
                <li>We&apos;ll provide you with a return authorization number</li>
                <li>Package the item securely with the return label</li>
                <li>Ship the package to our return address</li>
              </ol>

              <h2>3. Refund Process</h2>
              <p>Once we receive your return:</p>
              <ul>
                <li>We&apos;ll inspect the returned item within 3-5 business days</li>
                <li>If approved, we&apos;ll process your refund</li>
                <li>Refunds are issued to the original payment method</li>
                <li>Processing time: 5-10 business days</li>
              </ul>

              <h2>4. Shipping Costs</h2>
              <ul>
                <li>Free returns for defective or wrong items</li>
                <li>Customer pays return shipping for change of mind</li>
                <li>Original shipping costs are non-refundable</li>
              </ul>

              <h2>5. Exchange Policy</h2>
              <p>We offer exchanges for:</p>
              <ul>
                <li>Different sizes or variants</li>
                <li>Defective products</li>
                <li>Wrong products shipped</li>
              </ul>

              <h2>6. Contact Information</h2>
              <p>For returns and refunds, contact us at:</p>
              <p>Email: returns@akshar.com<br />
              Phone: +91 98765 43210<br />
              Address: 123 Ayurveda Street, Mumbai, Maharashtra 400001, India</p>

              <h2>7. Cancellation Policy</h2>
              <p>You can cancel your order:</p>
              <ul>
                <li>Before it ships: Full refund</li>
                <li>After shipping: Standard return process applies</li>
                <li>Contact us immediately for cancellation requests</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
