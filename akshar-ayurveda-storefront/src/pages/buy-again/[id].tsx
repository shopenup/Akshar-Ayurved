import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Card, Badge } from '../../components/ui';

export default function BuyAgainPage() {
  const router = useRouter();
  const { id } = router.query;
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Sample order data
  const orderData = {
    orderId: id as string,
    date: '2024-12-15',
    items: [
      {
        id: '1',
        name: 'START Weight Gainer',
        price: 799,
        originalPrice: 999,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop',
        category: 'Supplements',
        rating: 4.6,
        reviewCount: 234,
        inStock: true,
        description: 'Powerful Ayurvedic Formula to improve digestive health and bowel movements'
      },
      {
        id: '2',
        name: 'Organic Ashwagandha Powder',
        price: 299,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
        category: 'Herbs',
        rating: 4.5,
        reviewCount: 128,
        inStock: true,
        description: 'Pure organic ashwagandha powder for stress relief and energy'
      }
    ]
  };

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === orderData.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(orderData.items.map(item => item.id));
    }
  };

  const handleAddToCart = () => {
    // Add selected items to cart
    console.log('Adding to cart:', selectedItems);
    router.push('/cart');
  };

  const handleBuyNow = () => {
    // Add selected items to cart and go to checkout
    console.log('Buying now:', selectedItems);
    router.push('/checkout');
  };

  const selectedItemsData = orderData.items.filter(item => selectedItems.includes(item.id));
  const total = selectedItemsData.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      <Head>
        <title>Buy Again - AKSHAR</title>
        <meta name="description" content="Reorder your previous purchases" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/orders">
              <Button variant="outline" size="sm" className="mb-4">
                ← Back to Orders
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Buy Again</h1>
            <p className="text-gray-600 mt-2">
              Reorder items from your previous purchase (Order #{orderData.orderId})
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === orderData.items.length}
                        onChange={handleSelectAll}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Select All</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleItemToggle(item.id)}
                          className="mt-2"
                        />
                        
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              <div className="flex items-center mt-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                  <span className="text-sm text-gray-600 ml-1">
                                    ({item.reviewCount})
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-gray-900">
                                  ₹{item.price}
                                </span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ₹{item.originalPrice}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                             {item.inStock ? (
                                 <Badge variant="success" className="mt-1">In Stock</Badge>
                               ) : (
                                 <Badge variant="danger" className="mt-1">Out of Stock</Badge>
                               )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                
                {selectedItems.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    Select items to reorder
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {selectedItemsData.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.name} (Qty: {item.quantity})
                          </span>
                          <span className="font-medium">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>₹{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleBuyNow}
                      >
                        Buy Now
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleAddToCart}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </>
                )}
              </Card>

              {/* Related Products */}
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">You Might Also Like</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Turmeric Golden Milk', price: 199, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
                    { name: 'Neem Face Wash', price: 149, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop' },
                    { name: 'Sandalwood Oil', price: 399, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=100&h=100&fit=crop' }
                  ].map((product, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">₹{product.price}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
