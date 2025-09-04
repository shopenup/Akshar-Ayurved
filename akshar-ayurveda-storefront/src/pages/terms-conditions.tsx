import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card } from '../components/ui';

export default function TermsConditionsPage() {
  return (
    <>
      <Head>
        <title>Terms & Conditions - AKSHAR</title>
        <meta name="description" content="Terms and Conditions for AKSHAR Ayurvedic Products" />
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
                <span className="text-gray-900">Terms & Conditions</span>
              </li>
            </ol>
          </nav>

          <Card className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
            <p className="text-gray-600 mb-6">Last updated: December 15, 2024</p>

            <div className="prose prose-lg max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>

              <h2>2. Use License</h2>
              <p>Permission is granted to temporarily download one copy of the materials on AKSHAR&apos;s website for personal, non-commercial transitory viewing only.</p>

              <h3>This license shall automatically terminate if you violate any of these restrictions and may be terminated by AKSHAR at any time.</h3>

              <h2>3. Product Information</h2>
              <p>We strive to provide accurate product information, but we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.</p>

              <h2>4. Pricing and Payment</h2>
              <ul>
                <li>All prices are in Indian Rupees (INR)</li>
                <li>Prices are subject to change without notice</li>
                <li>Payment must be made at the time of order</li>
                <li>We accept various payment methods as displayed during checkout</li>
              </ul>

              <h2>5. Shipping and Delivery</h2>
              <ul>
                <li>Delivery times are estimates only</li>
                <li>We are not responsible for delays beyond our control</li>
                <li>Risk of loss and title pass to you upon delivery</li>
                <li>Shipping costs are calculated based on your location</li>
              </ul>

              <h2>6. Returns and Refunds</h2>
              <p>Please refer to our <Link href="/return-refund" className="text-green-600 hover:text-green-800">Return & Refund Policy</Link> for detailed information about returns and refunds.</p>

              <h2>7. User Account</h2>
              <p>If you create an account on our website, you are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>

              <h2>8. Prohibited Uses</h2>
              <p>You may not use our website:</p>
              <ul>
                <li>For any unlawful purpose</li>
                <li>To solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, or state regulations</li>
                <li>To infringe upon or violate our intellectual property rights</li>
                <li>To harass, abuse, insult, harm, or discriminate against others</li>
              </ul>

              <h2>9. Intellectual Property</h2>
              <p>The content on this website, including text, graphics, logos, and images, is the property of AKSHAR and is protected by copyright laws.</p>

              <h2>10. Limitation of Liability</h2>
              <p>AKSHAR shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our products or services.</p>

              <h2>11. Governing Law</h2>
              <p>These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>

              <h2>12. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on the website.</p>

              <h2>13. Contact Information</h2>
              <p>If you have any questions about these Terms & Conditions, please contact us at:</p>
              <p>Email: legal@akshar.com<br />
              Phone: +91 98765 43210<br />
              Address: 123 Ayurveda Street, Mumbai, Maharashtra 400001, India</p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
