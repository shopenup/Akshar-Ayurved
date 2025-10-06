import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Card, Badge, Input, Modal } from '@components/ui';
import Breadcrumb from '@components/about/Breadcrumb';
import CountrySelect from '@modules/checkout/components/country-select';
import StateSelect from '@modules/checkout/components/state-select';
import { useCart } from '@hooks/cart';


import { useCustomer, useUpdateCustomer, useSignout, useAddressMutation, useDeleteCustomerAddress } from '@hooks/customer';
import { toast } from 'sonner';
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



export default function ProfilePage() {
  const router = useRouter();
  const { data: customer, isLoading: customerLoading } = useCustomer();
  const { data: cart } = useCart({ enabled: true });
  const { resetAppState } = useAppContext();
  const updateCustomer = useUpdateCustomer();
  const signout = useSignout();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  // Address add form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    postal_code: '',
    province: '',
    country_code: 'IN',
    phone: ''
  });
  const [countryCode, setCountryCode] = useState('IN');
  const addAddress = useAddressMutation();
  const updateAddress = useAddressMutation(editingAddressId || undefined);
  const deleteAddress = useDeleteCustomerAddress();
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean; id?: string}>({ open: false });

  // Redirect if not logged in
  useEffect(() => {
    if (!customerLoading && !customer) {
      router.push('/login');
    }
  }, [customer, customerLoading, router]);

  // Update form when customer data changes
  useEffect(() => {
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
    } catch {
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
    } catch {
    }
  };


  if (customerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cc8972] mx-auto"></div>
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

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full px-0 sm:px-6 lg:px-8">
          <Breadcrumb 
            title="My Profile"
            crumbs={[{ label: 'Home', href: '/' }, { label: 'My Profile' }]}
            imageSrc="/assets/images/bredcrumb-bg.jpg"
          />
         

       

          {/* Navigation Tabs */}
          <div className="mb-4 mt-6 sm:mt-10">
            <div className="flex space-x-1 rounded-lg p-1 mb-6 container mx-auto">
              {[
                { key: 'profile', label: 'Profile' },
                // { key: 'orders', label: 'Orders' },
                { key: 'addresses', label: 'Addresses' },
                // { key: 'security', label: 'Security' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-3 sm:px-4 rounded-md w-[50%] sm:w-[12.5%] text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-[#C88370] text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
              
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="p-0 overflow-hidden container mx-auto">
              {/* Decorative header */}
              <div className="h-20" />

              <div className="p-6 -mt-14">
                {/* Header with avatar, name and actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full ring-4 ring-white bg-[#cc8972] flex items-center justify-center text-white text-xl sm:text-2xl font-semibold shadow-md">
                      {(customer.first_name?.[0] || 'A').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">
                        {customer.first_name} {customer.last_name}
                      </h2>
                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <Badge className="bg-[#cc8972]/10 text-[#cc8972] border border-[#cc8972]/30 text-xs w-fit">Member</Badge>
                        <span className="text-gray-500 text-xs sm:text-sm">Joined{' '}
                          {customer.created_at ? (
                            <ClientOnly fallback="Loading...">{formatDate(customer.created_at)}</ClientOnly>
                          ) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                {!isEditing && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <Badge className="bg-gray-100 text-gray-700 border border-gray-200 text-xs break-all">
                        {customer.email}
                      </Badge>
                      <Button variant="outline" onClick={() => setIsEditing(true)} size="sm" className="w-full sm:w-auto">
                    Edit Profile
                  </Button>
                    </div>
                )}
              </div>

                {/* Body */}
                <div className="mt-6 sm:mt-8">
              {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-6">
                      {/* Match display layout: info cards grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Left: editable details in cards */}
                        <div className="lg:col-span-3 lg:col-start-1 space-y-4 sm:space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="p-3 sm:p-4 rounded-lg border border-gray-200 bg-white">
                              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">First Name</p>
                      <Input
                        className="text-gray-900 w-full"
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                placeholder="Enter your first name"
                        required
                      />
                    </div>
                            <div className="p-3 sm:p-4 rounded-lg border border-gray-200 bg-white">
                              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Last Name</p>
                      <Input
                        className="text-gray-900 w-full"
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                placeholder="Enter your last name"
                        required
                      />
                    </div>
                            <div className="p-3 sm:p-4 rounded-lg border border-gray-200 bg-white sm:col-span-2">
                              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Email</p>
                              <Input value={customer.email} disabled className="bg-gray-50 text-gray-900 w-full" />
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                            <div className="p-3 sm:p-4 rounded-lg border border-gray-200 bg-white sm:col-span-2">
                              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Phone</p>
                    <Input
                      className="text-gray-900 w-full"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom right actions */}
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button type="submit" disabled={updateCustomer.isPending} className="w-full sm:w-auto">
                      {updateCustomer.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: key details */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-4 rounded-lg border border-gray-200 bg-white">
                            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">First Name</p>
                            <p className="text-gray-900 font-medium">{customer.first_name}</p>
                    </div>
                          <div className="p-4 rounded-lg border border-gray-200 bg-white">
                            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Last Name</p>
                            <p className="text-gray-900 font-medium">{customer.last_name}</p>
                    </div>
                          <div className="p-4 rounded-lg border border-gray-200 bg-white">
                            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Email</p>
                            <p className="text-gray-900 font-medium break-all">{customer.email}</p>
                  </div>
                          <div className="p-4 rounded-lg border border-gray-200 bg-white">
                            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Phone</p>
                            <p className="text-gray-900 font-medium">{customer.phone || 'Not provided'}</p>
                  </div>
                  </div>
                  </div>
                </div>
              )}
                </div>
              </div>
            </Card>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <Card className="p-6 container mx-auto">
              {/* Delete confirmation modal */}
              <Modal className='mt-40'
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false })}
                title="Delete address?"
                size="sm"
              >
                <p className="text-sm text-gray-600 mb-4">This action cannot be undone.</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>Cancel</Button>
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700 "
                    onClick={async () => {
                      if (!deleteDialog.id) return
                      try {
                        await deleteAddress.mutateAsync(deleteDialog.id)
                        setDeleteDialog({ open: false })
                        toast.success('Address deleted')
                      } catch (err: unknown) {
                        toast.error((err as Error)?.message || 'Failed to delete address')
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Modal>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Shipping Addresses</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingAddressId(null)
                    setIsAddingAddress((v) => !v)
                  }}
                >
                  {isAddingAddress ? 'Close' : 'Add New Address'}
                </Button>
              </div>

              {(isAddingAddress || editingAddressId) && (
                <div className="mb-8">
                  <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                      <span className="text-xs text-gray-500">Fields marked with <span className="text-red-600">*</span> are required</span>
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          const payload = {
                            first_name: addressForm.first_name,
                            last_name: addressForm.last_name,
                            company: addressForm.company || undefined,
                            address_1: addressForm.address_1,
                            address_2: addressForm.address_2 || undefined,
                            city: addressForm.city,
                            postal_code: addressForm.postal_code,
                            province: addressForm.province || undefined,
                            country_code: addressForm.country_code,
                            phone: addressForm.phone || undefined,
                          }

                          if (editingAddressId) {
                            await updateAddress.mutateAsync(payload)
                          } else {
                            await addAddress.mutateAsync(payload)
                          }

                          setIsAddingAddress(false)
                          setEditingAddressId(null)
                          setCountryCode('IN')
                          setAddressForm({
                            first_name: '',
                            last_name: '',
                            company: '',
                            address_1: '',
                            address_2: '',
                            city: '',
                            postal_code: '',
                            province: '',
                            country_code: 'IN',
                            phone: ''
                          });
                        } catch {
                        }
                      }}
                      className="space-y-8"
                    >
                      {/* Name */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Name</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-600">*</span></label>
                            <Input
                              className="w-full min-w-[320px]"
                              value={addressForm.first_name}
                              onChange={(e) => setAddressForm({ ...addressForm, first_name: e.target.value })}
                              placeholder="e.g., Riya"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-600">*</span></label>
                            <Input
                              className="w-full min-w-[320px]"
                              value={addressForm.last_name}
                              onChange={(e) => setAddressForm({ ...addressForm, last_name: e.target.value })}
                              placeholder="e.g., Sharma"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company (optional)</label>
                            <Input
                              className="w-full min-w-[320px]"
                              value={addressForm.company}
                              onChange={(e) => setAddressForm({ ...addressForm, company: e.target.value })}
                              placeholder="Company name"
                            />
                          </div>
                        </div>
                      </div>
                      <hr className="my-2 border-gray-200" />

                      {/* Address */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 <span className="text-red-600">*</span></label>
                            <Input
                              className="w-full min-w-[320px]"
                              value={addressForm.address_1}
                              onChange={(e) => setAddressForm({ ...addressForm, address_1: e.target.value })}
                              placeholder="House no, street, area"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (optional)</label>
                            <Input
                              className="w-full min-w-[320px]"
                              value={addressForm.address_2}
                              onChange={(e) => setAddressForm({ ...addressForm, address_2: e.target.value })}
                              placeholder="Apartment, suite, etc."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Location</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-600">*</span></label>
                            <Input
                              className="w-full min-w-[320px]"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              placeholder="e.g., Ahmedabad"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                            <StateSelect
                              placeholder="Select State/Province"
                              countryCode={countryCode}
                              selectedKey={addressForm.province}
                              onSelectionChange={(value) => {
                                setAddressForm({ ...addressForm, province: value as string });
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code <span className="text-red-600">*</span></label>
                            <Input
                              className="w-full min-w-[320px]"
                              value={addressForm.postal_code}
                              onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                              placeholder="e.g., 380015"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <hr className="my-2 border-gray-200" />

                      {/* Contact */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Country <span className="text-red-600">*</span></label>
                            <CountrySelect
                              placeholder="Select Country"
                              region={cart?.region}
                              selectedKey={addressForm.country_code}
                              onSelectionChange={(value) => {
                                const countryCode = value as string;
                                setAddressForm({ ...addressForm, country_code: countryCode, province: '' });
                                setCountryCode(countryCode);
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
                            <Input
                              className="w-full min-w-[320px]"
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                              placeholder="e.g., +91XXXXXXXXXX"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => { 
                          setIsAddingAddress(false); 
                          setEditingAddressId(null);
                          setCountryCode('IN');
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addAddress.isPending || updateAddress.isPending}>
                          {addAddress.isPending || updateAddress.isPending ? 'Saving...' : 'Save Address'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {!isAddingAddress && !editingAddressId && (
                customer.addresses && customer.addresses.length > 0 ? (
                <div className="space-y-4">
                  {customer.addresses.map((address: unknown, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {(address as { first_name?: string }).first_name} {(address as { last_name?: string }).last_name}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {(address as { address_1?: string }).address_1}
                            {(address as { address_2?: string }).address_2 && <br />}
                            {(address as { address_2?: string }).address_2}
                          </p>
                          <p className="text-gray-600">
                            {(address as { city?: string }).city}, {(address as { province?: string }).province} {(address as { postal_code?: string }).postal_code}
                          </p>
                          <p className="text-gray-600">{(address as { country_code?: string }).country_code}</p>
                          {(address as { phone?: string }).phone && (
                            <p className="text-gray-600 mt-1">Phone: {(address as { phone?: string }).phone}</p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const addressCountryCode = (address as { country_code?: string }).country_code || 'IN';
                              setIsAddingAddress(false)
                              setEditingAddressId((address as { id?: string }).id || null)
                              setCountryCode(addressCountryCode);
                              setAddressForm({
                                first_name: (address as { first_name?: string }).first_name || '',
                                last_name: (address as { last_name?: string }).last_name || '',
                                company: (address as { company?: string }).company || '',
                                address_1: (address as { address_1?: string }).address_1 || '',
                                address_2: (address as { address_2?: string }).address_2 || '',
                                city: (address as { city?: string }).city || '',
                                postal_code: (address as { postal_code?: string }).postal_code || '',
                                province: (address as { province?: string }).province || '',
                                country_code: addressCountryCode,
                                phone: (address as { phone?: string }).phone || '',
                              })
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteDialog({ open: true, id: (address as { id?: string }).id })}
                          >
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
                    <p className="text-gray-600">Add your first shipping address to get started.</p>
                </div>
                )
              )}
            </Card>
          )}

          {/* Security Tab */}
          {/* {activeTab === 'security' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Password</h3>
                  <p className="text-gray-600 mb-4">Change your password to keep your account secure.</p>
                  <Button variant="outline">Change Password</Button>
                  <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 mx-10"
                      onClick={handleSignout}
                      disabled={signout.isPending}
                    >
                      {signout.isPending ? 'Signing out...' : 'Sign Out'}
                    </Button>
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
          )} */}
        
      </div>
    </>
  );
}
