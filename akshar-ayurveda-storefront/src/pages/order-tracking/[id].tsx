import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Card, Badge } from '../../components/ui';

export default function OrderTrackingPage() {
  const router = useRouter();
  const { id } = router.query;

  // Sample tracking data
  const trackingData = {
    orderId: id as string,
    trackingNumber: 'TRK789456123',
    status: 'shipped',
    estimatedDelivery: '2024-12-18',
    currentLocation: 'Mumbai, Maharashtra',
    carrier: 'Blue Dart Express',
    timeline: [
      {
        id: 1,
        status: 'Order Placed',
        description: 'Your order has been confirmed',
        date: '2024-12-15',
        time: '10:30 AM',
        completed: true
      },
      {
        id: 2,
        status: 'Processing',
        description: 'Your order is being prepared for shipment',
        date: '2024-12-15',
        time: '02:15 PM',
        completed: true
      },
      {
        id: 3,
        status: 'Shipped',
        description: 'Your order has been shipped',
        date: '2024-12-16',
        time: '09:45 AM',
        completed: true
      },
      {
        id: 4,
        status: 'In Transit',
        description: 'Package is on its way to you',
        date: '2024-12-17',
        time: '11:20 AM',
        completed: true
      },
      {
        id: 5,
        status: 'Out for Delivery',
        description: 'Package is out for delivery',
        date: '2024-12-18',
        time: '08:30 AM',
        completed: false
      },
      {
        id: 6,
        status: 'Delivered',
        description: 'Package has been delivered',
        date: '2024-12-18',
        time: '02:00 PM',
        completed: false
      }
    ]
  };

  const orderDetails = {
    items: [
      { name: 'START Weight Gainer', quantity: 2, price: 799 },
      { name: 'Organic Ashwagandha Powder', quantity: 1, price: 299 }
    ],
    total: 1897.00,
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 98765 43210'
    }
  };

  return (
    <>
      <Head>
        <title>Order Tracking - AKSHAR</title>
        <meta name="description" content="Track your order status" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/orders">
              <Button variant="outline" size="sm" className="mb-4">
                ← Back to Orders
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
            <p className="text-gray-600 mt-2">
              Track your order #{trackingData.orderId}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tracking Timeline */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Tracking Timeline</h2>
                  <Badge variant="info">Shipped</Badge>
                </div>

                <div className="space-y-6">
                  {trackingData.timeline.map((step, index) => (
                    <div key={step.id} className="flex items-start">
                      {/* Timeline Line */}
                      <div className="flex flex-col items-center mr-4">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          step.completed 
                            ? 'bg-green-600 border-green-600' 
                            : 'bg-white border-gray-300'
                        }`} />
                        {index < trackingData.timeline.length - 1 && (
                          <div className={`w-0.5 h-12 mt-2 ${
                            step.completed ? 'bg-green-600' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>

                      {/* Timeline Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-semibold ${
                            step.completed ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.status}
                          </h3>
                          <div className="text-sm text-gray-500">
                            {step.date} at {step.time}
                          </div>
                        </div>
                        <p className={`text-sm ${
                          step.completed ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Order Details Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Tracking Info */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tracking Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-medium">{trackingData.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Carrier</p>
                      <p className="font-medium">{trackingData.carrier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Location</p>
                      <p className="font-medium">{trackingData.currentLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estimated Delivery</p>
                      <p className="font-medium">{trackingData.estimatedDelivery}</p>
                    </div>
                  </div>
                </Card>

                {/* Order Summary */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} (Qty: {item.quantity})
                        </span>
                        <span className="font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{orderDetails.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Shipping Address */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900">{orderDetails.shippingAddress.name}</p>
                    <p>{orderDetails.shippingAddress.address}</p>
                    <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}</p>
                    <p>{orderDetails.shippingAddress.pincode}</p>
                    <p className="mt-2">{orderDetails.shippingAddress.phone}</p>
                  </div>
                </Card>

                {/* Support */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    If you have any questions about your order, our support team is here to help.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Contact Support
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Live Chat
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
