import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Card, Badge } from '@components/ui';
import { useCartWithSync, useUpdateLineItem, useDeleteLineItem } from '@hooks/cart';
import { useCountryCode } from '@hooks/country-code';
import { convertToLocale } from '@lib/util/money';
import Breadcrumb from '@components/about/Breadcrumb';
import CartTable from '@components/cart/CartTable';
import CartTotals from '@components/cart/CartTotals';
import CouponCode from '@components/cart/CouponCode';

export default function Cart() {
  const router = useRouter();
  const countryCode = useCountryCode() || 'in'; // Default to 'IN' if no country code found
  
  // Use the synchronized cart hook - enable cart fetching even without country code
  const { data: cart, isLoading: cartLoading, error: cartError } = useCartWithSync({
    enabled: true // Always enable cart fetching
  });

  
  // Check localStorage and cookies for cart ID
  if (typeof window !== 'undefined') {
    const localStorageCartId = localStorage.getItem('_shopenup_cart_id');
    const cookieCartId = document.cookie
      .split('; ')
      .find(row => row.startsWith('_shopenup_cart_id='))
      ?.split('=')[1];
  }

  const itemsSubtotal = cart && cart.items && Array.isArray(cart.items)
    ? cart.items.reduce((sum, item) => sum + ((item.unit_price || 0) * (item.quantity || 0)), 0)
    : 0;
  
  const updateLineItemMutation = useUpdateLineItem();
  const deleteLineItemMutation = useDeleteLineItem();

  React.useEffect(() => {
    router.prefetch('/checkout').catch(() => {});
  }, [router]);

  // Cart count is automatically updated by useCartWithSync hook

  const updateQuantity = async (lineId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Prevent multiple rapid clicks
    if (updateLineItemMutation.isPending) return;

    try {
      await updateLineItemMutation.mutateAsync({ lineId, quantity: newQuantity });
    } catch {
    }
  };

  const removeItem = async (lineId: string) => {
    try {
      await deleteLineItemMutation.mutateAsync({ lineId });
    } catch {
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
      <div className="min-h-screen bg-gray-50 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb Section */}
      <Breadcrumb 
        title="Cart"
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Cart' }
        ]}
        imageSrc="/assets/images/bredcrumb-bg.jpg"
      />

      {/* Cart Page Section */}
      <div className="py-[90px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-[15px]">
          <div className="w-full">
            {/* Cart Table with mobile scroll */}
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-full px-4 sm:px-0">
                <CartTable
                  items={cart.items || []}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeItem}
                  isUpdating={updateLineItemMutation.isPending}
                />
              </div>
            </div>
            
            {/* Checkout Button */}
            <div className="flex justify-end mt-6 px-4 sm:px-0">
              <Button
                variant="primary"
                size="lg"
                onClick={handleCheckout}
                className="w-full sm:w-auto"
              >
                Proceed to Checkout
              </Button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}