import React, { useState ,useEffect} from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button, Badge, Product360View, useToast } from '@components/ui';
import SimpleImageZoom from '@components/ui/SimpleImageZoom';
import { sdk } from '@lib/config';
import { HttpTypes } from '@shopenup/types';
import ProductVariantSelector from '@components/products/ProductVariantSelector';
import { useAddLineItem, useCartWithSync } from '@hooks/cart';
import { useCountryCode } from '@hooks/country-code';
import { useAppContext } from '../../context/AppContext';
import ProductReviews from "../../components/products/product-reviews"
import { useProductRating } from '../../hooks/useProductRating';


// Product interface based on Shopenup API response
interface Product {
  id: string;
  title: string;
  description: string;
  price?: number;
  original_price?: number;
  unit_price?: number;
  amount?: number;
  compare_at_price?: number;
  thumbnail?: string;
  images?: string[];
  status: string;
  handle?: string;
  length?: number;
  height?: number;
  width?: number;
  category?: {
    id: string;
    name: string;
  };
  tags?: string[];
  variants?: Array<{
    id: string;
    sku?: string;
    calculated_price?: {
      calculated_amount: number;
      original_amount?: number;
      currency_code: string;
    };
    options?: Array<{
      option_id: string;
      value: string;
    }>;
    prices?: Array<{
      amount?: number;
      original_amount?: number;
    }>;
  }>;
  options?: Array<{
    id: string;
    title: string;
    values?: Array<{
      value: string;
    }>;
  }>;
  metadata?: {
    weight?: string;
    ingredients?: string[];
    benefits?: string[];
    usage?: string;
    dosage?: string;
    precautions?: string[];
    certifications?: string[];
    shelf_life?: string;
    storage?: string;
    origin?: string;
    rating?: number;
    review_count?: number;
  };
  categories?: { id: string; name: string; value: string }[];
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
  product_variant_id?: string;
  product_variant: WishlistProductVariant;
}

interface Wishlist {
  id: string;
  items: WishlistItem[];
}


export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const { showToast } = useToast();
  const countryCode = useCountryCode();
  const addLineItemMutation = useAddLineItem();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [is360ViewActive, setIs360ViewActive] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [isInFav, setIsInWishlist] = useState(false);
  const { updateFavouriteCount } = useAppContext();

  // Get dynamic rating data
  const { rating: dynamicRating, reviewCount: dynamicReviewCount, loading: ratingLoading } = useProductRating(id as string);



  // Use React Query for product data to avoid duplicate API calls
  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      
      // Resolve a valid region_id (UUID) by looking up regions once and caching
      const cookieMatch = document.cookie.match(/(?:^|; )country-code=([^;]+)/)
      const countryCode = cookieMatch ? decodeURIComponent(cookieMatch[1]) : undefined
      let region_id = localStorage.getItem('region_id') || undefined

      if (!region_id) {
        try {
          const { regions } = await sdk.client.fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
            headers: {
              'x-publishable-api-key': process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || ''
            }
          })

          let matchedRegion: HttpTypes.StoreRegion | undefined
          if (Array.isArray(regions) && regions.length) {
            if (countryCode) {
              matchedRegion = regions.find(r => (r.countries || []).some(c => c.iso_2 === countryCode))
            }
            if (!matchedRegion) {
              // fallback to first region
              matchedRegion = regions[0]
            }
          }

          if (matchedRegion?.id) {
            region_id = matchedRegion.id as unknown as string
            localStorage.setItem('region_id', region_id)
            if (countryCode) {
              localStorage.setItem('country_code', countryCode)
            }
          }
        } catch {
          // ignore region fetch errors
        }
      }
      
      const query: Record<string, unknown> = {
        id: id,
        fields: "*variants.calculated_price,*categories"
      }
      if (region_id) {
        query.region_id = region_id
      }

      const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
        query,
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || '',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });

      const product = response.products[0];
      if (!product) {
        throw new Error('Product not found');
      }
      
      return product as unknown as Product;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const product = productData;
  const loading = productLoading;
  const error = productError?.message || null;

  // Use React Query for related products
  const {
    data: relatedProductsData,
    isLoading: relatedLoading,
  } = useQuery({
    queryKey: ['related-products', product?.categories?.[0]?.id],
    queryFn: async () => {
      if (!product || !product.categories || !product.categories[0] || !product.categories[0].id) {
        return [];
      }
      
      // For now, return empty array as related products logic is commented out
      // This can be implemented later when needed
      return [];
    },
    enabled: !!product && !!product.categories?.[0]?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  const relatedProducts: Product[] = relatedProductsData || [];

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setWishlistLoading(true);
        const response = await sdk.client.fetch<{ wishlist: Wishlist }>(
          '/store/customers/me/wishlists',
          {
            next: { tags: ['wishlist'] },
          }
        );
  
        setWishlist(response.wishlist || null);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      } finally {
        setWishlistLoading(false);
      }
    };
  
    fetchWishlist();
  }, [updateFavouriteCount]);

  
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

