import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@lib/config';
import { getCategoriesList } from '@lib/shopenup/categories';
import { ProductGrid } from '@components/products';
import Hero from '@components/layout/Hero';
import Section from '@components/layout/Section';
import { Button } from '@components/ui';
import { useToast } from '@components/ui';
import { useAddLineItem } from '@hooks/cart';
import { useCountryCode } from '@hooks/country-code';
import { useAppContext } from '@context/AppContext';
import Breadcrumb from '@components/about/Breadcrumb';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  productCount: number;
  isActive: boolean;
}

export default function ProductCategoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const { showToast } = useToast();
  const countryCode = useCountryCode() || 'in';
  const { mutateAsync: addLineItem } = useAddLineItem();
  const { updateFavouriteCount ,isLoggedIn} = useAppContext();
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Use React Query for categories to avoid duplicate API calls
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['product-categories', { limit: 100, offset: 0 }],
    queryFn: async () => {
      const response = await getCategoriesList(0, 100);
      return response;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Use React Query for products
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ['products', { category_id: id, limit: 100, offset: 0 }],
    queryFn: async () => {
      if (!id) return { products: [], count: 0 };
      
      const query: Record<string, unknown> = {
        limit: 100,
        offset: 0,
        fields: '*variants.calculated_price,*variants.id',
        category_id: id as string
      };
      
      const response = await sdk.client.fetch<{ products: unknown[]; count: number }>(
        '/store/products',
        {
          query,
          next: { tags: ['products'] },
        }
      );
      
      return response;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Find the current category
  const category = categoriesData?.product_categories?.find((cat: unknown) => (cat as { id: string }).id === id);

  // Format products
  const products: Product[] = React.useMemo(() => {
    if (!productsData?.products) return [];
    
    return (productsData.products || []).map((product: unknown) => {
      const p = product as {
        id: string;
        title: string;
        description?: string;
        price?: number;
        original_price?: number;
        thumbnail?: string;
        images?: Array<{ url?: string }>;
        category?: { name?: string };
        type?: { label?: string };
        tags?: string[];
        rating?: number;
        review_count?: number;
        variants?: Array<{
          calculated_price?: { calculated_amount?: number };
          inventory_quantity?: number;
        }>;
        in_stock?: boolean;
      };
      
      // Try to get price from different sources
      let price = 0;
      
      // Check calculated_price first (most common)
      if (p.variants?.[0]?.calculated_price?.calculated_amount) {
        price = p.variants[0].calculated_price.calculated_amount;
      }
      // Fallback to direct price
      else if (p.price) {
        price = p.price;
      }
      
      return {
        id: p.id,
        name: p.title,
        description: p.description || '',
        price: price,
        originalPrice: p.original_price,
        image: p.thumbnail || p.images?.[0]?.url || '',
        images: p.images?.map((img: unknown) => (img as { url?: string }).url).filter((url): url is string => Boolean(url)) || [],
        category: p.category?.name || p.type?.label || '',
        tags: p.tags || [],
        rating: p.rating,
        reviewCount: p.review_count,
        inStock: (p.variants?.[0]?.inventory_quantity ?? 0) > 0 || p.in_stock !== false
      };
    });
  }, [productsData]);

  // Update filtered products when products change
  React.useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const loading = categoriesLoading || productsLoading;
  const error = categoriesError || productsError;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredProducts(filtered);
  };

  // Ratings and review counts
  const [ratingsMap, setRatingsMap] = useState<Record<string, { rating: number; reviewCount: number }>>({});
  const [ratingsLoading, setRatingsLoading] = useState(false);
  useEffect(() => {
    const fetchRatings = async () => {
      const ids = (filteredProducts.length ? filteredProducts : products).map(p => p.id).slice(0, 50);
      if (!ids.length) return;
      setRatingsLoading(true);
      try {
        const response = await sdk.client.fetch<{
          ratings: Array<{ product_id: string; average_rating: number; total_reviews: number }>
        }>(
          '/store/reviews',
          {
            query: { product_ids: ids.join(',') },
            next: { tags: ['product-ratings'] },
            cache: 'no-store',
          }
        );
        const map: Record<string, { rating: number; reviewCount: number }> = {};
        response.ratings?.forEach(r => {
          map[r.product_id] = {
            rating: r.average_rating || 0,
            reviewCount: r.total_reviews || 0,
          };
        });
        setRatingsMap(map);
      } catch (e) {
        // ignore
      } finally {
        setRatingsLoading(false);
      }
    };
    fetchRatings();
  }, [filteredProducts, products]);

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingToCart(productId);
      
      // Find the product
      const product = products.find(p => p.id === productId);
      
      if (!product) {
        showToast('Product not found', 'error');
        return;
      }

      // Check if product is in stock
      if (!product.inStock) {
        showToast('Product is out of stock', 'error');
        return;
      }

      // Get the first variant ID (most products have only one variant)
      // We need to fetch the product details to get the variant ID
      const productResponse = await sdk.client.fetch<{ product: unknown }>(
        `/store/products/${productId}`,
        {
          next: { tags: ['products'] },
        }
      );

      const variantId = (productResponse.product as { variants?: Array<{ id?: string }> })?.variants?.[0]?.id;
      if (!variantId) {
        showToast('Product variant not found', 'error');
        return;
      }

      
      await addLineItem({
        variantId,
        quantity: 1,
        countryCode
      });

      showToast(`${product.name} added to cart`, 'success');

    } catch {
      showToast('Failed to add product to cart', 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  // Wishlist state (local + logged-in)
  const [wishlistVariantIds, setWishlistVariantIds] = useState<Set<string>>(new Set());
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };
  
  useEffect(() => {
    if (!isLoggedIn) { // reset to empty for guests
     // setLoading(false);
      return;
    }
    const loadWishlist = async () => {
      try {
        const res: { wishlist?: { items?: Array<{ product_variant?: { id?: string } }> } } = await sdk.client.fetch('/store/customers/me/wishlists', {});
        const ids = (res?.wishlist?.items || []).map(i => i?.product_variant?.id).filter(Boolean) as string[];
        if (ids.length) {
          setWishlistVariantIds(new Set(ids));
          return;
        }
      } catch {}
      try {
        const guest = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
        if (Array.isArray(guest)) setWishlistVariantIds(new Set(guest));
      } catch {}
    };
    loadWishlist();
  }, []);

  const addToFavourites = async (productId: string, productTitle: string) => {
    try {
      const productResponse = await sdk.client.fetch<{ product: unknown }>(
        `/store/products/${productId}`,
        { next: { tags: ['products'] } }
      );
      const variantId = (productResponse.product as { variants?: Array<{ id?: string }> })?.variants?.[0]?.id;
      if (!variantId) {
        showToast('Product variant not found', 'error');
        return;
      }

      const customerToken = getCookie('_shopenup_jwt');
      if (!customerToken) {
        const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
        if (!guestWishlist.includes(variantId)) {
          guestWishlist.push(variantId);
          localStorage.setItem('guest_wishlist', JSON.stringify(guestWishlist));
          setWishlistVariantIds(prev => new Set([...Array.from(prev), variantId]));
        }
        showToast('Item added! Login to keep it in your wishlist.', 'info');
        return;
      }

      let wishlist: any = null;
      try {
        const wishlistRes: { wishlist?: any } = await sdk.client.fetch('/store/customers/me/wishlists', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || '',
            'Authorization': `Bearer ${customerToken}`,
          },
        });
        wishlist = wishlistRes?.wishlist;
      } catch {}
      if (!wishlist) {
        const createRes: { wishlist?: any } = await sdk.client.fetch('/store/customers/me/wishlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || '',
            'Authorization': `Bearer ${customerToken}`,
          },
        });
        wishlist = createRes?.wishlist;
      }
      if (!wishlist) {
        // showToast('Could not create wishlist', 'error');
        return;
      }
      try {
        const res: { wishlist?: { items?: any[] } } = await sdk.client.fetch('/store/customers/me/wishlists/items', {
          method: 'POST',
          body: { variant_id: variantId },
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || '',
            'Authorization': `Bearer ${customerToken}`,
          },
        });
        // showToast(`${productTitle} Added to favorites!`, 'success');
        setWishlistVariantIds(prev => new Set([...Array.from(prev), variantId]));
        updateFavouriteCount(Math.max(0, (res?.wishlist?.items?.length || 1) - 1));
      } catch (err: any) {
        if (err?.message?.includes('Variant is already in wishlist') || err?.type === 'invalid_data') {
          // showToast('Product already in favorites', 'info');
          setWishlistVariantIds(prev => new Set([...Array.from(prev), variantId]));
        } else {
          // showToast('Failed to add to favorites', 'error');
        }
      }
    } catch {
      // showToast('Failed to add to favorites', 'error');
    }
  };
  
  const removeFromFavourites = async (productId: string, productTitle: string) => {
    try {
      const customerToken = getCookie('_shopenup_jwt');
      if (!customerToken) {
        // Handle guest wishlist removal
        const productResponse = await sdk.client.fetch<{ product: unknown }>(
          `/store/products/${productId}`,
          { next: { tags: ['products'] } }
        );
        const variantId = (productResponse.product as { variants?: Array<{ id?: string }> })?.variants?.[0]?.id;
        if (variantId) {
          const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
          const updatedWishlist = guestWishlist.filter((id: string) => id !== variantId);
          localStorage.setItem('guest_wishlist', JSON.stringify(updatedWishlist));
          setWishlistVariantIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(variantId);
            return newSet;
          });
          // showToast(`${productTitle} removed from favorites!`, 'success');
        }
        return;
      }
      
      const res: { wishlist?: { items?: any[] } } = await sdk.client.fetch('/store/customers/me/wishlists', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer ${customerToken}`,
        },
      });
      const item = res?.wishlist?.items?.find((it: any) => it?.product_variant?.product?.id === productId);
      const itemId = item?.id;
      if (!itemId) {
        showToast('Item not found in favorites', 'info');
        return;
      }
      await sdk.client.fetch(`/store/customers/me/wishlists/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer ${customerToken}`,
        },
      });
      
      // Update local state
      const productResponse = await sdk.client.fetch<{ product: unknown }>(
        `/store/products/${productId}`,
        { next: { tags: ['products'] } }
      );
      const variantId = (productResponse.product as { variants?: Array<{ id?: string }> })?.variants?.[0]?.id;
      if (variantId) {
        setWishlistVariantIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(variantId);
          return newSet;
        });
      }
      
      updateFavouriteCount(res?.wishlist?.items?.length || 0);
    } catch {
      showToast('Failed to remove from favorites', 'error');
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... - AKSHAR AYURVED</title>
        </Head>
        <div className="bg-gradient-to-br from-green-50 to-yellow-50 min-h-screen">
          <Hero
            title="Loading Category..."
            subtitle="Please wait while we fetch the products"
            backgroundGradient="bg-[#CD8973]"
          />
          <Section>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading category...</p>
            </div>
          </Section>
        </div>
      </>
    );
  }

  if (error || !category) {
    return (
      <>
        <Head>
          <title>Category Not Found - AKSHAR AYURVED</title>
        </Head>
        <div className="bg-gradient-to-br from-[#CD8973] to-yellow-50 min-h-screen">
          <Hero
            title="Category Not Found"
            subtitle="The category you're looking for doesn't exist"
            backgroundGradient="bg-[#CD8973]"
          />
          <Section>
            <div className="text-center py-12">
              <Button 
                onClick={() => router.push('/products')}
                variant="primary"
                size="lg"
              >
                Back to Products
              </Button>
            </div>
          </Section>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{category.name} - AKSHAR AYURVED</title>
        <meta name="description" content={category.description} />
      </Head>
      
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F9F3F1 0%, #FFEFEA 100%)' }}>
        {/* <Hero
          title={category.name}
          subtitle={category.description || `Explore our ${category.name} collection`}
          backgroundGradient="bg-green-600"
        /> */}
        {/* Breadcrumb Section */}
      <Breadcrumb
        title={category.name}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: category.name }
        ]}
        imageSrc="/assets/images/bredcrumb-bg.jpg"
      />
        
        {/* Search and Filter Section */}
        <Section background="white" padding="sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#F4E5DF', color: '#C77B62' }}>
                {category.name}
              </span>
              <span className="text-gray-500">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>
            
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder={`Search in ${category.name}...`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ outline: 'none', boxShadow: '0 0 0 2px transparent' }}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Section>

        {/* Products Section */}
        <Section>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => {
                const imageSrc = p.image || '/placeholder-product.jpg';
                const price = p.price || 0;
                const originalPrice = p.originalPrice || 0;
                const showDiscount = originalPrice && originalPrice > price;
                const variantId = (((productsData?.products || []).find((x: any) => (x as any).id === p.id) as any))?.variants?.[0]?.id as string | undefined;
                const isWish = variantId ? wishlistVariantIds.has(variantId) : false;
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 group">
                    <div className="relative p-6 bg-white overflow-hidden h-[220px] flex items-center justify-center">
                      <img src={imageSrc} alt={p.name} className="object-contain max-h-full transition-transform duration-300 group-hover:scale-105" />
                      <button
                        className={`absolute right-4 top-4 w-8 h-8 rounded-full grid place-items-center shadow-sm border bg-white ${isWish ? 'border-[#CD8973]' : 'border-gray-200'}`}
                        aria-label="Wishlist"
                        onClick={async (e) => { 
                          e.stopPropagation(); 
                          if (isWish) {
                            await removeFromFavourites(p.id, p.name);
                          } else {
                            await addToFavourites(p.id, p.name);
                          }
                        }}
                      >
                        {isWish ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#CD8973]">
                            <path d="M12 21s-1-.45-1-1.35C7.55 16.36 4 13.28 4 9.5 4 7.5 5.5 6 7.5 6c1.54 0 2.54.99 3 1.67C11.96 6.99 12.96 6 14.5 6 16.5 6 18 7.5 18 9.5c0 3.78-3.55 6.86-7 10.15 0 .9-1 1.35-1 1.35z"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="p-4">
                      <button onClick={() => handleProductClick(p.id)} className="block text-left w-full">
                        <h3 className="font-semibold text-gray-900 text-base line-clamp-2 hover:opacity-90" style={{ textAlign: 'left' }}>{p.name}</h3>
                      </button>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-gray-900 font-semibold">
                          {showDiscount ? (
                            <>
                              <del className="mr-2 text-gray-400">₹{originalPrice}</del>₹{price}
                            </>
                          ) : (
                            <>₹{price}</>
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" style={{ color: '#F59E0B' }} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          <p className="text-sm text-gray-600">
                            {ratingsLoading
                              ? 'Loading...'
                              : `${(ratingsMap[p.id]?.rating ?? 0).toFixed(1)}/5 (${ratingsMap[p.id]?.reviewCount ?? 0})`}
                          </p>
                        </div>
                      </div>
                      <button
                        className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-md text-white px-5 py-2 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() => handleAddToCart(p.id)}
                        style={{ backgroundColor: '#CD8973' }}
                        disabled={addingToCart === p.id}
                      >
                        <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.826087 0C0.606995 0 0.396877 0.0870339 0.241955 0.241955C0.0870339 0.396877 0 0.606995 0 0.826087C0 1.04518 0.0870339 1.2553 0.241955 1.41022C0.396877 1.56514 0.606995 1.65217 0.826087 1.65217H2.29652C2.4166 1.65238 2.53358 1.69029 2.63096 1.76054C2.72834 1.8308 2.8012 1.92986 2.83926 2.04374L5.56287 10.2162C5.6843 10.5797 5.69917 10.9696 5.60665 11.3413L5.38278 12.2393C5.05317 13.5561 6.07835 14.8696 7.43478 14.8696H17.3478C17.5669 14.8696 17.777 14.7825 17.932 14.6276C18.0869 14.4727 18.1739 14.2626 18.1739 14.0435C18.1739 13.8244 18.0869 13.6143 17.932 13.4593C17.777 13.3044 17.5669 13.2174 17.3478 13.2174H7.43478C7.11261 13.2174 6.90609 12.953 6.98457 12.6416L7.15391 11.9659C7.18244 11.8516 7.24833 11.7501 7.34112 11.6775C7.43391 11.6049 7.54828 11.5654 7.66609 11.5652H16.5217C16.6953 11.5654 16.8646 11.511 17.0055 11.4095C17.1463 11.3081 17.2517 11.1649 17.3065 11.0002L19.508 4.39148C19.5494 4.26729 19.5607 4.13505 19.5409 4.00566C19.5211 3.87626 19.4709 3.75342 19.3943 3.64725C19.3178 3.54108 19.2171 3.45463 19.1005 3.39501C18.984 3.33539 18.855 3.30432 18.7241 3.30435H5.415C5.29478 3.30431 5.17762 3.26649 5.08007 3.19622C4.98253 3.12595 4.90954 3.0268 4.87143 2.91278L4.0883 0.565043C4.03349 0.400482 3.92828 0.257348 3.78757 0.15593C3.64686 0.0545128 3.4778 0 3.30435 0H0.826087Z" fill="currentColor" /></svg>
                        {addingToCart === p.id ? 'Adding...' : 'Add To Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? `We couldn't find any products matching "${searchQuery}" in ${category.name}.`
                  : `Currently, there are no products available in the ${category.name} category.`
                }
              </p>
              
              {searchQuery ? (
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setFilteredProducts(products);
                  }}
                  variant="primary"
                  size="lg"
                >
                  Clear Search
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => router.push('/products')}
                    variant="primary"
                    size="lg"
                  >
                    Browse All Products
                  </Button>
                  <Button 
                    onClick={() => router.push('/')}
                    variant="outline"
                    size="lg"
                  >
                    Back to Home
                  </Button>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* CTA Section */}
        <Section className='!bg-[#CD8973]' padding="lg">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Explore More {category.name}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#CD8973' }}>
              Discover our complete collection of authentic Ayurvedic products for your wellness journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-[#CD8973]"
                onClick={() => router.push('/products')}
              >
                Browse All Products
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-[#CD8973]"
                onClick={() => router.push('/')}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}