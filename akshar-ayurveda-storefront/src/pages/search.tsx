import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, Badge } from '../components/ui';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterCategory, setFilterCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showOutOfStock, setShowOutOfStock] = useState(true);

  // Sample product data - in a real app, this would come from an API
  const allProducts: Product[] = [
    {
      id: '1',
      name: 'Chyawanprash',
      price: 299,
      originalPrice: 399,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
      category: 'Immunity Boosters',
      description: 'Traditional Ayurvedic immunity booster with natural herbs and honey',
      rating: 4.5,
      reviewCount: 89,
      inStock: true,
      isFeatured: true
    },
    {
      id: '2',
      name: 'Ashwagandha Capsules',
      price: 599,
      originalPrice: 799,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
      category: 'Stress Relief',
      description: 'Natural stress relief and energy booster capsules with pure Ashwagandha extract',
      rating: 4.6,
      reviewCount: 156,
      inStock: true,
      isNew: true
    },
    {
      id: '3',
      name: 'Triphala Churna',
      price: 199,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      category: 'Digestive Health',
      description: 'Natural digestive supplement for better gut health and regular bowel movements',
      rating: 4.3,
      reviewCount: 67,
      inStock: true
    },
    {
      id: '4',
      name: 'Brahmi Tablets',
      price: 449,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
      category: 'Brain Health',
      description: 'Memory and brain health supplement tablets for cognitive enhancement',
      rating: 4.4,
      reviewCount: 78,
      inStock: true
    },
    {
      id: '5',
      name: 'Shatavari Powder',
      price: 399,
      originalPrice: 499,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      category: 'Women\'s Health',
      description: 'Women\'s health and wellness powder for hormonal balance',
      rating: 4.7,
      reviewCount: 134,
      inStock: true,
      isFeatured: true
    },
    {
      id: '6',
      name: 'Giloy Tablets',
      price: 349,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
      category: 'Immunity Boosters',
      description: 'Natural immunity booster with Giloy extract for better health',
      rating: 4.2,
      reviewCount: 92,
      inStock: true
    },
    {
      id: '7',
      name: 'Turmeric Capsules',
      price: 259,
      image: 'https://images.unsplash.com/photo-1615485925600-97bc0106aaf2?w=300&h=300&fit=crop',
      category: 'Anti-inflammatory',
      description: 'Pure turmeric capsules for inflammation relief and joint health',
      rating: 4.1,
      reviewCount: 45,
      inStock: true
    },
    {
      id: '8',
      name: 'Neem Tablets',
      price: 199,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
      category: 'Skin Health',
      description: 'Natural blood purifier and skin health tablets with Neem extract',
      rating: 4.0,
      reviewCount: 38,
      inStock: false
    },
    {
      id: '9',
      name: 'Arjuna Capsules',
      price: 449,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
      category: 'Heart Health',
      description: 'Cardiovascular health support with Arjuna bark extract',
      rating: 4.3,
      reviewCount: 63,
      inStock: true
    },
    {
      id: '10',
      name: 'Amla Powder',
      price: 179,
      originalPrice: 229,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      category: 'Vitamin C',
      description: 'Natural Vitamin C supplement with pure Amla powder',
      rating: 4.5,
      reviewCount: 112,
      inStock: true,
      isNew: true
    }
  ];

  const categories = ['all', 'Immunity Boosters', 'Stress Relief', 'Digestive Health', 'Brain Health', 'Women\'s Health', 'Anti-inflammatory', 'Skin Health', 'Heart Health', 'Vitamin C'];
  const priceRanges = [
    { id: 'all', label: 'All Prices', min: 0, max: Infinity },
    { id: 'under200', label: 'Under ₹200', min: 0, max: 200 },
    { id: '200to400', label: '₹200 - ₹400', min: 200, max: 400 },
    { id: '400to600', label: '₹400 - ₹600', min: 400, max: 600 },
    { id: 'above600', label: 'Above ₹600', min: 600, max: Infinity }
  ];

  // Search function
  const searchProducts = (query: string): Product[] => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  };

  // Apply filters
  const applyFilters = (products: Product[]) => {
    let filtered = [...products];

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    // Price range filter
    if (priceRange !== 'all') {
      const range = priceRanges.find(r => r.id === priceRange);
      if (range) {
        filtered = filtered.filter(product => product.price >= range.min && product.price <= range.max);
      }
    }

    // Stock filter
    if (!showOutOfStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    return filtered;
  };

  // Apply sorting
  const applySorting = (products: Product[]) => {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'relevance':
      default:
        return sorted; // Keep original order for relevance
    }
  };

  // Effect to handle search
  useEffect(() => {
    if (q && typeof q === 'string') {
      setSearchQuery(q);
      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        const searchResults = searchProducts(q);
        setResults(searchResults);
        setIsLoading(false);
      }, 500);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]); // searchProducts is a stable function, no need to include

  // Effect to apply filters and sorting
  useEffect(() => {
    const filtered = applyFilters(results);
    const sorted = applySorting(filtered);
    setFilteredResults(sorted);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, filterCategory, priceRange, showOutOfStock, sortBy]); // applyFilters and applySorting are stable functions

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleAddToCart = (productId: string) => {
    // Add to cart logic here
    console.log('Added to cart:', productId);
  };

  const clearFilters = () => {
    setFilterCategory('all');
    setPriceRange('all');
    setShowOutOfStock(true);
    setSortBy('relevance');
  };

  return (
    <>
      <Head>
        <title>{searchQuery ? `Search Results for "${searchQuery}"` : 'Search Products'} - AKSHAR</title>
        <meta name="description" content={`Search results for ${searchQuery || 'products'} - Find the best Ayurvedic products`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
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
                <span className="text-gray-900">Search Results</span>
              </li>
            </ol>
          </nav>

          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Products'}
            </h1>
            {!isLoading && (
              <p className="text-gray-600">
                {filteredResults.length > 0 
                  ? `Found ${filteredResults.length} product${filteredResults.length !== 1 ? 's' : ''}`
                  : 'No products found'
                }
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching products...</p>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={filterCategory === category}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">
                            {category === 'all' ? 'All Categories' : category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                    <div className="space-y-2">
                      {priceRanges.map((range) => (
                        <label key={range.id} className="flex items-center">
                          <input
                            type="radio"
                            name="priceRange"
                            value={range.id}
                            checked={priceRange === range.id}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {range.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Stock Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showOutOfStock}
                        onChange={(e) => setShowOutOfStock(e.target.checked)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Include out of stock
                      </span>
                    </label>
                  </div>
                </Card>
              </div>

              {/* Results Section */}
              <div className="lg:col-span-3">
                {filteredResults.length > 0 ? (
                  <>
                    {/* Sort Options */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="relevance">Relevance</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="rating">Customer Rating</option>
                          <option value="name">Name: A to Z</option>
                          <option value="newest">Newest First</option>
                        </select>
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredResults.map((product) => (
                        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={300}
                              height={200}
                              className="w-full h-48 object-cover cursor-pointer"
                              onClick={() => handleProductClick(product.id)}
                            />
                            
                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex flex-col space-y-1">
                              {product.originalPrice && (
                                <Badge variant="danger" size="sm">
                                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                </Badge>
                              )}
                              {product.isNew && (
                                <Badge variant="success" size="sm">New</Badge>
                              )}
                              {product.isFeatured && (
                                <Badge variant="warning" size="sm">Featured</Badge>
                              )}
                            </div>

                            {!product.inStock && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <Badge variant="danger">Out of Stock</Badge>
                              </div>
                            )}
                          </div>

                          <div className="p-4">
                            <div className="mb-2">
                              <Badge variant="secondary" size="sm">{product.category}</Badge>
                            </div>
                            
                            <h3 
                              className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-green-600"
                              onClick={() => handleProductClick(product.id)}
                            >
                              {product.name}
                            </h3>
                            
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {product.description}
                            </p>

                            {/* Rating */}
                            <div className="flex items-center mb-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-gray-600">
                                {product.rating} ({product.reviewCount})
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-green-600">₹{product.price}</span>
                                {product.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                                )}
                              </div>
                            </div>

                            {/* Add to Cart Button */}
                            <Button
                              variant={product.inStock ? "primary" : "secondary"}
                              className="w-full"
                              disabled={!product.inStock}
                              onClick={() => handleAddToCart(product.id)}
                            >
                              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : searchQuery ? (
                  <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                      <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                      <p className="text-gray-600 mb-6">
                        We couldn&apos;t find any products matching &quot;{searchQuery}&quot;. Try adjusting your search or filters.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Suggestions:</p>
                        <ul className="text-sm text-gray-500 space-y-1">
                          <li>• Check your spelling</li>
                          <li>• Try different keywords</li>
                          <li>• Use more general terms</li>
                          <li>• Browse our categories</li>
                        </ul>
                      </div>
                      <div className="mt-6">
                        <Link href="/products">
                          <Button variant="primary">Browse All Products</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-600">Enter a search term to find products.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
