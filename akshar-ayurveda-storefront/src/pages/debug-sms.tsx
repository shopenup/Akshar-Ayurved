import React, { useState } from 'react';
import Head from 'next/head';
import { testSMSServiceHeaders } from '../lib/services/sms-service';

export default function DebugSMSPage() {
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestHeaders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await testSMSServiceHeaders();
      setHeaders(result);
      console.log('Headers test result:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Headers test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Debug SMS Service - AKSHAR</title>
        <meta name="description" content="Debug SMS service headers and configuration" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Debug SMS Service</h1>
            
            <div className="space-y-6">
              {/* Environment Variables */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Environment Variables</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">NODE_ENV:</span>
                      <span className="ml-2 text-gray-900">{process.env.NODE_ENV || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">NEXT_PUBLIC_SHOPENUP_BACKEND_URL:</span>
                      <span className="ml-2 text-gray-900">{process.env.NEXT_PUBLIC_SHOPENUP_BACKEND_URL || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY:</span>
                      <span className="ml-2 text-gray-900">
                        {process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY 
                          ? `${process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY.substring(0, 20)}...` 
                          : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Headers Button */}
              <div>
                <button
                  onClick={handleTestHeaders}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Testing...' : 'Test Headers Generation'}
                </button>
              </div>

              {/* Headers Result */}
              {headers && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Generated Headers</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-900 overflow-x-auto">
                      {JSON.stringify(headers, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div>
                  <h2 className="text-xl font-semibold text-red-900 mb-3">Error</h2>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-900">{error}</p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Check that environment variables are loaded correctly</li>
                  <li>• Verify the publishable key is set</li>
                  <li>• Test headers generation to see what's being sent</li>
                  <li>• Check browser console for detailed logs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
