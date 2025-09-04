import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Button, Card, Badge } from '../components/ui';
import { useAppContext } from '../context/AppContext';
import { useCart, useUpdateLineItem, useDeleteLineItem } from '../hooks/cart';
import { useCountryCode } from '../hooks/country-code';
import { convertToLocale } from '../lib/util/money';
import { HttpTypes } from '@shopenup/types';

export default function Cart() {
  const router = useRouter();
  const countryCode = useCountryCode() || 'in'; // Default to 'IN' if no country code found
  const { updateCartCount } = useAppContext();
  
  // Use the actual cart hooks - enable cart fetching even without country code
  const { data: cart, isLoading: cartLoading, error: cartError } = useCart({ 
    enabled: true // Always enable cart fetching
  });
  
  const updateLineItemMutation = useUpdateLineItem();
  const deleteLineItemMutation = useDeleteLineItem();

  // Update cart count in context when cart changes
  useEffect(() => {
    if (cart?.items) {
      const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      updateCartCount(totalQuantity);
    } else {
      updateCartCount(0);
    }
  }, [cart, updateCartCount]);

  const updateQuantity = async (lineId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateLineItemMutation.mutateAsync({ lineId, quantity: newQuantity });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (lineId: string) => {
    try {
      await deleteLineItemMutation.mutateAsync({ lineId });
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCheckout = () => {
    if (cart?.id && cart.items && cart.items.length > 0) {
      // Validate that all items have valid pricing
      const hasValidItems = cart.items.every(item => {
        const variant = item.variant;
        return variant?.calculated_price?.calculated_amount && variant.calculated_price.calculated_amount > 0;
      });
      
      if (hasValidItems) {
        router.push('/checkout');
      } else {
        // Show error if some items don't have valid pricing
        alert('Some items in your cart have invalid pricing. Please refresh the page and try again.');
      }
    } else {
      alert('Please add items to your cart before proceeding to checkout.');
    }
  };

  // Show loading state
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-green-600 mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading your cart...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <svg className="mx-auto h-24 w-24 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading cart</h2>
            <p className="text-gray-600 mb-8">Something went wrong while loading your cart. Please try again.</p>
            <Button variant="primary" size="lg" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart state
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven&apos;t added any items to your cart yet.</p>
            <Link href="/">
              <Button variant="primary" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">Review your items and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="space-y-6">
                {cart.items.map((item) => {
                  // Get product and variant information
                  const product = item.variant?.product;
                  const variant = item.variant;
                  
                  // Get pricing information
                  const price = variant?.calculated_price?.calculated_amount || 0;
                  const originalPrice = variant?.calculated_price?.original_amount || 0;
                  const currencyCode = variant?.calculated_price?.currency_code || 'INR';
                  
                  // Get product image
                  const image = product?.thumbnail || '';
                  const productName = product?.title || 'Product';
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-4 border-b border-gray-200 pb-6 last:border-b-0">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                          {image ? (
                            <Image
                              src={image}
                              alt={productName}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{productName}</h3>
                        {variant?.options && variant.options.length > 0 && (
                          <div className="text-sm text-gray-500 mb-2">
                            {variant.options.map((option, index) => (
                              <span key={index}>
                                {option.option_id}: {option.value}
                                {index < (variant.options?.length || 0) - 1 ? ', ' : ''}  
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg font-bold text-green-600">
                            {convertToLocale({ amount: price, currency_code: currencyCode })}
                          </span>
                          {originalPrice > price && (
                            <span className="text-sm text-gray-500 line-through">
                              {convertToLocale({ amount: originalPrice, currency_code: currencyCode })}
                            </span>
                          )}
                        </div>
                        {originalPrice > price && (
                          <Badge variant="danger" size="sm">
                            Save {convertToLocale({ 
                              amount: originalPrice - price, 
                              currency_code: currencyCode 
                            })}
                          </Badge>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updateLineItemMutation.isPending}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updateLineItemMutation.isPending}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={deleteLineItemMutation.isPending}
                        className="text-red-600 hover:text-red-800 p-2 disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {convertToLocale({ 
                      amount: cart.subtotal || 0, 
                      currency_code: cart.currency_code || 'INR' 
                    })}
                  </span>
                </div>
                
                {cart.discount_total && cart.discount_total > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{convertToLocale({ 
                        amount: cart.discount_total, 
                        currency_code: cart.currency_code || 'INR' 
                      })}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {cart.shipping_total && cart.shipping_total > 0 ? (
                      convertToLocale({ 
                        amount: cart.shipping_total, 
                        currency_code: cart.currency_code || 'INR' 
                      })
                    ) : (
                      <span className="text-green-600">Free</span>
                    )}
                  </span>
                </div>

                {cart.tax_total && cart.tax_total > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes</span>
                    <span className="font-medium">
                      {convertToLocale({ 
                        amount: cart.tax_total, 
                        currency_code: cart.currency_code || 'INR' 
                      })}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {convertToLocale({ 
                        amount: cart.total || 0, 
                        currency_code: cart.currency_code || 'INR' 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={!cart.id || !cart.items || cart.items.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 text-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  Proceed to Checkout
                </Button>
                
                <div className="grid grid-cols-1 gap-3">
                  <Link href="/">
                    <Button variant="secondary" size="lg" fullWidth>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Free shipping message */}
              {cart.subtotal && cart.subtotal < 500 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    Add {convertToLocale({ 
                      amount: 500 - cart.subtotal, 
                      currency_code: cart.currency_code || 'INR' 
                    })} more to get free shipping!
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
