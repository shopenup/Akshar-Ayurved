import React, { useState } from 'react';
import Head from 'next/head';
import { sendOrderConfirmationSMS } from '../lib/services/sms-service';

export default function TestSMSPage() {
  const [phone, setPhone] = useState('+917801806153');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleTestSMS = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const success = await sendOrderConfirmationSMS(phone, {
        order_id: `TEST${Date.now()}`,
        customer_name: 'Test Customer',
        total_amount: 1500,
        currency: 'INR',
        estimated_delivery: '3-5 business days',
        tracking_number: `TRK${Date.now()}`
      });
      
      if (success) {
        setResult('✅ SMS sent successfully!');
      } else {
        setResult('❌ Failed to send SMS');
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Test SMS - AKSHAR</title>
        <meta name="description" content="Test SMS functionality" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Test SMS Service</h1>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+917801806153"
                />
              </div>
              
              <button
                onClick={handleTestSMS}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Test SMS'}
              </button>
              
              {result && (
                <div className={`p-3 rounded-md ${
                  result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result}
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Test Message Content:</h3>
              <p className="text-sm text-gray-600">
                "Thank you for your order! Your order - TEST[timestamp] has been placed successfully. We'll notify you once it's shipped."
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
