import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, Badge } from '../components/ui';
import { useAppContext } from '../context/AppContext';

// Mock favourites data
const mockFavourites = [
  {
    id: '1',
    name: 'Ashwagandha Churna - Natural Stress Relief',
    price: 299,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
    category: 'Health Care & Energy Booster',
    rating: 4.5,
    reviewCount: 128,
    inStock: true,
  },
  {
    id: '2',
    name: 'Triphala Churna - Digestive Health',
    price: 199,
    originalPrice: 249,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    category: 'Natural Antacid',
    rating: 4.8,
    reviewCount: 95,
    inStock: true,
  },
  {
    id: '3',
    name: 'Neem Oil - Natural Skin Care',
    price: 150,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
    category: 'Premium Cosmetics',
    rating: 4.2,
    reviewCount: 67,
    inStock: true,
  },
  {
    id: '4',
    name: 'Brahmi Vati - Memory Enhancement',
    price: 350,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=300&fit=crop',
    category: 'Ras Rasayan',
    rating: 4.6,
    reviewCount: 89,
    inStock: false,
  },
];

export default function Favourites() {
  const [favourites, setFavourites] = useState(mockFavourites);
  const [isLoading, setIsLoading] = useState(false);
  const { updateFavouriteCount } = useAppContext();

  const removeFromFavourites = (productId: string) => {
    setFavourites(prev => {
      const newFavourites = prev.filter(item => item.id !== productId);
      updateFavouriteCount(newFavourites.length);
      return newFavourites;
    });
  };

  const addToCart = async () => {
    setIsLoading(true);
    // Simulate adding to cart
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Here you would typically add to cart state/context
    alert('Product added to cart!');
  };

  const moveAllToCart = async () => {
    setIsLoading(true);
    // Simulate adding all to cart
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    alert('All products added to cart!');
  };

  if (favourites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Start adding products to your wishlist to save them for later.</p>
            <Link href="/">
              <Button variant="primary" size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-2">Save your favorite products for later</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {favourites.length} {favourites.length === 1 ? 'item' : 'items'}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={moveAllToCart}
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add All to Cart'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favourites.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative w-full h-48">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                
                {/* Discount Badge */}
                {product.originalPrice && (
                  <Badge 
                    variant="danger" 
                    size="sm" 
                    className="absolute top-2 left-2"
                  >
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </Badge>
                )}
                
                {/* Stock Status */}
                {!product.inStock && (
                  <Badge 
                    variant="warning" 
                    size="sm" 
                    className="absolute top-2 right-2"
                  >
                    Out of Stock
                  </Badge>
                )}
                
                {/* Remove from Favourites Button */}
                <button
                  onClick={() => removeFromFavourites(product.id)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Category */}
                <Badge variant="secondary" size="sm" className="mb-2">
                  {product.category}
                </Badge>
                
                {/* Product Name */}
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-1">
                    ({product.reviewCount})
                  </span>
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={addToCart}
                    disabled={!product.inStock || isLoading}
                    fullWidth
                  >
                    {!product.inStock ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State for when all items are removed */}
        {favourites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No items in your wishlist</p>
            <Link href="/">
              <Button variant="primary">
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
