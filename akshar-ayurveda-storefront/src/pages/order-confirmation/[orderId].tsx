import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@components/ui';
import { sdk } from '@lib/config';
import { getAuthHeaders, setAuthToken } from '@lib/shopenup/cookies';

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  variant: {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
      thumbnail?: string;
    };
  };
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  billing_address?: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    province: string;
    postal_code: string;
    country_code: string;
    phone: string;
  };
  shipping_address?: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    province: string;
    postal_code: string;
    country_code: string;
    phone: string;
  };
}

interface Address {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  postal_code?: string;
  country_code?: string;
  phone?: string;
  province?: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  amount: number;
}

interface PaymentCollection {
  id: string;
  status: string;
  amount: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  currency_code: string;
  email?: string;
  customer?: Customer;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  shipping_address?: Address;
  billing_address?: Address;
  shipping_methods?: ShippingMethod[];
  payment_collection?: PaymentCollection;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    try {
      if (!orderId) return;

      
      // Fetch order from the backend
      const orderData = await sdk.store.order
        .retrieve(orderId as string, {}, await getAuthHeaders())
        .then((order) => {
          return order;
        })
        .catch((error) => {
          throw error;
        });

      setOrder(orderData.order as Order);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadOrder();
      
      // Check and restore auth token if it was cleared during order placement
      const checkAndRestoreAuth = async () => {
        try {
          const authHeaders = await getAuthHeaders();
          if (!('authorization' in authHeaders) || !authHeaders.authorization) {
            // Try to restore from localStorage if available
            const storedToken = localStorage.getItem('_shopenup_jwt_backup');
            if (storedToken) {
              await setAuthToken(storedToken);
              localStorage.removeItem('_shopenup_jwt_backup');
            }
          }
        } catch (error) {
        }
      };
      
      checkAndRestoreAuth();
    }
  }, [orderId, loadOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="w-20 h-20 border-4 border-[#cd8973]/20 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-[#cd8973] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Your Order 🎉</h2>
            <p className="text-gray-600 mb-6">Please wait while we fetch your order details...</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-500">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Order confirmed</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-500">
              <div className="w-3 h-3 bg-[#cd8973] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <span>Fetching details</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-500">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <span>Preparing confirmation</span>
            </div>
          </div>
          
          <div className="mt-8 text-xs text-gray-400">
            This may take a few moments...
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">The order you&apos;re looking for could not be found.</p>
                        <Button variant="primary" onClick={() => router.push('/')}>
              Return to Home
            </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: (order.currency_code || 'INR').toUpperCase(),
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <>
      <Head>
        <title>Order Confirmation - AKSHAR</title>
        <meta name="description" content="Your order has been confirmed successfully" />
      </Head>

      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-4 sm:pb-8">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-green-100 mb-3 sm:mb-4">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 px-2">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Order Details</h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                  <div><span className="font-medium">Order ID:</span> <span className="break-all">#{order.id}</span></div>
                  <div><span className="font-medium">Date:</span> <span className="text-xs sm:text-sm">{formatDate(order.created_at)}</span></div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium">Status:</span> 
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full w-fit">
                      {order.status}
                    </span>
                  </div>
                  <div><span className="font-medium">Total:</span> <span className="font-semibold text-green-600">{formatCurrency(order.total)}</span></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Delivery Information</h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                  <div><span className="font-medium">Order Status:</span> {order.status}</div>
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    <span className="break-all">{order.email || order.customer?.email || 'Not available'}</span>
                  </div>
                  <div><span className="font-medium">Order Date:</span> <span className="text-xs sm:text-sm">{formatDate(order.created_at)}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Order Items</h2>
            
            <div className="space-y-3 sm:space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start sm:items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.variant?.product?.thumbnail ? (
                      <Image 
                        src={item.variant.product.thumbnail} 
                        alt={item.title} 
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-lg" 
                      />
                    ) : (
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base leading-tight">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{formatCurrency(item.unit_price * item.quantity)}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{formatCurrency(item.unit_price)} each</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-semibold text-gray-900">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Shipping Address</h3>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <p className="font-medium">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                  <p>{order.shipping_address.address_1}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.province}</p>
                  <p>{order.shipping_address.postal_code}</p>
                  <p className="mt-2">
                    <span className="font-medium">Phone:</span> {order.shipping_address.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Billing Address */}
            {order.billing_address && (
              <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Billing Address</h3>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <p className="font-medium">{order.billing_address.first_name} {order.billing_address.last_name}</p>
                  <p>{order.billing_address.address_1}</p>
                  <p>{order.billing_address.city}, {order.billing_address.province}</p>
                  <p>{order.billing_address.postal_code}</p>
                  <p className="mt-2">
                    <span className="font-medium">Phone:</span> {order.billing_address.phone}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 md:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3">What&apos;s Next?</h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-blue-800">
              <p>• You&apos;ll receive an email confirmation shortly</p>
              <p>• We&apos;ll notify you via SMS when your order ships</p>
              <p>• Track your order using your order ID: <span className="break-all font-medium">{order.id}</span></p>
              <p>• Order placed on: <span className="text-xs sm:text-sm">{formatDate(order.created_at)}</span></p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
            <Button variant="primary" onClick={() => router.push('/')} className="w-full sm:w-auto text-sm sm:text-base">
              Continue Shopping
            </Button>
            
            <Link href="/orders" passHref>
              <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                View All Orders
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => {
                navigator.clipboard.writeText(order.id);
                alert('Order ID copied to clipboard!');
              }}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Copy Order ID
            </Button>
          </div>

          {/* Support Information */}
          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600 px-2">
            <p>Need help? Contact our support team at</p>
            <p className="font-medium break-all">support@akshar.com</p>
            <p>or call us at <span className="font-medium">+91-1800-123-4567</span></p>
          </div>
        </div>
      </div>
    </>
  );
}
