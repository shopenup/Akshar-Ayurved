import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '../components/ui';
import { clearAllCartData, removeAuthToken, removeCartId } from '../lib/shopenup/cookies';

export default function ClearDataPage() {
  const router = useRouter();
  const [isCleared, setIsCleared] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const clearAllData = async () => {
    setIsClearing(true);
    try {
      // Use the proper cookie utility functions
      await clearAllCartData();
      
      // Also clear country code cookie
      document.cookie = "country-code=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Clear any remaining localStorage items
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      setIsCleared(true);
      console.log("✅ All Shopenup data cleared using proper utility functions!");
    } catch (error) {
      console.error("❌ Error clearing data:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const goToHome = () => {
    router.push('/');
  };

  const goToCheckout = () => {
    router.push('/checkout');
  };

  useEffect(() => {
    // Auto-clear on page load
    const autoClear = async () => {
      await clearAllData();
    };
    autoClear();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isClearing ? 'Clearing Data...' : isCleared ? 'Data Cleared Successfully!' : 'Preparing to Clear Data...'}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {isClearing 
              ? 'Please wait while we clear all cart and authentication data...'
              : isCleared 
                ? 'All cart and authentication data has been cleared. You can now test the guest checkout flow.'
                : 'Loading...'
            }
          </p>

          <div className="space-y-4">
            <Button 
              onClick={goToHome}
              className="w-full"
              disabled={isClearing}
            >
              Go to Home
            </Button>
            
            <Button 
              onClick={goToCheckout}
              variant="outline"
              className="w-full"
              disabled={isClearing}
            >
              Test Guest Checkout
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>Cookies cleared:</p>
            <ul className="text-left mt-2">
              <li>• _shopenup_jwt</li>
              <li>• _shopenup_cart_id</li>
              <li>• country-code</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
