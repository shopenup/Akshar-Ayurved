import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button, Card, Badge } from '../../components/ui';
import { formatDate } from '@lib/util/date';
import { sdk } from '@lib/config';
import { getAuthHeaders } from '@lib/shopenup/cookies';
import { HttpTypes } from '@shopenup/types';
import { FaMapMarkerAlt, FaCreditCard, FaBoxOpen, FaCheckCircle, FaTruck } from 'react-icons/fa';

// Use Shopenup StoreOrder type directly
// type Order = HttpTypes.StoreOrder;

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<HttpTypes.StoreOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const authHeaders = await getAuthHeaders();
        const isLoggedIn = 'authorization' in authHeaders && authHeaders.authorization;
        if (!isLoggedIn) {
          setError('Please log in to view your order details');
          setIsLoading(false);
          return;
        }
        const response = await sdk.client.fetch<{ order: HttpTypes.StoreOrder }>(
          `/store/orders/${id}`,
          {
            headers: authHeaders,
            cache: 'no-store',
          }
        );
        if (response.order) {
          setOrder(response.order);
          console.log("Order-details-page",response.order);
        } else {
          setError('Order not found.');
        }
      } catch (error) {
        setError('Failed to load order details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      case 'processing':
        return 'Processing';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  // Timeline steps for order progress
  const timelineSteps = [
    { key: 'authorized', label: 'Payment Authorized', icon: <FaCreditCard /> },
    { key: 'captured', label: 'Payment Captured', icon: <FaCreditCard /> },
    { key: 'fulfilled', label: 'Fulfilled', icon: <FaBoxOpen /> },
    { key: 'shipped', label: 'Shipped', icon: <FaTruck /> },
    { key: 'delivered', label: 'Delivered', icon: <FaCheckCircle /> },
  ];

  function getCurrentStep(payment_status: string, fulfillment_status: string) {
    if (fulfillment_status === 'delivered') return 4;
    if (fulfillment_status === 'shipped') return 3;
    if (fulfillment_status === 'fulfilled') return 2;
    if (payment_status === 'captured') return 1;
    if (payment_status === 'authorized') return 0;
    return 0;
  }

  return (
    <>
      <Head>
        <title>Order Details - AKSHAR</title>
        <meta name="description" content="View your order details" />
      </Head>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 space-y-8">
          {/* Status Timeline Stepper */}
          {order && (
            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              {timelineSteps.map((step, idx) => {
                const current = getCurrentStep(order.payment_status, order.fulfillment_status);
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center mb-1 text-lg z-10 ${idx <= current ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{step.icon}</div>
                    <span className={`text-xs font-medium ${idx <= current ? 'text-green-700' : 'text-gray-400'}`}>{step.label}</span>
                    {idx < timelineSteps.length - 1 && (
                      <div className={`absolute top-4 left-1/2 w-full h-1 ${idx < current ? 'bg-green-600' : 'bg-gray-200'}`} style={{zIndex: 0, marginLeft: '16px', marginRight: '-16px'}}></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Addresses Section */}
          {order && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center mb-2 text-gray-700">
                  <FaMapMarkerAlt className="mr-2" /> <span className="font-semibold">Delivery address</span>
                </div>
                <div className="text-sm text-gray-900 font-medium">
                  {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                </div>
                <div className="text-sm text-gray-600">{order.shipping_address?.address_1}</div>
                {order.shipping_address?.address_2 && <div className="text-sm text-gray-600">{order.shipping_address.address_2}</div>}
                <div className="text-sm text-gray-600">{order.shipping_address?.city}, {order.shipping_address?.province} {order.shipping_address?.postal_code}</div>
                <div className="text-sm text-gray-600">{order.shipping_address?.phone}</div>
              </div>
              {/* Billing Address */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center mb-2 text-gray-700">
                  <FaCreditCard className="mr-2" /> <span className="font-semibold">Billing address</span>
                </div>
                <div className="text-sm text-gray-900 font-medium">
                  {order.billing_address?.first_name} {order.billing_address?.last_name}
                </div>
                <div className="text-sm text-gray-600">{order.billing_address?.address_1}</div>
                {order.billing_address?.address_2 && <div className="text-sm text-gray-600">{order.billing_address.address_2}</div>}
                <div className="text-sm text-gray-600">{order.billing_address?.city}, {order.billing_address?.province} {order.billing_address?.postal_code}</div>
                <div className="text-sm text-gray-600">{order.billing_address?.phone}</div>
              </div>
            </div>
          )}

          {/* Order Items Section */}
          {order && order.items && order.items.length > 0 && order.items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between mb-2">
              <div className="flex items-center space-x-4 flex-1">
                {((item.thumbnail || item.variant?.product?.thumbnail) ?? undefined) && (
                  <img src={(item.thumbnail || item.variant?.product?.thumbnail) ?? undefined} alt={item.title} className="w-24 h-24 object-cover rounded-lg border" />
                )}
                <div>
                  <div className="text-lg font-semibold text-gray-900">{item.title}</div>
                  {item.variant_title && <div className="text-sm text-gray-600">Variant: {item.variant_title}</div>}
                  <div className="text-xs text-gray-500 mt-1">Quantity: {item.quantity}</div>
                </div>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="text-xl font-bold text-gray-900">₹{item.total?.toFixed(2) ?? (item.unit_price * item.quantity).toFixed(2)}</div>
              </div>
            </div>
          ))}

          {/* Payment Summary Section */}
          {order && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center mb-2 text-gray-700">
                <FaCreditCard className="mr-2" /> <span className="font-semibold">Payment</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="mb-2 md:mb-0">
                  <div className="text-sm text-gray-600">Payment Status: <span className="font-semibold text-gray-900">{order.payment_status}</span></div>
                  <div className="text-sm text-gray-600">Fulfillment Status: <span className="font-semibold text-gray-900">{order.fulfillment_status}</span></div>
                </div>
                <div className="text-right">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal?.toFixed(2) ?? order.total?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Shipping</span>
                    <span>₹{order.shipping_total?.toFixed(2) ?? (order.shipping_methods?.[0]?.amount?.toFixed(2) ?? '0.00')}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t pt-2">
                    <span>Total</span>
                    <span>₹{order.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-4">
            <Link href="/orders">
              <Button variant="outline">Back to Orders</Button>
            </Link>
            {order && order.status === 'delivered' && (
              <Link href={`/review/${order.id}`}>
                <Button variant="outline">Write Review</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
