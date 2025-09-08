import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button, Card, Badge } from '../components/ui';
import { formatDate } from '@lib/util/date';
import { sdk } from '@lib/config';
import { getAuthHeaders } from '@lib/shopenup/cookies';
import { HttpTypes } from '@shopenup/types';

// Use Shopenup StoreOrder type directly
type Order = HttpTypes.StoreOrder;
type OrderItem = NonNullable<HttpTypes.StoreOrder['items']>[0];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load orders from Shopenup API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get auth headers
        const authHeaders = await getAuthHeaders();
        const isLoggedIn = 'authorization' in authHeaders && authHeaders.authorization;

        if (!isLoggedIn) {
          setError('Please log in to view your orders');
          setIsLoading(false);
          return;
        }

        // Fetch orders from Shopenup API
        const response = await sdk.client.fetch<{ orders: HttpTypes.StoreOrder[] }>(
          '/store/orders',
          {
            headers: authHeaders,
            cache: "no-store",
          }
        );

        if (response.orders) {
          setOrders(response.orders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const TABS = [
    { key: 'all', label: 'All Orders' },
    { key: 'active', label: 'Active Orders' },
    { key: 'placed', label: 'Placed Orders' },
  ];

  // Enhanced status color for fulfillment status
  const getFulfillmentStatusColor = (status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'fulfilled':
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Enhanced status text for fulfillment status
  const getFulfillmentStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      case 'fulfilled':
        return 'Fulfilled';
      case 'processing':
        return 'Processing';
      case 'cancelled':
        return 'Cancelled';
      case 'not_fulfilled':
        return 'not_fulfilled';
      default:
        return 'Unknown';
    }
  };

  // Tab filtering logic
  const filteredOrders =
    activeTab === 'all'
      ? orders
      : activeTab === 'active'
        ? orders.filter(
          (order) =>
            order.fulfillment_status !== 'delivered' &&
            order.fulfillment_status !== 'canceled'
        )
        : orders.filter((order) => order.fulfillment_status === 'delivered');

  return (
    <>
      <Head>
        <title>My Orders - AKSHAR</title>
        <meta name="description" content="View and track your orders" />
      </Head>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
            {/* Enhanced Tabs */}
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading orders</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <Badge variant={getFulfillmentStatusColor(order.fulfillment_status)}>
                        {getFulfillmentStatusText(order.fulfillment_status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Placed on {formatDate(order.created_at)}
                    </p>
                    <div className="text-sm text-gray-800 mb-2">
                      {order.items && order.items.length > 0 && (
                        <>
                          {order.items[0].title} (Qty: {order.items[0].quantity})
                          {order.items.length > 1 && (
                            <span className="text-gray-500"> +{order.items.length - 1} more</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 min-w-[160px]">
                    <div className="text-lg font-bold text-gray-900">
                      ₹{order.total?.toFixed(2)}
                    </div>
                    {order.item_total && (
                      <div className="text-sm text-gray-500">
                        ₹{order.item_total?.toFixed(2)}
                      </div>
                    )}
                    <Link href={`/order-details/${order.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === 'all'
                      ? "You haven't placed any orders yet."
                      : `You don't have any ${activeTab} orders.`}
                  </p>
                  <Link href="/">
                    <Button variant="primary">Start Shopping</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
