import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Button, useToast } from '../components/ui';
import ProductCard from '../components/ui/ProductCard';
import { sdk } from '@lib/config';
import { HttpTypes } from '@shopenup/types';
import { getCategoriesList } from '@lib/shopenup/categories';
import { useAddLineItem } from '../hooks/cart';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '@components/about/Breadcrumb';

interface ProductVariant {
  id: string;
  title?: string;
  price?: number;
  sku?: string;
  inventory_quantity?: number;
}

interface ProductImage {
  id: string;
  url: string;
}

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  images: ProductImage[] | null;
  thumbnail?: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  variants?: ProductVariant[];
  tags?: string[];
  categories?: unknown[];
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

interface WishlistProduct {
  id: string;
  title: string;
  description?: string;
  status: string;
  thumbnail?: string;
  images?: { url: string }[];
  categories?: { id: string; name: string }[];
}

interface WishlistProductVariant {
  id: string;
  title?: string;
  prices?: { amount: number }[];
  product: WishlistProduct;
}

interface WishlistItem {
  id: string;
  product_variant: WishlistProductVariant;
}

interface Wishlist {
  id: string;
  items: WishlistItem[];
}


export default function ProductsPage() {
  const router = useRouter();
  const { mutateAsync: addLineItem } = useAddLineItem();
  const { showToast } = useToast();

  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const { updateFavouriteCount, isLoggedIn } = useAppContext();


  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    priceRange: [0, 10000],
    inStock: false, // Temporarily disable stock filter
    sortBy: 'created_at',
    searchQuery: ''
  });


  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isLoggedIn) { // reset to empty for guests
       // setLoading(false);
          return;
      }
      try {
        setWishlistLoading(true);
        const response = await sdk.client.fetch<{ wishlist: Wishlist }>(
          '/store/customers/me/wishlists',
          {
            next: { tags: ['wishlist'] },
          }
        );

        setWishlist(response.wishlist || null);
      } catch (err: any) {
        console.error('Error fetching wishlist:', err);
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchWishlist();
  }, [updateFavouriteCount]);


  // Use React Query for categories to avoid duplicate API calls
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['product-categories', { limit: 100, offset: 0 }],
    queryFn: async () => getCategoriesList(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const categories: Category[] = React.useMemo(() => {
    return (categoriesData as any)?.product_categories || [];
  }, [categoriesData]);

  // Use React Query for products to avoid duplicate API calls
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ['products', {
      limit: 100,
      offset: 0,
      fields: '*variants.calculated_price,*categories',
      category_id: filters.category,
      q: filters.searchQuery
    }],
    queryFn: async () => {
      const query: Record<string, unknown> = {
        limit: 100,
        offset: 0,
        fields: '*variants.calculated_price,*categories',
      };

      // Add category filter
      if (filters.category) {
        query.category_id = filters.category;
      }

      // Add search query
      if (filters.searchQuery) {
        query.q = filters.searchQuery;
      }

      const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
        '/store/products',
        {
          query,
          next: { tags: ['products'] },
        }
      );

      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const products: Product[] = React.useMemo(() => {
    if (!productsData?.products) return [];

    return productsData.products.map((p) => {
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
      else if (p.variants && p.variants[0] && typeof (p.variants[0] as { price?: number }).price === 'number') {
        price = (p.variants[0] as { price?: number }).price!;
      }
      // Method 4: Try direct price property
      else if (typeof (p as { price?: number }).price === 'number') {
        price = (p as { price?: number }).price!;
      }
      // Method 5: Try original_price
      else if (typeof (p as { original_price?: number }).original_price === 'number') {
        price = (p as { original_price?: number }).original_price!;
      }

      return {
        id: p.id,
        title: p.title,
        description: p.description || undefined,
        price: price,
        original_price: (p as { original_price?: number }).original_price || undefined,
        images: (p.images || []).map((img: unknown, index: number) =>
          typeof img === 'string' ? { id: `img-${index}`, url: img } :
            img && typeof img === 'object' && 'url' in img ?
              { id: `img-${index}`, url: (img as { url: string }).url } :
              { id: `img-${index}`, url: '' }
        ),
        thumbnail: p.thumbnail || undefined,
        status: p.status,
        created_at: p.created_at || '',
        updated_at: p.updated_at || '',
        variants: (p.variants || []) as ProductVariant[],
        tags: p.tags,
        type: p.type,
        categories: p.categories || [],
      };
    }) as Product[];
  }, [productsData]);

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {

    const filtered = products.filter(() => {
      // Temporarily disable all filters for debugging
      return true;

      // Stock filter
      // if (filters.inStock && product.status !== 'published') {
      //   return false;
      // }

      // Price range filter
      // const price = product.price || 0;
      // if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      //   return false;
      // }

      // return true;
    });


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

    try {
      // Get the first variant ID (most products have only one variant)
      const variantId = (product?.variants?.[0] as { id?: string })?.id;
      if (!variantId) {
        return;
      }



      await addLineItem({
        variantId,
        quantity: 1,
        countryCode: 'in' // Default to India
      });


    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart. Please try again.', 'error');
    }

  };

  const handleFilterChange = (key: keyof FilterState, value: unknown) => {
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/assets/images/favicon.png" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb Section */}
        <Breadcrumb title="products" crumbs={[{ label: 'Home', href: '/' }, { label: 'products' }]} imageSrc="/assets/images/bredcrumb-bg.jpg" />

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
                    className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd8973] focus:border-transparent"
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden"
                    >
                      {showFilters ? "Hide" : "Show"}
                    </Button>
                  </div>

                  {/* Filters Body */}
                  <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
                    {/* Categories with Checkboxes */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                      {categoriesLoading ? (
                        <div className="space-y-2">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          ))}
                        </div>
                      ) : categoriesError ? (
                        <div className="text-sm text-red-600">Error loading categories</div>
                      ) : (
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <label
                              key={category.id}
                              className="flex items-center cursor-pointer group space-x-3"
                            >
                              <input
                                type="checkbox"
                                checked={filters.category?.includes(category.id)}
                                onChange={(e) => {
                                  const currentCategories: string[] = Array.isArray(filters.category)
                                    ? filters.category
                                    : filters.category
                                    ? [filters.category]
                                    : [];
                                  const newCategories = e.target.checked
                                    ? [...currentCategories, category.id]
                                    : currentCategories.filter((c: string) => c !== category.id);
                                  handleFilterChange("category", newCategories);
                                }}
                                className="hidden peer"
                              />
                              <div className="w-5 h-5 flex items-center justify-center rounded-md border-2 border-gray-300 peer-checked:border-[#cd8973] peer-checked:bg-[#cd8973] transition-colors">
                                <svg
                                  className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                {category.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Availability */}
                    {/* <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Availability</h3>
                      <label className="flex items-center cursor-pointer group space-x-3">
                        <input
                          type="checkbox"
                          checked={filters.inStock}
                          onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                          className="hidden peer"
                        />
                        <div className="w-5 h-5 flex items-center justify-center rounded-md border-2 border-gray-300 peer-checked:border-green-500 peer-checked:bg-green-500 transition-colors">
                          <svg
                            className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          In Stock Only
                        </span>
                      </label>
                    </div> */}

                    {/* Sort Options */}
                    <div>
                      <h3 className="text-sm font-medium text-black-900 mb-3">Sort By</h3>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                        className="text-black w-full p-2 border border-black-300 rounded-md text-sm focus:ring-2 focus:ring-[#cd8973] focus:border-[#cd8973]"
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
            </div>

            {/* Products Grid */}
            <div className="flex-1 min-w-0 overflow-y-auto max-h-[calc(100vh-6rem)] pr-2">
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
              {productsLoading && (
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
              {productsError && !productsLoading && (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
                  <p className="text-gray-600 mb-4">{productsError?.message || 'An error occurred'}</p>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              )}

              {/* Products Grid */}
              {!productsLoading && !productsError && (
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
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                      {filteredAndSortedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={{
                            ...product,
                            // Ensure categories is correctly typed as { id: string; name: string; }[] | undefined
                            categories: product.categories as { id: string; name: string; }[] | undefined,
                            variants: product.variants?.map(variant => ({
                              ...variant,
                              title: variant.title ?? ""
                            }))
                          }}
                          onProductClick={handleProductClick}
                          onAddToCart={handleAddToCart}
                          showAddToCart={true}
                          wishlist={wishlist}
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