const customerToken = getCookie('_shopenup_jwt');

const addToFavourites = async (product: Product, selectedVariant?: any) => {
  try {
    // 1. Get correct variantId
    let variantId: string | null = null;

    if (selectedVariant && selectedVariant.id) {
      variantId = selectedVariant.id;
    } else if (product.variants && product.variants.length > 0) {
      // fallback: use first variant
      variantId = product.variants[0].id;
    }

    if (!variantId) {
      showToast("No variant available for this product", "error");
      return;
    }

    // 2. Handle guest wishlist
    if (!customerToken) {
      const guestWishlist = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");
      if (!guestWishlist.includes(variantId)) {
        guestWishlist.push(variantId);
        localStorage.setItem("guest_wishlist", JSON.stringify(guestWishlist));
      }
      showToast("Item added! Login to keep it in your wishlist.", "info");
      router.push("/login");
      return;
    }

    // 3. Fetch or create wishlist
    let wishlist;
    try {
      const wishlistRes: { wishlist?: any } = await sdk.client.fetch(
        "/store/customers/me/wishlists",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || "",
            "Authorization": `Bearer ${customerToken}`,
          },
        }
      );
      wishlist = wishlistRes?.wishlist;
    } catch {}

    if (!wishlist) {
      const createRes: { wishlist?: any } = await sdk.client.fetch(
        "/store/customers/me/wishlists",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || "",
            "Authorization": `Bearer ${customerToken}`,
          },
        }
      );
      wishlist = createRes?.wishlist;
    }

    if (!wishlist) {
      showToast("Could not create wishlist", "error");
      return;
    }

    // 4. Add correct variant to wishlist
    try {
      await sdk.client.fetch("/store/customers/me/wishlists/items", {
        method: "POST",
        body: {
          variant_id: variantId,
        },
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || "",
          "Authorization": `Bearer ${customerToken}`,
        },
      });

      const variantInfo = selectedVariant
        ? ` (${selectedVariant.options?.map((opt: any) => opt.value).join(", ")})`
        : "";

      showToast(`${product.title}${variantInfo} Added to favorites!`, "success");
      setIsInWishlist(true);
      updateFavouriteCount((wishlist?.items?.length || 0) + 1);
    } catch (err: any) {
      if (
        err?.message?.includes("Variant is already in wishlist") ||
        err?.type === "invalid_data"
      ) {
        showToast("Product already in favorites", "info");
      } else {
        console.error("Error adding to wishlist:", err);
        showToast("Failed to add to favorites", "error");
      }
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    showToast("Failed to add to favorites", "error");
  }
};

  const isInWishlist = wishlist?.items?.some(
  (item) => item?.product_variant_id === selectedVariant?.id
);

  // Handle case when ID is not available yet
  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
            <p className="text-gray-600">Please wait while we prepare the page.</p>
          </div>
        </div>
      </div>
    );
  }


  // Log the complete product structure for debugging
  if (product) {
    // console.log('🔍 Complete product structure:', JSON.stringify(product, null, 2));
  }
  
  // Success log
  if (product) {
    // console.log('✅ Product page rendered successfully');
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Product...</h1>
            <p className="text-gray-600">Please wait while we fetch the product details.</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The requested product could not be found.'}</p>
            <Button variant="primary" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!product || isLoading) return; // Prevent multiple rapid clicks
    
    setIsLoading(true);
    try {
      // Use selected variant if available, otherwise fallback to first variant
      let variantId: string | null = null;
      
      if (selectedVariant && selectedVariant.id) {
        variantId = selectedVariant.id;
      } else if (product.variants && product.variants.length > 0) {
        // Find a variant with calculated price
        const variantWithPrice = product.variants.find(v => 
          v.id && (v.calculated_price?.calculated_amount || (v.prices && v.prices.length > 0))
        );
        if (variantWithPrice && variantWithPrice.id) {
          variantId = variantWithPrice.id;
        } else if (product.variants[0] && product.variants[0].id) {
          variantId = product.variants[0].id;
        }
      }
      
      // If no valid variant found, show error
      if (!variantId) {
        throw new Error("No valid variant found for this product");
      }
        
      await addLineItemMutation.mutateAsync({
        variantId: variantId,
        quantity: quantity,
        countryCode: countryCode || 'in'
      });
      
      // Show success message
      const variantInfo = selectedVariant ? ` (${selectedVariant.options?.map((opt: any) => opt.value).join(', ') || ''})` : '';
      showToast(`${product.title}${variantInfo} (${quantity}) successfully added to cart!`, 'success');
      
    } catch {
      showToast('Failed to add item to cart. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const discountPercentage = product.original_price && product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  // Extract metadata with fallbacks
  const metadata = product.metadata || {};
  const weight = metadata.weight || '100g';
  const ingredients = metadata.ingredients || ['Natural ingredients'];
  const benefits = metadata.benefits || ['Health benefits'];
  const usage = metadata.usage || 'As directed by healthcare practitioner';
  const dosage = metadata.dosage || 'As recommended';
  const precautions = metadata.precautions || ['Consult healthcare provider'];
  const certifications = metadata.certifications || ['Quality assured'];
  const shelfLife = metadata.shelf_life || '24 months';
  const storage = metadata.storage || 'Store in cool, dry place';
  const origin = metadata.origin || 'India';
  // Use dynamic rating if available, otherwise fallback to metadata
  const rating = dynamicRating || metadata.rating || 4.5;
  const reviewCount = dynamicReviewCount || metadata.review_count || 0;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <Button variant="primary" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-green-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-green-600">Products</Link></li>
            <li>/</li>
            {/* <li><Link href={`/products/category/${product.category?.id || 'all'}`} className="hover:text-green-600">{product.category?.name || 'All Products'}</Link></li>
            <li>/</li> */}
            <li className="text-gray-900">{product.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Gallery */}
          <div>
            {/* View Toggle Buttons */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setIs360ViewActive(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !is360ViewActive
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📷 Gallery View
              </button>
              {/* {product.images && product.images.length > 1 && (
                <button
                  onClick={() => setIs360ViewActive(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    is360ViewActive
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔄 Gallery View
                </button>
              )} */}
            </div>

            {/* Main Image or Gallery View */}
            <div className="relative w-full rounded-lg overflow-hidden mb-4 bg-white border border-gray-200 shadow-md">
              {is360ViewActive && product.images && product.images.length > 1 ? (
                (() => {
                  // Extract valid image URLs
                  const validImages = Array.isArray(product.images)
                    ? product.images
                        .map((img: unknown) =>
                          typeof img === 'string'
                            ? img
                            : img && typeof img === 'object' && 'url' in img && typeof img.url === 'string'
                            ? img.url
                            : undefined
                        )
                        .filter(
                          (url): url is string =>
                            !!url &&
                            typeof url === 'string' &&
                            url !== 'null' &&
                            url !== 'undefined'
                        )
                    : [];
                  return (
                    <Product360View
                      images={validImages}
                      productName={product.title}
                      className="w-full h-96"
                      autoRotate={true}
                      autoRotateSpeed={1500}
                    />
                  );
                })()
              ) : (
                <div className="relative">
                  {(() => {
                    // Ensure images is an array and extract URLs from objects or strings
                    const validImages = Array.isArray(product.images)
                      ? product.images
                          .map((img: unknown) =>
                            typeof img === 'string'
                              ? img
                              : (img && typeof img === 'object' && 'url' in img && typeof img.url === 'string')
                                ? img.url
                                : undefined
                          )
                          .filter(
                            (url): url is string =>
                              !!url &&
                              typeof url === 'string' &&
                              url !== 'null' &&
                              url !== 'undefined'
                          )
                      : [];

                    const imageSrc = validImages[activeImageIndex] || product.thumbnail;
                    
                    if (imageSrc && typeof imageSrc === 'string') {
                      return (
                        <SimpleImageZoom
                          src={imageSrc}
                          alt={product.title}
                          width={600}
                          height={400}
                          zoomLevel={2.5}
                          className="w-full h-96"
                          containerClassName="relative"
                          responsive={true}
                        />
                      );
                    } else {
                      return (
                        <div className="w-full h-96 flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500">No image available</p>
                            <p className="text-xs text-gray-400 mt-2">Image source: {imageSrc || 'undefined'}</p>
                            {/* Test with a placeholder image */}
                            <div className="mt-4">
                              <Image
                                src="https://via.placeholder.com/400x300/cccccc/666666?text=No+Image"
                                alt="Placeholder"
                                width={200}
                                height={150}
                                className="mx-auto"
                              />
                              <p className="text-xs text-gray-400 mt-2">If you see this placeholder, Next.js images are working</p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })()}
                  
                  {/* Badges positioned absolutely over the zoom component */}
                  {discountPercentage > 0 && (
                    <Badge variant="danger" size="lg" className="absolute top-4 left-4 z-20">
                      -{discountPercentage}%
                    </Badge>
                  )}
                  {/* {certifications && certifications.length > 0 && (
                    <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
                      {certifications.slice(0, 2).map((cert, index) => (
                        <Badge key={index} variant="success" size="sm">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )} */}
                </div>
              )}
            </div>
            
            {/* Thumbnail Images - Only show in gallery view */}
            {!is360ViewActive && (() => {
              const validImages = Array.isArray(product.images)
                ? product.images
                    .map((img: unknown) =>
                      typeof img === 'string'
                        ? img
                        : img && typeof img === 'object' && 'url' in img
                        ? (img as { url?: string }).url
                        : undefined
                    )
                    .filter(
                      (url): url is string =>
                        !!url &&
                        typeof url === 'string' &&
                        url !== 'null' &&
                        url !== 'undefined'
                    )
                : [];
              return validImages.length > 1;
            })() && (
              <div className="flex space-x-2 overflow-x-auto">
                {(() => {
                  const validImages = Array.isArray(product.images)
                    ? product.images
                        .map((img: unknown) =>
                          typeof img === 'string'
                            ? img
                            : img && typeof img === 'object' && 'url' in img
                            ? (img as { url?: string }).url
                            : undefined
                        )
                        .filter(
                          (url): url is string =>
                            !!url &&
                            typeof url === 'string' &&
                            url !== 'null' &&
                            url !== 'undefined'
                        )
                    : [];
                  return validImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        activeImageIndex === index ? 'border-green-600' : 'border-gray-200'
                      }`}
                    >
                      {image && typeof image === 'string' ? (
                        <Image
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          width={80}
                          height={80}
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ));
                })()}
              </div>
            )}

            {/* Gallery View Info */}
            {is360ViewActive && product.images && product.images.length > 1 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-sm">Gallery View</p>
                    <p className="text-xs text-green-600">Click thumbnails to view different images</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <Badge variant="secondary" size="sm" className="mb-2">
              {product.category?.name || 'Product'}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {ratingLoading ? (
                  <span className="text-gray-400">Loading rating...</span>
                ) : (
                  `${rating} (${reviewCount} reviews)`
                )}
              </span>
            </div>

            {/* Product Description - Short Summary */}
            <div className="mb-6">
              <p className="text-gray-600 mb-4 leading-relaxed">
                {product.description && product.description.length > 200 
                  ? `${product.description.substring(0, 200)}...` 
                  : product.description
                }
              </p>
              
              {/* Key Points */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Highlights:</h4>
                <div className="space-y-2">
                  {benefits && benefits.length > 0 && benefits.slice(0, 3).map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 text-sm mt-1">•</span>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                  {ingredients && ingredients.length > 0 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 text-sm mt-1">•</span>
                      <span className="text-sm text-gray-700">Contains {ingredients.slice(0, 2).join(', ')} and natural ingredients</span>
                    </div>
                  )}
                  {usage && (
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 text-sm mt-1">•</span>
                      <span className="text-sm text-gray-700">{usage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Info */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Weight:</span>
                  <span className="text-gray-600 ml-2">{weight}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Origin:</span>
                  <span className="text-gray-600 ml-2">{origin}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Shelf Life:</span>
                  <span className="text-gray-600 ml-2">{shelfLife}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Status:</span>
                  <span className="text-gray-600 ml-2">{product.status}</span>
                </div>
              </div>
            </div>

            {/* Product Variants */}
            {product.variants && product.variants.length > 0 && product.options && product.options.length > 0 && (
              <div className="mb-6">
                <ProductVariantSelector
                  variants={product.variants}
                  options={product.options}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                  onImageChange={setActiveImageIndex}
                />
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                {(() => {
                  // Use selected variant price if available, otherwise fallback to product price
                  let price: number | null = null;
                  let originalPrice: number | null = null;
                  
                  if (selectedVariant && selectedVariant.calculated_price) {
                    price = selectedVariant.calculated_price.calculated_amount;
                    originalPrice = selectedVariant.calculated_price.original_amount || null;
                  } else if (selectedVariant && selectedVariant.prices && selectedVariant.prices.length > 0) {
                    price = selectedVariant.prices[0].amount || null;
                    originalPrice = selectedVariant.prices[0].original_amount || null;
                  } else {
                    // Fallback to product price
                    if (typeof product.price === "number") price = product.price;
                    else if (typeof product.unit_price === "number") price = product.unit_price;
                    else if (typeof product.amount === "number") price = product.amount;
                    
                    // Try variants with calculated_price (Shopenup structure)
                    if (!price && product.variants && product.variants.length > 0) {
                      const variant = product.variants[0];
                      if (variant.calculated_price?.calculated_amount) {
                        price = variant.calculated_price.calculated_amount;
                        originalPrice = variant.calculated_price.original_amount || null;
                      } else if (variant.prices && variant.prices.length > 0) {
                        price = variant.prices[0].amount || null;
                        originalPrice = variant.prices[0].original_amount || null;
                      }
                    }
                    
                    // Try metadata or other fields
                    if (!price && (product.metadata as Record<string, unknown>)?.price) {
                      price = (product.metadata as Record<string, unknown>).price as number;
                    }
                  }
                  
                  if (price) {
                    return (
                      <>
                        <span className="text-3xl font-bold text-green-600">₹{price}</span>
                        {originalPrice && originalPrice > price && (
                          <span className="text-xl text-gray-500 line-through">₹{originalPrice}</span>
                        )}
                      </>
                    );
                  } else {
                    return <span className="text-3xl font-bold text-gray-400">Price not available</span>;
                  }
                })()}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={isLoading || (product.variants && product.variants.length > 0 && !selectedVariant)}
                fullWidth
              >
                {isLoading 
                  ? 'Adding...' 
                  : product.variants && product.variants.length > 0 && !selectedVariant
                    ? 'Select Variant'
                    : 'Add to Cart'
                }
              </Button>
              
              {/* add to favourites button */}
              <Button
                variant="secondary"
                size="lg"
                onClick={() => addToFavourites(product,selectedVariant)}
                className="bg-transparent p-0 border-none outline-none cursor-pointer hover:bg-transparent focus:bg-transparent"
              >
                <svg
                  className={`w-6 h-6 transition-colors ${isInWishlist ? "text-red-600 fill-red-600" : "text-black fill-none"
                    }`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </Button>


            </div>
            
            {/* Trust Indicators */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-xs font-medium text-gray-900">100% Authentic</p>
                </div>
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <p className="text-xs font-medium text-gray-900">Free Shipping</p>
                </div>
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-xs font-medium text-gray-900">Easy Returns</p>
                </div>
              </div>
            </div>

            {/* Full Product Description */}
            {/* <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Description</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['description', 'ingredients', 'usage', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'description' && 'Product Details'}
                  {tab === 'ingredients' && 'Ingredients & Benefits'}
                  {tab === 'usage' && 'Usage & Dosage'}
                  {tab === 'reviews' && 'Customer Reviews'}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {/* Product Details Tab */}
            {activeTab === 'description' && (
              <div className="max-w-4xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">About {product.title}</h3>
                <div className="prose prose-lg max-w-none">
                  {/* Full Description */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                      {product.description}
                    </p>
                    
                    {/* Key Benefits */}
                    {benefits && benefits.length > 0 && (
                      <div className="mb-6">
                        <h5 className="text-md font-semibold text-gray-900 mb-3">Key Benefits:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="text-green-600 text-sm mt-1">•</span>
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Ingredients */}
                    {ingredients && ingredients.length > 0 && (
                      <div className="mb-6">
                        <h5 className="text-md font-semibold text-gray-900 mb-3">Ingredients:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {ingredients.map((ingredient, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="text-green-600 text-sm mt-1">•</span>
                              <span className="text-sm text-gray-700">{ingredient}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Usage Instructions */}
                    {usage && (
                      <div className="mb-6">
                        <h5 className="text-md font-semibold text-gray-900 mb-3">Usage Instructions:</h5>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-gray-700 text-sm">{usage}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Specifications</h4>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Weight</dt>
                          <dd className="font-medium text-gray-900">{weight}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Status</dt>
                          <dd className="font-medium text-gray-900">{product.status}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Shelf Life</dt>
                          <dd className="font-medium text-gray-900">{shelfLife}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Origin</dt>
                          <dd className="font-medium text-gray-900">{origin}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Storage</dt>
                          <dd className="font-medium text-gray-900">{storage}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h4>
                      <div className="space-y-2">
                        {certifications.map((cert, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              )}

            {/* Ingredients Tab */}
            {activeTab === 'ingredients' && (
              <div className="max-w-4xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ingredients & Benefits</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Pure Ingredients</h4>
                    <ul className="space-y-3">
                      {ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{ingredient}</span>
                        </li>
                      ))}              
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Health Benefits</h4>
                    <ul className="space-y-3">
                      {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && (
              <div className="max-w-4xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Usage Instructions & Dosage</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h4>
                    <div className="bg-green-50 rounded-lg p-6 mb-6">
                      <p className="text-gray-700 leading-relaxed">{usage}</p>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommended Dosage</h4>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <p className="text-gray-700 font-medium">{dosage}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Important Precautions</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <ul className="space-y-2">
                        {precautions.map((precaution, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700 text-sm">{precaution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <ProductReviews productId={product.id} />
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16 border-t border-gray-200 pt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedLoading ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500 text-center">Loading related products...</p>
                </div>
              </div>
            ) : relatedProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500 text-center">No related products found.</p>
                </div>
              </div>
            ) : (
              relatedProducts.map((related) => (
                <div key={related.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/products/${related.id}`}>
                    <div className="relative h-48 flex items-center justify-center">
                      {related.thumbnail ? (
                        <Image src={related.thumbnail} alt={related.title} fill className="object-contain" />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{related.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{related.description?.slice(0, 60)}...</p>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 border-t border-gray-200 pt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="space-y-6">
            {[
              {
                question: 'How long does it take to see results?',
                answer: 'Most customers notice improvements within 2-4 weeks of consistent use. For best results, we recommend using the product for at least 2-3 months as suggested in Ayurvedic practices.'
              },
              {
                question: 'Are there any side effects?',
                answer: 'Our products are made from natural ingredients and are generally safe when used as directed. However, some people may experience mild digestive discomfort initially. If you have any medical conditions or are taking medications, please consult your healthcare provider.'
              },
              {
                question: 'Can I take this with other supplements?',
                answer: 'While our products are natural, we recommend consulting with your healthcare provider before combining with other supplements or medications to ensure there are no interactions.'
              },
              {
                question: 'What is your return policy?',
                answer: 'We offer a 30-day money-back guarantee. If you&apos;re not satisfied with your purchase, you can return the product within 30 days for a full refund.'
              },
              {
                question: 'How should I store this product?',
                answer: `Store in ${storage.toLowerCase()}. Keep the container tightly closed and away from moisture. Do not refrigerate unless specifically mentioned.`
              }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-3">{faq.question}</h4>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}