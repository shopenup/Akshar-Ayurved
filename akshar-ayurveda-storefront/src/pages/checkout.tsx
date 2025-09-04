import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Button } from '../components/ui';
import { useCart } from '../hooks/cart';
import { useCountryCode } from '../hooks/country-code';
import { CheckoutForm } from '@modules/checkout/components/checkout-form';
import CheckoutSummaryWrapper from '@modules/checkout/components/checkout-summary-wrapper';
import { withReactQueryProvider } from '@lib/util/react-query';
import { getCheckoutStep } from '@modules/cart/utils/getCheckoutStep';

// Step Navigation Component
const StepNavigation = ({ currentStep, onStepClick }: { 
  currentStep: string; 
  onStepClick: (step: string) => void;
}) => {
  const steps = [
    { step: 'email', label: 'Email', icon: '📧' },
    { step: 'delivery', label: 'Delivery', icon: '📍' },
    { step: 'shipping', label: 'Shipping', icon: '🚚' },
    { step: 'payment', label: 'Payment', icon: '💳' },
    { step: 'review', label: 'Review', icon: '✅' }
  ];

  // return (
  //   <div className="flex flex-wrap gap-2 mb-6">
  //     {steps.map((stepInfo) => (
  //       <button
  //         key={stepInfo.step}
  //         onClick={() => onStepClick(stepInfo.step)}
  //         className={`
  //           px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
  //           ${currentStep === stepInfo.step
  //             ? 'bg-green-600 text-white shadow-md'
  //             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  //           }
  //         `}
  //       >
  //         <span className="mr-2">{stepInfo.icon}</span>
  //         {stepInfo.label}
  //       </button>
  //     ))}
  //   </div>
  // );
};

function CheckoutPage() {
  const router = useRouter();
  const countryCode = useCountryCode() || 'in'; // Default to 'IN' if no country code found
  const { data: cart, isLoading: cartLoading, error: cartError } = useCart({ enabled: true });

  // Define checkout steps
  const checkoutSteps = [
    { step: 'email', label: 'Email', number: 1, icon: '📧' },
    { step: 'delivery', label: 'Delivery', number: 2, icon: '📍' },
    { step: 'shipping', label: 'Shipping', number: 3, icon: '🚚' },
    { step: 'payment', label: 'Payment', number: 4, icon: '💳' },
    { step: 'review', label: 'Review', number: 5, icon: '✅' }
  ];

  // Get current step
  const currentStep = cart ? getCheckoutStep(cart) : 'email';
  const currentStepIndex = checkoutSteps.findIndex(step => step.step === currentStep);

  // Handle step navigation
  const handleStepClick = (step: string) => {
    router.push(`/${countryCode}/checkout?step=${step}`);
  };

  // Show loading state
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-green-600 mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading checkout...</h2>
            <p className="text-gray-600">Please wait while we prepare your checkout experience.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (cartError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="mx-auto h-24 w-24 text-red-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading checkout</h2>
            <p className="text-gray-600 mb-8">Something went wrong while loading your checkout. Please try again.</p>
            <Button variant="primary" onClick={() => router.push('/cart')}>
              Back to Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart message
  // if (!cart || !cart.items || cart.items.length === 0) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //         <div className="text-center">
  //           <div className="mb-8">
  //             <div className="mx-auto h-24 w-24 text-gray-400">
  //               <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
  //               </svg>
  //             </div>
  //           </div>
  //           <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
  //           <p className="text-gray-600 mb-8">You need to add items to your cart before proceeding to checkout.</p>
  //           <div className="space-x-4">
  //             <Button variant="primary" onClick={() => router.push('/')}>
  //               Continue Shopping
  //             </Button>
  //             <Button variant="outline" onClick={() => router.push('/cart')}>
  //               View Cart
  //             </Button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <Head>
        <title>Checkout - AKSHAR</title>
        <meta name="description" content="Complete your purchase securely" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Secure Checkout</h1>
            <p className="text-gray-600 text-center">Complete your purchase in just a few steps</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
                {/* Step Navigation */}
                {/* <StepNavigation currentStep={currentStep} onStepClick={handleStepClick} /> */}

                {/* Enhanced Step Progress Indicator */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    {checkoutSteps.map((stepInfo, index) => {
                      const isActive = stepInfo.step === currentStep;
                      const isCompleted = index < currentStepIndex;
                      const isUpcoming = index > currentStepIndex;
                      
                      return (
                        <div key={stepInfo.step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all duration-200
                              ${isActive 
                                ? 'bg-green-600 text-white shadow-lg scale-110' 
                                : isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 text-gray-500'
                              }
                            `}>
                              {isCompleted ? '✓' : stepInfo.icon}
                            </div>
                            <span className={`
                              text-sm mt-2 font-medium transition-colors duration-200
                              ${isActive ? 'text-green-600' : isCompleted ? 'text-green-500' : 'text-gray-500'}
                            `}>
                              {stepInfo.label}
                            </span>
                          </div>
                          {index < checkoutSteps.length - 1 && (
                            <div className={`
                              flex-1 h-0.5 mx-4 transition-colors duration-200
                              ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                            `}></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step Progress Bar */}
                <div className="mb-8">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${((currentStepIndex + 1) / checkoutSteps.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Step {currentStepIndex + 1} of {checkoutSteps.length}: {checkoutSteps[currentStepIndex]?.label}
                  </p>
                </div>

                {/* Checkout Form */}
                <CheckoutForm 
                  countryCode={countryCode ?? ""}
                  step={router.query.step ? String(router.query.step) : ""}
                />
              </div>
            </div>

            {/* Checkout Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <CheckoutSummaryWrapper />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure Payment
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                SSL Encrypted
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Money Back Guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withReactQueryProvider(CheckoutPage);
