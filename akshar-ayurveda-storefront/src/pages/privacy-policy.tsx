import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card } from '../components/ui';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy - AKSHAR</title>
        <meta name="description" content="Privacy Policy for AKSHAR Ayurvedic Products" />
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
                <span className="text-gray-900">Privacy Policy</span>
              </li>
            </ol>
          </nav>

          <Card className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            <p className="text-gray-600 mb-6">Last updated: December 15, 2024</p>

            <div className="prose prose-lg max-w-none">
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
              
              <h3>Personal Information</h3>
              <ul>
                <li>Name and contact information</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information</li>
                <li>Order history</li>
                <li>Communication preferences</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and updates</li>
                <li>Provide customer support</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Improve our products and services</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2>3. Information Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:</p>
              <ul>
                <li>Service providers who assist in our operations</li>
                <li>Payment processors for secure transactions</li>
                <li>Shipping partners for order delivery</li>
                <li>Legal requirements and law enforcement</li>
              </ul>

              <h2>4. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

              <h2>5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Lodge a complaint with supervisory authorities</li>
              </ul>

              <h2>6. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to enhance your browsing experience and analyze website usage.</p>

              <h2>7. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <p>Email: privacy@akshar.com<br />
              Phone: +91 98765 43210<br />
              Address: 123 Ayurveda Street, Mumbai, Maharashtra 400001, India</p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
