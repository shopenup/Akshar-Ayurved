import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card } from '../components/ui';

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "You can place an order by browsing our products, adding them to your cart, and proceeding to checkout. You'll need to create an account or sign in to complete your purchase."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit/debit cards, UPI, net banking, and cash on delivery (COD)."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days. Express shipping is available for faster delivery. Delivery times may vary based on your location."
    },
    {
      question: "Can I return or exchange products?",
      answer: "Yes, we accept returns within 30 days of delivery for products in original, unopened packaging. Please refer to our Return & Refund Policy for details."
    },
    {
      question: "Are your products authentic?",
      answer: "Yes, all our products are 100% authentic and sourced directly from authorized manufacturers. We are GMP certified and follow strict quality standards."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within India. We're working on expanding our international shipping options."
    }
  ];

  return (
    <>
      <Head>
        <title>Help & FAQ - AKSHAR</title>
        <meta name="description" content="Help and frequently asked questions for AKSHAR customers" />
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
                <span className="text-gray-900">Help & FAQ</span>
              </li>
            </ol>
          </nav>

          <Card className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Help & FAQ</h1>
            <p className="text-gray-600 mb-8">Find answers to commonly asked questions about our products and services.</p>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Still need help?</h2>
              <p className="text-gray-600 mb-4">If you couldn&apos;t find the answer you&apos;re looking for, please contact our customer support team.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
                    Contact Support
                  </button>
                </Link>
                <a href="mailto:support@akshar.com" className="text-green-600 hover:text-green-700">
                  Email: support@akshar.com
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
