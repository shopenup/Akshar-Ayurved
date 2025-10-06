import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Badge } from '@components/ui';
import { formatDate } from '@lib/util/date';
import { sdk } from '@lib/config';
import { getAuthHeaders, getCompleteHeaders } from '@lib/shopenup/cookies';
import { HttpTypes } from '@shopenup/types';
import OrderProductReview from '@components/orders/OrderProductReview';
import { convertToLocale } from "@lib/util/money"
import { TaxBreakdown } from '@components/ui/tax-display';
import { ProductTaxBreakdown, OrderTaxSummary } from '@components/ui/product-tax-breakdown';
import { OrderItemsTaxTable } from '@components/ui/order-items-tax-table';
// import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import Breadcrumb from '@components/about/Breadcrumb';
// Custom icon components with smaller default sizes
const MapMarkerIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" style={{color: '#cd8973'}}>
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

const ReceiptIcon = ({ className = "w-4 h-4" }: { className?: string } ) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" style={{color: '#cd8973'}}>
    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6zm2 2a1 1 0 000 2h8a1 1 0 100-2H6zm0 3a1 1 0 000 2h4a1 1 0 100-2H6z" clipRule="evenodd" />
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
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

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
          `/store/orders/${id}?fields=+customer_id`,
          {
            headers: completeHeaders,
            cache: 'no-store',
          }
        );
        if (response.order) {
          setOrder(response.order);
        } else {
          setError('Order not found.');
        }
      } catch {
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

  // Helper function to determine if reviews should be available
  const canReviewProducts = (fulfillmentStatus: string | null | undefined) => {
    if (!fulfillmentStatus) return false;
    const reviewableStatuses = ['delivered', 'fulfilled', 'completed'];
    return reviewableStatuses.includes(fulfillmentStatus.toLowerCase());
  };

  // Handle review submission
  const handleReviewSubmitted = () => {
    setReviewRefreshTrigger(prev => prev + 1);
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#cd8973'}}></div>
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
      <Breadcrumb title="Order Details" crumbs={[{ label: 'Home', href: '/' }, { label: 'Order Details' }]} imageSrc="/assets/images/bredcrumb-bg.jpg" />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 space-y-8">
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
                      <div className={`rounded-full w-8 h-8 flex items-center justify-center mb-2 text-sm z-10 ${idx <= current ? 'text-white' : 'bg-gray-200 text-gray-400'}`} style={idx <= current ? {backgroundColor: '#cd8973'} : {}}>{step.icon}</div>
                      <span className={`text-sm font-medium ${idx <= current ? 'text-gray-700' : 'text-gray-400'}`} style={idx <= current ? {color: '#cd8973'} : {}}>{step.label}</span>
                    {idx < timelineSteps.length - 1 && (
                        <div className={`absolute top-5 left-1/2 w-full h-1 ${idx < current ? '' : 'bg-gray-200'}`} style={{zIndex: 0, marginLeft: '20px', marginRight: '-20px', backgroundColor: idx < current ? '#cd8973' : ''}}></div>
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
                  <MapMarkerIcon className="mr-2 w-6 h-6"  /> 
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

          {/* Order Items Section - Table Layout */}
          {order && order.items && order.items.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items & Tax Breakdown</h2>
              <OrderItemsTaxTable 
                order={order}
                showDetailedBreakdown={true}
              />
            </div>
          )}

          {/* Product Reviews Section */}
          {order && order.items && order.items.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Reviews</h2>
              <div className="space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      {((item.thumbnail || item.variant?.product?.thumbnail) ?? undefined) && (
                        <Image 
                          src={(item.thumbnail || item.variant?.product?.thumbnail) ?? ''} 
                          alt={item.title} 
                          width={60}
                          height={60}
                          className="w-15 h-15 object-cover rounded-lg border" 
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-gray-900">{item.title}</div>
                        {item.variant_title && (
                          <div className="text-sm text-gray-600 mt-1">Variant: {item.variant_title}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Review Section */}
                    {item.variant?.product?.id && (
                      <div>
                        {canReviewProducts(order.fulfillment_status) ? (
                          <OrderProductReview
                            productId={item.variant.product.id}
                            productTitle={item.title}
                            orderId={order.id}
                            customerName={{
                              firstName: order.shipping_address?.first_name || order.billing_address?.first_name || 'Customer',
                              lastName: order.shipping_address?.last_name || order.billing_address?.last_name || 'User'
                            }}
                            customerId={order?.customer_id || ''}
                            onReviewSubmitted={handleReviewSubmitted}
                            refreshTrigger={reviewRefreshTrigger}
                          />
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Reviews available after delivery</span>
                                <p className="text-xs text-gray-500 mt-1">
                                  You&apos;ll be able to review this product once your order is delivered
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Current status: {order.fulfillment_status || 'Unknown'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary Section */}
          {order && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center mb-6 text-gray-700">
                <ReceiptIcon className="mr-2 w-6 h-6"  /> 
                <span className="font-semibold text-lg">Payment Summary</span>
              </div>
              
              {/* Payment Status */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                    <div className="mt-1">
                      <Badge variant={getStatusColor(order.payment_status)} className="text-sm">
                        {order.payment_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-600">Order Total:</span>
                    <div className="text-2xl font-bold mt-1" style={{color: '#cd8973'}}>
                      {convertToLocale({ amount: order.total ?? 0, currency_code: order.currency_code })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Collection Details */}
              {order.payment_collections && order.payment_collections.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Payment Details</h4>
                  {order.payment_collections.map((payment, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <div className="font-medium text-gray-900">
                            {convertToLocale({ amount: payment.amount || 0, currency_code: payment.currency_code })}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Authorized:</span>
                          <div className="font-medium text-gray-900">
                            {convertToLocale({ amount: payment.authorized_amount || 0, currency_code: payment.currency_code })}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Captured:</span>
                          <div className="font-medium text-gray-900">
                            {convertToLocale({ amount: payment.captured_amount || 0, currency_code: payment.currency_code })}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <div className="mt-1">
                            <Badge variant={payment.status === 'authorized' ? 'info' : payment.status === 'completed' ? 'success' : 'warning'}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Order Summary</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items ({order.items?.length || 0}):</span>
                      <span className="font-medium">
                        {convertToLocale({ amount: order.original_item_subtotal || order.subtotal || 0, currency_code: order.currency_code })}
                      </span>
                    </div>
                    {(order as any).discount_subtotal && (order as any).discount_subtotal > 0 && (
                      <div className="flex justify-between" style={{color: '#cd8973'}}>
                        <span>Discount:</span>
                        <span className="font-medium">-{convertToLocale({ amount: (order as any).discount_subtotal, currency_code: order.currency_code })}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium">
                        {convertToLocale({ amount: order.shipping_subtotal || 0, currency_code: order.currency_code })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">
                        {convertToLocale({ amount: order.tax_total || 0, currency_code: order.currency_code })}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2" style={{color: '#cd8973'}}>
                      <span>Total:</span>
                      <span>{convertToLocale({ amount: order.total || 0, currency_code: order.currency_code })}</span>
                    </div>
                  </div>
                </div>
              </div>
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
