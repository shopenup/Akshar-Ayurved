import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card } from '../components/ui';

export default function StatusPage() {
  const services = [
    {
      name: 'Website',
      status: 'operational',
      description: 'Main website and e-commerce platform'
    },
    {
      name: 'Payment Processing',
      status: 'operational',
      description: 'Credit card, UPI, and COD payments'
    },
    {
      name: 'Order Processing',
      status: 'operational',
      description: 'Order management and fulfillment'
    },
    {
      name: 'Customer Support',
      status: 'operational',
      description: 'Email and phone support'
    },
    {
      name: 'Shipping',
      status: 'operational',
      description: 'Order delivery and tracking'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'outage':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'outage':
        return 'Major Outage';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      <Head>
        <title>System Status - AKSHAR</title>
        <meta name="description" content="Current system status and service updates for AKSHAR" />
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
                <span className="text-gray-900">System Status</span>
              </li>
            </ol>
          </nav>

          <Card className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">System Status</h1>
            <p className="text-gray-600 mb-8">Current status of our services and systems.</p>

            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                    {getStatusText(service.status)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Updates</h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-900">All Systems Operational</h3>
                      <p className="text-sm text-green-700">December 15, 2024 - All services are running normally.</p>
                    </div>
                    <span className="text-xs text-green-600">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h2>
              <p className="text-gray-600 mb-4">If you&apos;re experiencing issues, please contact our support team.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
                    Contact Support
                  </button>
                </Link>
                <Link href="/help">
                  <button className="border border-green-600 text-green-600 px-6 py-2 rounded-md hover:bg-green-50 transition-colors">
                    View Help Center
                  </button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
