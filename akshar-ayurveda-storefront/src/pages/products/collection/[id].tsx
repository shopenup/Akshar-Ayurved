import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, ProductGrid, ProductFilter, ProductSearch } from '../../../components';

export default function CollectionPage() {
  const router = useRouter();
  const { id } = router.query;
  const [sortBy, setSortBy] = useState('featured');
  const [filterCategory, setFilterCategory] = useState('all');

  // Sample collection data
  const collectionData = {
    id: id as string,
    name: 'Classical Range',
    description: 'Traditional Ayurvedic formulations passed down through generations',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=400&fit=crop',
    productCount: 45
  };

  // Sample products for this collection
  const products = [
    {
      id: '1',
      name: 'Chyawanprash',
      price: 199,
      originalPrice: 249,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
      category: 'Traditional',
      rating: 4.5,
      reviewCount: 89,
      inStock: true,
      isNew: false,
      isFeatured: true,
      description: 'Traditional Ayurvedic immunity booster'
    },
    {
      id: '2',
      name: 'Triphala Churna',
      price: 149,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      category: 'Traditional',
      rating: 4.3,
      reviewCount: 67,
      inStock: true,
      isNew: false,
      isFeatured: false,
      description: 'Natural digestive supplement'
    },
    {
      id: '3',
      name: 'Ashwagandha Tablets',
      price: 249,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
      category: 'Traditional',
      rating: 4.6,
      reviewCount: 123,
      inStock: true,
      isNew: true,
      isFeatured: false,
      description: 'Stress relief and energy booster'
    },
    {
      id: '4',
      name: 'Brahmi Capsules',
      price: 179,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
      category: 'Traditional',
      rating: 4.4,
      reviewCount: 78,
      inStock: true,
      isNew: false,
      isFeatured: false,
      description: 'Memory and brain health supplement'
    },
    {
      id: '5',
      name: 'Shatavari Powder',
      price: 299,
      originalPrice: 349,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      category: 'Traditional',
      rating: 4.7,
      reviewCount: 156,
      inStock: true,
      isNew: false,
      isFeatured: true,
      description: 'Women\'s health and wellness powder'
    },
    {
      id: '6',
      name: 'Guggulu Tablets',
      price: 199,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
      category: 'Traditional',
      rating: 4.2,
      reviewCount: 45,
      inStock: false,
      isNew: false,
      isFeatured: false,
      description: 'Joint health and inflammation support'
    }
  ];

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleAddToCart = (productId: string) => {
    console.log('Add to cart:', productId);
  };

  const handleSearch = (query: string) => {
    console.log('Search:', query);
  };

  const filteredProducts = products.filter(product => 
    filterCategory === 'all' || product.category === filterCategory
  );

  return (
    <>
      <Head>
        <title>{collectionData.name} - AKSHAR</title>
        <meta name="description" content={collectionData.description} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Collection Header */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <nav className="flex mb-4" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2">
                    <li>
                      <Link href="/" className="text-gray-500 hover:text-gray-700">
                        Home
                      </Link>
                    </li>
                    <li>
                      <span className="text-gray-400">/</span>
                    </li>
                    <li>
                      <Link href="/products" className="text-gray-500 hover:text-gray-700">
                        Products
                      </Link>
                    </li>
                    <li>
                      <span className="text-gray-400">/</span>
                    </li>
                    <li>
                      <span className="text-gray-900">{collectionData.name}</span>
                    </li>
                  </ol>
                </nav>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{collectionData.name}</h1>
                <p className="text-lg text-gray-600 mb-6">{collectionData.description}</p>
                <p className="text-sm text-gray-500">{collectionData.productCount} products</p>
              </div>
              <div className="flex justify-center">
                <Image
                  src={collectionData.image}
                  alt={collectionData.name}
                  width={400}
                  height={256}
                  className="w-full max-w-md h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-md">
                <ProductSearch onSearch={handleSearch} />
              </div>
              <div className="flex items-center space-x-4">
                <ProductFilter
                  categories={['all', 'Traditional', 'Herbs', 'Supplements']}
                  selectedCategory={filterCategory}
                  onCategoryChange={setFilterCategory}
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <ProductGrid
              products={filteredProducts}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria.
              </p>
              <Button variant="outline" onClick={() => setFilterCategory('all')}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Related Collections */}
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Other Collections</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Herbal Extracts', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', count: 34 },
                { name: 'Single Herbs', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop', count: 28 },
                { name: 'Wellness Kits', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop', count: 19 },
                { name: 'Essential Oils', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', count: 23 }
              ].map((collection, index) => (
                <Link
                  key={index}
                  href={`/products/collection/${collection.name.toLowerCase().replace(' ', '-')}`}
                  className="group text-center"
                >
                  <div className="bg-gray-50 rounded-lg p-4 mb-3 hover:bg-gray-100 transition-colors">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      width={300}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-gray-500">{collection.count} products</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
