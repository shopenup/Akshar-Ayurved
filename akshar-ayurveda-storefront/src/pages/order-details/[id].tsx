import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button, Card, Badge } from '../../components/ui';
import { formatDate } from '@lib/util/date';
import { sdk } from '@lib/config';
import { getAuthHeaders, getCompleteHeaders } from '@lib/shopenup/cookies';
import { HttpTypes } from '@shopenup/types';
// Custom icon components with smaller default sizes
const MapMarkerIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

const CreditCardIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
  </svg>
);

const BoxIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const TruckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L16 7.586A1 1 0 0015.414 7H14z" />
  </svg>
);

const UserIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const EnvelopeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

const PhoneIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
);

const CalendarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const ReceiptIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6zm2 2a1 1 0 000 2h8a1 1 0 100-2H6zm0 3a1 1 0 000 2h4a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const ShippingIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const TagIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);  

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
        const completeHeaders = await getCompleteHeaders();
        const response = await sdk.client.fetch<{ order: HttpTypes.StoreOrder }>(
          `/store/orders/${id}`,
          {
            headers: completeHeaders,
            cache: 'no-store',
          }
        );
        if (response.order) {
          setOrder(response.order);
          console.log("Order-details-page", response.order);
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
    { key: 'authorized', label: 'Payment Authorized', icon: <CreditCardIcon /> },
    // { key: 'captured', label: 'Payment Captured', icon: <CreditCardIcon /> },
    // { key: 'fulfilled', label: 'Fulfilled', icon: <BoxIcon /> },
    { key: 'shipped', label: 'Shipped', icon: <TruckIcon /> },
    { key: 'delivered', label: 'Delivered', icon: <CheckCircleIcon /> },
  ];

  function getCurrentStep(payment_status: string, fulfillment_status: string) {
    if (fulfillment_status === 'delivered') return 2;
    if (fulfillment_status === 'shipped') return 1;
    // if (fulfillment_status === 'fulfilled') return 2;
    // if (payment_status === 'captured') return 1;
    if (payment_status === 'authorized') return 0;
    return 0;
  }

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Order Details - AKSHAR</title>
          <meta name="description" content="Loading your order details" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading order details...</h2>
            <p className="text-gray-600 mt-2">Please wait while we fetch your order information</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - AKSHAR</title>
          <meta name="description" content="Error loading order details" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BoxIcon className="text-red-600 text-xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Order</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Link href="/orders">
                <Button variant="outline" className="w-full">
                  Back to Orders
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Order Details - AKSHAR</title>
        <meta name="description" content="View your order details" />
      </Head>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 space-y-8">
          {/* Order Header */}
          {order && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Details</h1>
                  <div className="flex items-center justify-between text-sm text-gray-600 gap-60">
                    <div className="flex items-center">
                      <TagIcon className="mr-2 w-6 h-6" />
                      <span className="font-medium">Order ID:</span> #{order.id}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 w-6 h-6" />
                      <span className="font-medium">Order Date:</span> {formatDate(order.created_at)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <UserIcon className="mr-2 w-6 h-6" />
                  <div>
                    <span className="font-medium">Customer:</span><br />
                    {order.customer?.first_name && order.customer?.last_name 
                      ? `${order.customer.first_name} ${order.customer.last_name}`
                      : order.shipping_address?.first_name && order.shipping_address?.last_name
                      ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
                      : order.email || 'Not available'
                    }
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <EnvelopeIcon className="mr-2 w-6 h-6" />
                  <div>
                    <span className="font-medium">Email:</span><br />
                    {order.email || order.customer?.email || 'Not provided'}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="mr-2 w-6 h-6" />
                  <div>
                    <span className="font-medium">Phone:</span><br />
                    {order.shipping_address?.phone || order.customer?.phone || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Timeline Stepper */}
          {order && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h2>
              <div className="flex items-center justify-between">
              {timelineSteps.map((step, idx) => {
                const current = getCurrentStep(order.payment_status, order.fulfillment_status);
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                      <div className={`rounded-full w-8 h-8 flex items-center justify-center mb-2 text-sm z-10 ${idx <= current ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{step.icon}</div>
                      <span className={`text-sm font-medium ${idx <= current ? 'text-green-700' : 'text-gray-400'}`}>{step.label}</span>
                    {idx < timelineSteps.length - 1 && (
                        <div className={`absolute top-5 left-1/2 w-full h-1 ${idx < current ? 'bg-green-600' : 'bg-gray-200'}`} style={{zIndex: 0, marginLeft: '20px', marginRight: '-20px'}}></div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          )}

          {/* Addresses Section */}
          {order && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4 text-gray-700">
                  <MapMarkerIcon className="mr-2 text-green-600 w-6 h-6" /> 
                  <span className="font-semibold text-lg">Delivery Address</span>
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-gray-900">
                  {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                  </div>
                  <div className="text-gray-600">{order.shipping_address?.address_1}</div>
                  {order.shipping_address?.address_2 && (
                    <div className="text-gray-600">{order.shipping_address.address_2}</div>
                  )}
                  <div className="text-gray-600">
                    {order.shipping_address?.city}, {order.shipping_address?.province} {order.shipping_address?.postal_code}
                  </div>
                  <div className="text-gray-600">{order.shipping_address?.country_code}</div>
                  {order.shipping_address?.phone && (
                    <div className="flex items-center text-gray-600 mt-2">
                      <PhoneIcon className="mr-2 w-6 h-6" />
                      {order.shipping_address.phone}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Billing Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4 text-gray-700">
                  <CreditCardIcon className="mr-2 text-blue-600 w-6 h-6" /> 
                  <span className="font-semibold text-lg">Billing Address</span>
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-gray-900">
                  {order.billing_address?.first_name} {order.billing_address?.last_name}
                  </div>
                  <div className="text-gray-600">{order.billing_address?.address_1}</div>
                  {order.billing_address?.address_2 && (
                    <div className="text-gray-600">{order.billing_address.address_2}</div>
                  )}
                  <div className="text-gray-600">
                    {order.billing_address?.city}, {order.billing_address?.province} {order.billing_address?.postal_code}
                  </div>
                  <div className="text-gray-600">{order.billing_address?.country_code}</div>
                  {order.billing_address?.phone && (
                    <div className="flex items-center text-gray-600 mt-2">
                      <PhoneIcon className="mr-2 w-6 h-6" />
                      {order.billing_address.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items Section */}
          {order && order.items && order.items.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4 flex-1">
                {((item.thumbnail || item.variant?.product?.thumbnail) ?? undefined) && (
                        <img 
                          src={(item.thumbnail || item.variant?.product?.thumbnail) ?? undefined} 
                          alt={item.title} 
                          className="w-20 h-20 object-cover rounded-lg border" 
                        />
                      )}
                      <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900">{item.title}</div>
                        {item.variant_title && (
                          <div className="text-sm text-gray-600 mt-1">Variant: {item.variant_title}</div>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Quantity: {item.quantity}</span>
                          <span>Unit Price: ₹{item.unit_price?.toFixed(2)}</span>
                        </div>
                </div>
              </div>
              <div className="text-right mt-4 md:mt-0">
                      <div className="text-xl font-bold text-gray-900">
                        ₹{item.total?.toFixed(2) ?? (item.unit_price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment & Shipping Summary Section */}
          {order && (
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4 text-gray-700">
                  <ReceiptIcon className="mr-2 text-green-600 w-6 h-6" /> 
                  <span className="font-semibold text-lg">Payment Summary</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">
                      ₹{(() => {
                        // Debug: Log all possible price fields
                        console.log('Order price fields:', {
                          subtotal: order.subtotal,
                          total: order.total,
                          items: order.items?.map(item => ({
                            unit_price: item.unit_price,
                            quantity: item.quantity,
                            total: item.total
                          })),
                          raw_order: order
                        });
                        
                        // Calculate from items if available
                        if (order.items && order.items.length > 0) {
                          const itemsTotal = order.items.reduce((sum, item) => {
                            return sum + (item.total || (item.unit_price * item.quantity));
                          }, 0);
                          return itemsTotal.toFixed(2);
                        }
                        
                        // Fallback to subtotal or total
                        return (order.subtotal || order.total || 0).toFixed(2);
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-semibold">
                      ₹{(() => {
                        // Debug: Log shipping fields
                        console.log('Shipping fields:', {
                          shipping_total: order.shipping_total,
                          shipping_methods: order.shipping_methods,
                          order_total: order.total,
                          order_subtotal: order.subtotal,
                          raw_order: order
                        });
                        
                        // Try different shipping fields
                        if (order.shipping_total) {
                          return order.shipping_total.toFixed(2);
                        }
                        if (order.shipping_methods?.[0]?.amount) {
                          return order.shipping_methods[0].amount.toFixed(2);
                        }
                        if ((order as any).shipping) {
                          return (order as any).shipping.toFixed(2);
                        }
                        if ((order as any).shipping_cost) {
                          return (order as any).shipping_cost.toFixed(2);
                        }
                        if ((order as any).shipping_amount) {
                          return (order as any).shipping_amount.toFixed(2);
                        }
                        if ((order as any).delivery_cost) {
                          return (order as any).delivery_cost.toFixed(2);
                        }
                        if ((order as any).shipping_fee) {
                          return (order as any).shipping_fee.toFixed(2);
                        }
                        
                        // Calculate from total - subtotal
                        if (order.total && order.subtotal) {
                          const calculatedShipping = order.total - order.subtotal;
                          return calculatedShipping.toFixed(2);
                        }
                        
                        // Default fallback
                        return '0.00';
                      })()}
                    </span>
                  </div>
                  {order.tax_total && order.tax_total > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-semibold">₹{order.tax_total.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">
                      ₹{(() => {
                        // Calculate subtotal from items
                        let subtotal = 0;
                        if (order.items && order.items.length > 0) {
                          subtotal = order.items.reduce((sum, item) => {
                            return sum + (item.total || (item.unit_price * item.quantity));
                          }, 0);
                        } else {
                          subtotal = order.subtotal || 0;
                        }
                        
                        const shipping = order.shipping_total 
                          ? order.shipping_total 
                          : order.shipping_methods?.[0]?.amount 
                          ? order.shipping_methods[0].amount
                          : (order as any).shipping
                          ? (order as any).shipping
                          : (order as any).shipping_cost
                          ? (order as any).shipping_cost
                          : (order as any).shipping_amount
                          ? (order as any).shipping_amount
                          : (order as any).delivery_cost
                          ? (order as any).delivery_cost
                          : (order as any).shipping_fee
                          ? (order as any).shipping_fee
                          : 0;
                        const tax = order.tax_total || 0;
                        return (subtotal + shipping + tax).toFixed(2);
                      })()}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Status:</span>
                    <Badge variant={getStatusColor(order.payment_status)}>
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              {/* <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4 text-gray-700">
                  <ShippingIcon className="mr-2 text-blue-600 w-6 h-6" /> 
                  <span className="font-semibold text-lg">Shipping Information</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fulfillment Status:</span>
                    <Badge variant={getStatusColor(order.fulfillment_status)}>
                      {order.fulfillment_status}
                    </Badge>
                  </div>
                  {order.shipping_methods && order.shipping_methods.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Shipping Method:</span><br />
                      {order.shipping_methods[0].name || 'Standard Shipping'}
                    </div>
                  )}
                  {order.shipping_address?.company && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Company:</span><br />
                      {order.shipping_address.company}
                    </div>
                  )}
                </div>
              </div> */}
            </div>
          )}

          {/* Additional Order Information */}
          {order && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Order ID:</span>
                  <span className="ml-2 text-gray-900">#{order.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Currency:</span>
                  <span className="ml-2 text-gray-900">{order.currency_code || 'INR'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Order Date:</span>
                  <span className="ml-2 text-gray-900">{formatDate(order.created_at)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <span className="ml-2 text-gray-900">{formatDate(order.updated_at)}</span>
                </div>
                {order.metadata && Object.keys(order.metadata).length > 0 && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600">Additional Notes:</span>
                    <div className="mt-1 text-gray-900">
                      {Object.entries(order.metadata).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link href="/orders">
              <Button variant="outline" className="flex items-center">
                ← Back to Orders
              </Button>
            </Link>
            {order && order.status === 'delivered' && (
              <Link href={`/review/${order.id}`}>
                <Button variant="outline" className="flex items-center">
                  Write Review
                </Button>
              </Link>
            )}
            {order && order.status === 'processing' && (
              <Button variant="outline" className="flex items-center" disabled>
                Order Processing
              </Button>
            )}
            {order && order.status === 'shipped' && (
              <Link href={`/order-tracking/${order.id}`}>
                <Button variant="outline" className="flex items-center">
                  Track Order
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
