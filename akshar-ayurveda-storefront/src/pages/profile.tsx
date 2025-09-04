import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Card, Badge, Input, Textarea } from '../components/ui';
import { useCustomer, useUpdateCustomer, useSignout } from '../hooks/customer';
import { useAppContext } from '../context/AppContext';
import { formatDate } from '@lib/util/date';

// Client-only wrapper to prevent hydration issues
function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Define order types
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    address2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billing: {
    address: string;
    address2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  notes?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: customer, isLoading: customerLoading } = useCustomer();
  const { setLoggedIn, resetAppState } = useAppContext();
  const updateCustomer = useUpdateCustomer();
  const signout = useSignout();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  // Redirect if not logged in
  React.useEffect(() => {
    if (!customerLoading && !customer) {
      router.push('/login');
    }
  }, [customer, customerLoading, router]);

  // Update form when customer data changes
  React.useEffect(() => {
    if (customer) {
      setEditForm({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        phone: customer.phone || ''
      });
    }
  }, [customer]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCustomer.mutateAsync(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleSignout = async () => {
    try {
      await signout.mutateAsync('in');
      
      // Don't clear cart data - only reset app state
      // clearAllCartData(); // Removed - cart data should be preserved
      
      // Reset all app state
      resetAppState();
      
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (customerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <>
      <Head>
        <title>My Profile - AKSHAR AYURVED</title>
        <meta name="description" content="Manage your profile, addresses, and view order history" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="outline" size="sm" className="mb-4">
                ← Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {customer.first_name}!
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8 border-b border-gray-200">
              {[
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'orders', label: 'Orders', icon: '📦' },
                { id: 'addresses', label: 'Addresses', icon: '📍' },
                { id: 'security', label: 'Security', icon: '🔒' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                {!isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      value={customer.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" disabled={updateCustomer.isPending}>
                      {updateCustomer.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <p className="text-gray-900">{customer.first_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <p className="text-gray-900">{customer.last_name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{customer.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="text-gray-900">{customer.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="text-gray-900">
                      {customer.created_at ? <ClientOnly fallback="Loading...">{formatDate(customer.created_at)}</ClientOnly> : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
                <Link href="/orders">
                  <Button variant="outline">View All Orders</Button>
                </Link>
              </div>

              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.172 13H4m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.172 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Order History</h3>
                <p className="text-gray-600 mb-4">Order history functionality coming soon...</p>
                <Link href="/products">
                  <Button>Browse Products</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Shipping Addresses</h2>
                <Button variant="outline">Add New Address</Button>
              </div>

              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="space-y-4">
                  {customer.addresses.map((address: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {address.first_name} {address.last_name}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {address.address_1}
                            {address.address_2 && <br />}
                            {address.address_2}
                          </p>
                          <p className="text-gray-600">
                            {address.city}, {address.province} {address.postal_code}
                          </p>
                          <p className="text-gray-600">{address.country_code}</p>
                          {address.phone && (
                            <p className="text-gray-600 mt-1">Phone: {address.phone}</p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                  <p className="text-gray-600 mb-4">Add your first shipping address to get started.</p>
                  <Button>Add Address</Button>
                </div>
              )}
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Password</h3>
                  <p className="text-gray-600 mb-4">Change your password to keep your account secure.</p>
                  <Button variant="outline">Change Password</Button>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                  <p className="text-gray-600 mb-4">Add an extra layer of security to your account.</p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Account Actions</h3>
                  <p className="text-gray-600 mb-4">Manage your account settings and preferences.</p>
                  <div className="flex space-x-3">
                    <Button variant="outline">Account Preferences</Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={handleSignout}
                      disabled={signout.isPending}
                    >
                      {signout.isPending ? 'Signing out...' : 'Sign Out'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
