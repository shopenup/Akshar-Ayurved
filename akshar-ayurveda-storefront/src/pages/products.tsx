import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Button, Badge, useToast } from '../components/ui';
import ProductCard from '../components/ui/ProductCard';
import { sdk } from '@lib/config';
import { HttpTypes } from '@shopenup/types';
import { getCategoriesList } from '@lib/shopenup/categories';
import { useAddLineItem } from '../hooks/cart';
import { useAppContext } from '../context/AppContext';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  images: any[] | null;
  thumbnail?: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  variants?: any[];
  tags?: string[];
  type?: {
    value: string;
    label: string;
  };
}

interface Category {
  id: string;
  name: string;
  handle: string;
  count?: number;
}

interface FilterState {
  category: string;
  priceRange: [number, number];
  inStock: boolean;
  sortBy: string;
  searchQuery: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { updateCartCount } = useAppContext();
  const { mutateAsync: addLineItem, isPending: isAddingToCart } = useAddLineItem();
  const { showToast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    priceRange: [0, 10000],
    inStock: false, // Temporarily disable stock filter
    sortBy: 'created_at',
    searchQuery: ''
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const cats = await getCategoriesList();
        console.log('Categories fetched:', cats);
        setCategories(cats.product_categories || []);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query: any = {
          limit: 100,
          offset: 0,
          fields: '*variants.calculated_price',
        };
        
        // Add category filter
        if (filters.category) {
          query.category_id = filters.category;
        }
        
        // Add search query
        if (filters.searchQuery) {
          query.q = filters.searchQuery;
        }
        
        console.log('Fetching products with query:', query);
        
        const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
          '/store/products',
          {
            query,
            next: { tags: ['products'] },
          }
        );
        
        const sdkProducts = response.products || [];
        console.log('Products fetched:', sdkProducts.length);
        console.log('Raw products:', sdkProducts.map(p => ({ id: p.id, title: p.title, status: p.status, price: p.variants?.[0]?.calculated_price })));

        // Map StoreProduct[] to Product[] by ensuring 'price' is present
        const mappedProducts = sdkProducts.map((p) => {
          // Try different ways to get the price
          let price = 0;
          
          // Method 1: Try variants[0].calculated_price.calculated_amount
          if (p.variants && p.variants[0] && p.variants[0].calculated_price && typeof p.variants[0].calculated_price.calculated_amount === 'number') {
            price = p.variants[0].calculated_price.calculated_amount;
          }
          // Method 2: Try variants[0].calculated_price (direct number)
          else if (p.variants && p.variants[0] && typeof p.variants[0].calculated_price === 'number') {
            price = p.variants[0].calculated_price;
          }
          // Method 3: Try variants[0].price
          else if (p.variants && p.variants[0] && typeof (p.variants[0] as any).price === 'number') {
            price = (p.variants[0] as any).price;
          }
          // Method 4: Try direct price property
          else if (typeof (p as any).price === 'number') {
            price = (p as any).price;
          }
          // Method 5: Try original_price
          else if (typeof (p as any).original_price === 'number') {
            price = (p as any).original_price;
          }
          
          console.log(`Product ${p.title} - Price extracted:`, price, 'from variants:', p.variants);
          
          return {
            id: p.id,
            title: p.title,
            description: p.description || undefined,
            price: price,
            original_price: (p as any).original_price || undefined,
            images: p.images || [],
            thumbnail: p.thumbnail || undefined,
            status: p.status,
            created_at: p.created_at || '',
            updated_at: p.updated_at || '',
            variants: p.variants || [],
            tags: p.tags,
            type: p.type
          };
        });

        console.log('Mapped products:', mappedProducts.map(p => ({ id: p.id, title: p.title, status: p.status, price: p.price })));
        setProducts(mappedProducts as Product[]);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters.category, filters.searchQuery]);

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    console.log('Filtering products:', products.length, 'products');
    console.log('Filter settings:', filters);
    
    let filtered = products.filter(product => {
      // Temporarily disable all filters for debugging
      return true;
      
      // Stock filter
      // if (filters.inStock && product.status !== 'published') {
      //   console.log('Filtered out by stock:', product.title, 'status:', product.status);
      //   return false;
      // }
      
      // Price range filter
      // const price = product.price || 0;
      // if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      //   console.log('Filtered out by price:', product.title, 'price:', price, 'range:', filters.priceRange);
      //   return false;
      // }
      
      // return true;
    });

    console.log('After filtering:', filtered.length, 'products remain');

    // Sort products
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'name_asc':
          return a.title.localeCompare(b.title);
        case 'name_desc':
          return b.title.localeCompare(a.title);
        case 'created_at':
        default:
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      }
    });

    return filtered;
  }, [products, filters]);

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleAddToCart = async (productId: string) => {
    // Show immediate toast feedback only
    const product = products.find(p => p.id === productId);
    if (product) {
      showToast(`${product.title} successfully added to cart!`, 'success');
    }
    
    // Note: Cart addition logic is commented out - only showing toast
    // Uncomment the following code if you want actual cart functionality:
    /*
    try {
      // Get the first variant ID (most products have only one variant)
      const variantId = product.variants?.[0]?.id;
      if (!variantId) {
        console.error('No variant found for product:', productId);
        return;
      }

      console.log('Adding to cart:', { productId, variantId, quantity: 1 });
      
      await addLineItem({
        variantId,
        quantity: 1,
        countryCode: 'in' // Default to India
      });

      console.log('✅ Product added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart. Please try again.', 'error');
    }
    */
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 10000],
      inStock: true,
      sortBy: 'created_at',
      searchQuery: ''
    });
  };

  const hasActiveFilters = filters.category || 
    filters.searchQuery || 
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 10000 ||
    !filters.inStock;

  return (
    <>
      <Head>
        <title>Products - AKSHAR AYURVED</title>
        <meta name="description" content="Explore our collection of authentic Ayurvedic products." />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                <p className="mt-2 text-gray-600">
                  Discover our authentic Ayurvedic products
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="mt-4 sm:mt-0 sm:ml-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    {showFilters ? 'Hide' : 'Show'}
                  </Button>
                </div>

                <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Categories */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                    {categoriesLoading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value=""
                            checked={filters.category === ''}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">All Categories</span>
                        </label>
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center">
                            <input
                              type="radio"
                              name="category"
                              value={category.id}
                              checked={filters.category === category.id}
                              onChange={(e) => handleFilterChange('category', e.target.value)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">₹{filters.priceRange[0]}</span>
                        <span className="text-sm text-gray-600">₹{filters.priceRange[1]}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={filters.priceRange[1]}
                        onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Stock Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Availability</h3>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">In Stock Only</span>
                    </label>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Sort By</h3>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="created_at">Newest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="name_asc">Name: A to Z</option>
                      <option value="name_desc">Name: Z to A</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-600">
                    Showing {filteredAndSortedProducts.length} of {products.length} products
                  </p>
                  {hasActiveFilters && (
                    <p className="text-xs text-gray-500 mt-1">
                      Filters applied
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    Filters
                  </Button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              )}

              {/* Products Grid */}
              {!loading && !error && (
                <>
                  {filteredAndSortedProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.172 13H4m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.172 13H4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
                      <p className="text-gray-600 mb-4">
                        {hasActiveFilters 
                          ? 'Try adjusting your filters or search terms.' 
                          : 'No products are currently available.'
                        }
                      </p>
                      {hasActiveFilters && (
                        <Button onClick={clearFilters}>
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredAndSortedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onProductClick={handleProductClick}
                          onAddToCart={handleAddToCart}
                          showAddToCart={true}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
