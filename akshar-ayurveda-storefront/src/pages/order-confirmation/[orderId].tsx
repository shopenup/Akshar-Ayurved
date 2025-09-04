import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '@components/ui';
import { sdk } from '@lib/config';
import { getAuthHeaders } from '@lib/shopenup/cookies';

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
  shipping_address?: any;
  billing_address?: any;
  shipping_methods?: any[];
  payment_collection?: any;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      if (!orderId) return;

      console.log('🔍 Loading order:', orderId);
      
      // Fetch order from the backend
      const orderData = await sdk.store.order
        .retrieve(orderId as string, {}, await getAuthHeaders())
        .then((order) => {
          console.log('✅ Order loaded successfully:', order);
          return order;
        })
        .catch((error) => {
          console.error('❌ Error loading order:', error);
          throw error;
        });

      setOrder(orderData.order as Order);
      console.log('📦 Order data structure:', JSON.stringify(orderData.order, null, 2));
      setLoading(false);
    } catch (error) {
      console.error('Error loading order:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading order details...</h2>
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
          <p className="text-gray-600 mb-8">The order you're looking for could not be found.</p>
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

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><span className="font-medium">Order ID:</span> #{order.id}</div>
                  <div><span className="font-medium">Date:</span> {formatDate(order.created_at)}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {order.status}
                    </span>
                  </div>
                  <div><span className="font-medium">Total:</span> {formatCurrency(order.total)}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Delivery Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><span className="font-medium">Order Status:</span> {order.status}</div>
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {order.email || order.customer?.email || order.billing_address?.email || order.shipping_address?.email || 'Not available'}
                  </div>
                  <div><span className="font-medium">Order Date:</span> {formatDate(order.created_at)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {item.variant?.product?.thumbnail ? (
                      <img src={item.variant.product.thumbnail} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(item.unit_price * item.quantity)}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(item.unit_price)} each</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                <div className="text-sm text-gray-600 space-y-1">
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
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                <div className="text-sm text-gray-600 space-y-1">
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
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• You'll receive an email confirmation shortly</p>
              <p>• We'll notify you via SMS when your order ships</p>
              <p>• Track your order using your order ID: {order.id}</p>
              <p>• Order placed on: {formatDate(order.created_at)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={() => router.push('/')}>
              Continue Shopping
            </Button>
            
            <Link href="/orders" passHref>
              <Button variant="outline">
                View All Orders
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => {
                navigator.clipboard.writeText(order.id);
                alert('Order ID copied to clipboard!');
              }}
            >
              Copy Order ID
            </Button>
          </div>

          {/* Support Information */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Need help? Contact our support team at</p>
            <p className="font-medium">support@akshar.com</p>
            <p>or call us at <span className="font-medium">+91-1800-123-4567</span></p>
          </div>
        </div>
      </div>
    </>
  );
}
