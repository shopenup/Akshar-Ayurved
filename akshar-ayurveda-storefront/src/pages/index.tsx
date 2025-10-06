import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

import {
  BannerCarousel,
  ProductCarousel,
  NewsletterSignup,
  TrustSection,
  BlogSection,
  FeatureHighlights,
  WhatsAppFloat,
  BackToTop,
  Button,
  Spinner,
  useToast
} from '../components/ui';
import homepageData from '../data/homepage-data.json';
import { getIconComponent } from '../utils/icons';
import { useNewArrivals } from '@hooks/useShopenupProducts';
import { getCategoriesList } from '../lib/shopenup/categories';
import { sdk } from '../lib/config';
import { useCountryCode } from '@hooks/country-code';
import { useAddLineItem } from '@hooks/cart';
import { useAppContext } from '../context/AppContext';

interface Category {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  product_count?: number;
  product_thumbnail?: string;
  image?: string;
}

interface Product {
  id: string;
  title: string;
  thumbnail?: string;
  images?: Array<{ url: string }>;
  variants?: Array<{ id: string }>;
}

interface ProductResponse {
  count: number;
  products: Product[];
}

export default function HomePage() {
  // Use Shopenup product hooks
  const { products: newArrivals, loading: newArrivalsLoading, error: newArrivalsError } = useNewArrivals(8);
  const { showToast } = useToast();
  const router = useRouter();
  const [favouritedIds, setFavouritedIds] = React.useState<Set<string>>(new Set());
  const { updateFavouriteCount } = useAppContext();
  const countryCode = useCountryCode() || 'in';
  const { mutateAsync: addLineItem } = useAddLineItem();
  // Remove useCategories hook
  // const { categories: shopenupCategories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  const [categoriesError, setCategoriesError] = React.useState<string | null>(null);
  const [testimonialIndex, setTestimonialIndex] = React.useState(0);
  const sliderRef = React.useRef<HTMLDivElement | null>(null);
  const [cardPixelWidth, setCardPixelWidth] = React.useState<number>(0);
  const [ratingsMap, setRatingsMap] = React.useState<Record<string, { rating: number; reviewCount: number }>>({});
  const [ratingsLoading, setRatingsLoading] = React.useState(true);
   const [isInWishlist, setIsInWishlist] = React.useState(false);
  const testimonialsData = [
    {
      name: 'Priya Sharma',
      rating: 5,
      quote:
        'The Ashwagandha powder has been a game‑changer for my stress management. I feel more balanced and energized throughout the day.'
    },
    {
      name: 'Rajesh Kumar',
      rating: 5,
      quote:
        "I've been using their turmeric products for months now. The quality is exceptional and I can feel the difference in my overall health."
    },
    {
      name: 'Anjali Patel',
      rating: 4,
      quote:
        'As a nutritionist, I recommend their products to my clients. The organic certification and traditional preparation methods are impressive.'
    }
  ];

  React.useEffect(() => {
    if (!testimonialsData.length) return;
    const id = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % testimonialsData.length);
    }, 5000);
    return () => clearInterval(id);
  }, [testimonialsData.length]);

  React.useEffect(() => {
    // Measure a single card width (including gap of 24px from gap-6)
    if (!sliderRef.current) return;
    const firstCard = sliderRef.current.querySelector('[data-testimonial-card]') as HTMLElement | null;
    if (firstCard) {
      const width = firstCard.getBoundingClientRect().width;
      if (width && Math.abs(width - cardPixelWidth) > 1) setCardPixelWidth(width);
    }
  }, [cardPixelWidth]);

  React.useEffect(() => {
    if (!sliderRef.current || !cardPixelWidth) return;
    const gap = 24; // gap-6
    const offset = (cardPixelWidth + gap) * (testimonialIndex % testimonialsData.length);
    sliderRef.current.style.transform = `translateX(-${offset}px)`;
  }, [testimonialIndex, cardPixelWidth]);


  // Function to get product count and thumbnail for a category
  const getCategoryData = async (categoryId: string) => {
    try {
      const response = await sdk.client.fetch<ProductResponse>('/store/products', {
        query: {
          category_id: categoryId,
          limit: 1,
          offset: 0,
          fields: 'thumbnail,images',
        },
        next: { tags: ['products'] },
      });

      const productCount = response.count || 0;
      const productThumbnail = response.products?.[0]?.thumbnail ||
        response.products?.[0]?.images?.[0]?.url ||
        null;

      return { productCount, productThumbnail };
    } catch {
      return { productCount: 0, productThumbnail: null };
    }
  };

  React.useEffect(() => {
    const fetchCategoriesWithCounts = async () => {
      try {
        const res = await getCategoriesList();

        const categoriesWithCounts = await Promise.all(
          (res.product_categories || []).map(async (category: Category) => {
            const { productCount, productThumbnail } = await getCategoryData(category.id);
            return {
              ...category,
              product_count: productCount,
              product_thumbnail: productThumbnail || undefined
            };
          })
        );

        setCategories(categoriesWithCounts as Category[]);
        setCategoriesLoading(false);
      } catch (err: unknown) {
        setCategoriesError(err instanceof Error ? err.message : 'Failed to fetch categories');
        setCategoriesLoading(false);
      }
    };

    fetchCategoriesWithCounts();
  }, []);

  // Collections removed as they're not used

  // Transform feature highlights to include icon components
  const featureHighlights = homepageData.featureHighlights.map(feature => ({
    ...feature,
    icon: React.createElement(getIconComponent(feature.icon))
  }));

  // Use dynamic categories if available, fallback to static
  const displayCategories = categories.length > 0
    ? categories.map((cat: Category) => ({
      id: cat.id,
      name: cat.name,
      image: cat.product_thumbnail || cat.image || `https://dummyimage.com/300x300/4ade80/ffffff?text=${encodeURIComponent(cat.name)}`,
      count: cat.product_count !== undefined ? cat.product_count : '...'
    }))
    : homepageData.categories;


  const handleProductClick = (productId: string) => {
    // Navigate to product detail page
    router.push(`/products/${productId}`);
  };

  // const handleAddToCart = (productId: string) => {
  // };

  const handleAddToCart = async (productId: string) => {
    try {
      // Find the product
      const product = newArrivals?.find(p => p.id === productId);

      if (!product) {
        showToast('Product not found', 'error');
        return;
      }

      // Get the first variant ID (most products have only one variant)
      const productResponse = await sdk.client.fetch<{ product: Product }>(
        `/store/products/${productId}`,
        {
          next: { tags: ['products'] },
        }
      );

      const variantId = productResponse.product?.variants?.[0]?.id;
      if (!variantId) { return; }

      await addLineItem({
        variantId,
        quantity: 1,
        countryCode
      });

      showToast(`${product.title} added to cart`, 'success');

    } catch {
      showToast('Failed to add product to cart', 'error');
    }
  };

  React.useEffect(() => {
    const fetchRatings = async () => {
      if (!newArrivals?.length) return;
      setRatingsLoading(true);
      try {
        const productIds = newArrivals.map(p => p.id).slice(0, 50); // API limit
        const response = await sdk.client.fetch<{
          ratings: Array<{ product_id: string; average_rating: number; total_reviews: number }>
        }>('/store/reviews', {
          query: { product_ids: productIds.join(',') },
          next: { tags: ['product-ratings'] },
          cache: 'no-store',
        });
  
        const ratingsMap: Record<string, { rating: number; reviewCount: number }> = {};
        response.ratings?.forEach(r => {
          ratingsMap[r.product_id] = {
            rating: r.average_rating || 0,
            reviewCount: r.total_reviews || 0
          };
        });
  
        setRatingsMap(ratingsMap);
  
      } catch (err) {
        console.error('Failed to fetch product ratings', err);
      } finally {
        setRatingsLoading(false);
      }
    };
  
    fetchRatings();
  }, [newArrivals]);

  // Wishlist helpers
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Load wishlist once to mark favourites
  React.useEffect(() => {
    (async () => {
      try {
        const customerToken = getCookie('_shopenup_jwt');
        if (!customerToken) {
          // guest wishlist: store variant ids; we can't map product ids without product fetch, skip preload
          updateFavouriteCount(0);
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
        const prodIds = new Set<string>();
        res?.wishlist?.items?.forEach((it: any) => {
          const pid = it?.product_variant?.product?.id;
          if (pid) prodIds.add(pid);
        });
        setFavouritedIds(prodIds);
        updateFavouriteCount(prodIds.size);
      } catch {}
    })();
  }, []);

  const addToFavourites = async (productId: string, productTitle: string) => {
    try {
      const productResponse = await sdk.client.fetch<{ product: Product }>(
        `/store/products/${productId}`,
        { next: { tags: ['products'] } }
      );
      const variantId = productResponse.product?.variants?.[0]?.id;
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
        }
      setFavouritedIds(prev => {
        const next = new Set(prev);
        next.add(productId);
        updateFavouriteCount(next.size);
        return next;
      });
        showToast('Item added! Login to keep it in your wishlist.', 'info');
        router.push('/login');
        return;
      }

      // Ensure wishlist exists
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
        showToast('Could not create wishlist', 'error');
        return;
      }

      await sdk.client.fetch('/store/customers/me/wishlists/items', {
        method: 'POST',
        body: { variant_id: variantId },
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer ${customerToken}`,
        },
      });
      setFavouritedIds(prev => {
        const next = new Set(prev);
        next.add(productId);
        updateFavouriteCount(next.size);
        return next;
      });
    } catch {
      // silent
    }
  };

  const removeFromFavourites = async (productId: string) => {
    try {
      const customerToken = getCookie('_shopenup_jwt');
      if (!customerToken) {
        // guest wishlist removal: nothing stored by product id; skip
        setFavouritedIds(prev => { const n = new Set(prev); n.delete(productId); updateFavouriteCount(n.size); return n; });
        return;
      }
      // find wishlist item id by product id
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
        setFavouritedIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
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
      setFavouritedIds(prev => { const n = new Set(prev); n.delete(productId); updateFavouriteCount(n.size); return n; });
    } catch {
      // silent
    }
  };

  

  const handleNewsletterSubmit = async () => {
    // Add your newsletter subscription logic here
  };

  // Static hero banners matching template
  const heroBanners = [
    {
      id: 'hero-1',
      title: 'We Are Here To Give You The Best',
      highlight: 'Herb Products',
      subtitle:
        'Aim to provide pure and genuine Classical & Patent Ayurvedic',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      image: '/assets/images_New/ban-head-Image.png',
      backgroundImage: '/assets/images_New/banner-bg.png',
      backgroundColor: '#ffffff',
      textColor: '#1f2937'
    },
    {
      id: 'hero-3',
      title: 'Natural Wellness',
      highlight: 'For Everyone',
      subtitle:
        'Experience the healing power of nature with our premium Ayurvedic collection',
      buttonText: 'Learn More',
      buttonLink: '/about',
      image: '/assets/images_New/banner_3.png',
      backgroundImage: '/assets/images_New/banner-bg.png',
      backgroundColor: '#ffffff',
      textColor: '#1f2937'
    }
  ];

  return (
    <>
      <Head>
        <title>AKSHAR AYURVED</title>
        <meta name="description" content="Discover authentic Ayurvedic products for holistic wellness. Shop natural supplements, herbal remedies, and wellness solutions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/assets/images/favicon.png" />

      </Head>

      {/* Feature Highlights Bar */}
      {/* <FeatureHighlights features={featureHighlights} background="green" /> */}

      {/* Hero Banner Carousel */}
      <BannerCarousel
        banners={heroBanners}
        autoPlay={true}
        interval={5000}
        showArrows={true}
        showDots={true}
        height="h-[860px]"
        className="-mt-20 lg:-mt-20"
      />

      {/* Popular Categories - Care Slider UI */}
      <section className="py-20  pt-60 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#cd8973]">POPULAR CATEGORIES</h2>
        </div>
        <div className="relative">
          <div className="px-4 sm:px-6 lg:px-8">
            {categoriesLoading ? (
              <div className="flex justify-center py-8"><Spinner size="lg" /></div>
            ) : categoriesError ? (
              <div className="text-center py-8 text-red-600">Error loading categories: {categoriesError}</div>
            ) : (
              <div id="care-scroll" className="flex justify-center flex-wrap gap-6">
                {displayCategories.map((cat) => (
                  <Link key={cat.id} href={`/products/category/${cat.id}`} className="flex-shrink-0 group">
                    <div className="w-[220px] text-center transition-transform duration-300">
                      <div className="bg-white rounded-2xl shadow-md p-6 h-[200px] flex items-center justify-center border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          width={160}
                          height={160}
                          className="object-contain max-h-full transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = `https://dummyimage.com/200x200/ffffff/aaaaaa.png&text=${encodeURIComponent(cat.name)}`;
                          }}
                        />
                      </div>
                      <h3 className="mt-3 font-semibold text-gray-800 transition-colors duration-300 group-hover:text-green-700">{cat.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          {/* Prev/Next Buttons */}
          <button
            type="button"
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[#D6CDCA] absolute left-2 top-1/2 -translate-y-1/2 shadow"
            onClick={() => {
              const el = document.getElementById('care-scroll');
              if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
            }}
            aria-label="Previous"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="#4b4b4b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button
            type="button"
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[#CD8973] absolute right-2 top-1/2 -translate-y-1/2 shadow"
            onClick={() => {
              const el = document.getElementById('care-scroll');
              if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
            }}
            aria-label="Next"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </section>

      {/* New Arrivals  - Top Products UI */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {/* <h5 className="text-sm font-semibold uppercase tracking-widest text-[#cd8973] mb-2">Medicine</h5> */}
            <h3 className="text-3xl md:text-4xl font-bold text-[#cd8973]">Our Top Products</h3>
          </div>
          {newArrivalsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : newArrivalsError ? (
            <div className="text-center py-8 text-red-600">
              Error loading new arrivals: {newArrivalsError}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newArrivals.slice(0, 8).map((p) => {
                  const imageSrc = p.thumbnail || (typeof p.images?.[0] === 'string' ? p.images[0] : (p.images?.[0] as { url?: string })?.url) || `https://dummyimage.com/300x300/ffffff/aaaaaa.png&text=${encodeURIComponent(p.title)}`;
                  const directPrice = (p as any).price || 0;
                  const calcPrice = (p as any)?.variants?.[0]?.calculated_price?.calculated_amount || 0;
                  const price = calcPrice || directPrice;
                  const originalPrice = (p as any).originalPrice || 0;
                  const discount = originalPrice && price && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                  return (
                    <div key={p.id} className="ayur-tpro-box bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 group">
                      <div className="relative p-6 flex items-center justify-center h-[220px] overflow-hidden">
                        <Image src={imageSrc} alt={p.title} width={200} height={200} className="object-contain max-h-full transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute right-4 top-4">
                          <button
                            className={`w-8 h-8 rounded-full grid place-items-center shadow-sm transition-opacity duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 border bg-white ${favouritedIds.has(p.id) ? 'border-[#CD8973]' : 'border-gray-200'}`}
                            aria-label="Wishlist"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (favouritedIds.has(p.id)) {
                                removeFromFavourites(p.id);
                              } else {
                                addToFavourites(p.id, p.title);
                              }
                            }}
                          >
                            {favouritedIds.has(p.id) ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#CD8973]"><path d="M12 21s-1-.45-1-1.35C7.55 16.36 4 13.28 4 9.5 4 7.5 5.5 6 7.5 6c1.54 0 2.54.99 3 1.67C11.96 6.99 12.96 6 14.5 6 16.5 6 18 7.5 18 9.5c0 3.78-3.55 6.86-7 10.15 0 .9-1 1.35-1 1.35z"/></svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="px-6 pb-6">
                        <Link href={`/products/${p.id}`} className="block">
                          <h3 className="font-semibold text-gray-900 text-base text-center line-clamp-2 min-h-[44px] hover:text-green-700 transition-colors duration-300">{p.title}</h3>
                        </Link>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-gray-900 font-semibold">
                            {originalPrice && originalPrice > price ? (
                              <>
                                <del className="mr-2 text-gray-400">₹{originalPrice}</del>₹{price}
                              </>
                            ) : (
                              <>₹{price}</>
                            )}
                          </p>
                          <div className="flex items-center gap-2">
                            <Image src="/assets/images_New/star-icon.png" alt="star" width={16} height={16} />
                            <p className="text-sm text-gray-600">
                              {ratingsLoading
                                ? 'Loading...'
                                : `${ratingsMap[p.id]?.rating?.toFixed(1) || '4.5'}/5 `}
                                {/* ${ratingsMap[p.id]?.reviewCount || 0}`} */}
                            </p>
                          </div>
                        </div>
                        <button
                          className="w-full mt-4 inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-300 bg-white text-gray-700 px-3 py-2 text-sm font-medium hover:bg-gray-50 whitespace-nowrap"
                          onClick={() => handleAddToCart(p.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.826087 0C0.606995 0 0.396877 0.0870339 0.241955 0.241955C0.0870339 0.396877 0 0.606995 0 0.826087C0 1.04518 0.0870339 1.2553 0.241955 1.41022C0.396877 1.56514 0.606995 1.65217 0.826087 1.65217H2.29652C2.4166 1.65238 2.53358 1.69029 2.63096 1.76054C2.72834 1.8308 2.8012 1.92986 2.83926 2.04374L5.56287 10.2162C5.6843 10.5797 5.69917 10.9696 5.60665 11.3413L5.38278 12.2393C5.05317 13.5561 6.07835 14.8696 7.43478 14.8696H17.3478C17.5669 14.8696 17.777 14.7825 17.932 14.6276C18.0869 14.4727 18.1739 14.2626 18.1739 14.0435C18.1739 13.8244 18.0869 13.6143 17.932 13.4593C17.777 13.3044 17.5669 13.2174 17.3478 13.2174H7.43478C7.11261 13.2174 6.90609 12.953 6.98457 12.6416L7.15391 11.9659C7.18244 11.8516 7.24833 11.7501 7.34112 11.6775C7.43391 11.6049 7.54828 11.5654 7.66609 11.5652H16.5217C16.6953 11.5654 16.8646 11.511 17.0055 11.4095C17.1463 11.3081 17.2517 11.1649 17.3065 11.0002L19.508 4.39148C19.5494 4.26729 19.5607 4.13505 19.5409 4.00566C19.5211 3.87626 19.4709 3.75342 19.3943 3.64725C19.3178 3.54108 19.2171 3.45463 19.1005 3.39501C18.984 3.33539 18.855 3.30432 18.7241 3.30435H5.415C5.29478 3.30431 5.17762 3.26649 5.08007 3.19622C4.98253 3.12595 4.90954 3.0268 4.87143 2.91278L4.0883 0.565043C4.03349 0.400482 3.92828 0.257348 3.78757 0.15593C3.64686 0.0545128 3.4778 0 3.30435 0H0.826087Z" fill="#6b7280" /></svg>
                          Add To Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center mt-8">
                <Link href="/products" className="ayur-btn bg-[#CD8973] hover:bg-[#B8755F] text-white px-8 py-3 rounded-md">
                  View More
                </Link>
              </div>
            </>
          )}
        </div>
        {/* Background shapes like template */}
        <div className="pointer-events-none select-none absolute inset-0 -z-10">
          {/* Large decorative leaf on the left */}
          {/* <Image
            src="/assets/images/bg-leaf1.png"
            alt="bg leaf left"
            width={360}
            height={520}
            className="hidden md:block absolute left-0 top-0"
          /> */}
          {/* Bottom-right shape */}
          {/* <Image
            src="/assets/images/bg-shape1.png"
            alt="bg shape"
            width={420}
            height={220}
            className="hidden md:block absolute right-0 bottom-0"
          /> */}
        </div>
      </section>

      {/* Who We Are (About) Section - matched to template */}
      <section className="relative py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Image with experience badge */}
            <div className="relative flex justify-center lg:justify-start">
              <div className="relative w-full max-w-md">
                <Image
                  //   src="/assets/images/about-img.png" // not found
                  src="/assets/images_New/about-img.png"
                  alt="About Akshar Ayurveda"
                  width={520}
                  height={520}
                  className="w-full h-auto object-contain"
                />
                <div className="absolute -bottom-6 -right-6 bg-white shadow-lg rounded-xl px-6 py-4 text-center">
                  <p className="text-4xl font-bold text-[#CD8973] leading-none">15K+</p>
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Happy Customers</p>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div>
              <h5 className="text-sm font-semibold uppercase tracking-widest text-[#cd8973] mb-2">Who We Are</h5>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Natural Way To Achieving Balance And Optimal Health</h3>
              <p className="text-gray-600 mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              <Link href="/about" className="inline-block">
                <span className="ayur-btn bg-[#CD8973] hover:bg-[#B8755F] text-white px-8 py-3 rounded-md">Know More</span>
              </Link>
            </div>
          </div>
        </div>
        {/* Background shapes */}
        <div className="pointer-events-none select-none absolute inset-0">
          <Image src="/assets/images/bg-shape2.png" alt="bg shape" width={420} height={220} className="hidden md:block absolute left-0 bottom-0 opacity-80" />
          <Image src="/assets/images/bg-leaf2.png" alt="bg leaf" width={320} height={320} className="hidden md:block absolute right-4 top-6 float-right-leaf" />
        </div>
      </section>

      {/* Ayurvedic Medicines */}
      {/* Our Recent Achievements - template UI with background pattern */}
      <section className="relative py-16 bg-white overflow-hidden">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              backgroundImage: "url('/assets/images_New/achievement-bg.png')",
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}
          >
            <div className="p-6 sm:p-10 lg:p-12">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-4">
                    <div className="mb-6">
                      <h5 className="text-sm font-semibold uppercase tracking-widest text-[#CD8973]">Our Recent Achievements</h5>
                      <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Benefit From Choosing The Best</h3>
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Row 1 */}
                      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex items-center group hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center gap-3 sm:gap-5 w-full">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#CD8973' }}>
                            <Image src="/assets/images_New/achieve-icon1.png" alt="Years Experience" width={28} height={28} className="w-7 h-7 sm:w-9 sm:h-9 flip-icon" />
                          </div>
                          <div className="h-8 sm:h-10 w-px bg-gray-200" />
                          <div>
                            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">20+</div>
                            <div className="text-xs sm:text-sm text-gray-600">Years Experience</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex items-center group hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center gap-3 sm:gap-5 w-full">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#CD8973' }}>
                            <Image src="/assets/images_New/achieve-icon2.png" alt="Happy Customers" width={28} height={28} className="w-7 h-7 sm:w-9 sm:h-9 flip-icon" />
                          </div>
                          <div className="h-8 sm:h-10 w-px bg-gray-200" />
                          <div>
                            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">60+</div>
                            <div className="text-xs sm:text-sm text-gray-600">Happy Customers</div>
                          </div>
                        </div>
                      </div>
                      {/* Row 2 */}
                      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex items-center group hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center gap-3 sm:gap-5 w-full">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#CD8973' }}>
                            <Image src="/assets/images_New/achieve-icon3.png" alt="Our Products" width={28} height={28} className="w-7 h-7 sm:w-9 sm:h-9 flip-icon" />
                          </div>
                          <div className="h-8 sm:h-10 w-px bg-gray-200" />
                          <div>
                            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">800+</div>
                            <div className="text-xs sm:text-sm text-gray-600">Our Products</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex items-center group hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center gap-3 sm:gap-5 w-full">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#CD8973' }}>
                            <Image src="/assets/images_New/achieve-icon4.png" alt="Product Purity" width={28} height={28} className="w-7 h-7 sm:w-9 sm:h-9 flip-icon" />
                          </div>
                          <div className="h-8 sm:h-10 w-px bg-gray-200" />
                          <div>
                            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">100%</div>
                            <div className="text-xs sm:text-sm text-gray-600">Product Purity</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Product - HTML UI adapted */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h5 className="text-sm font-semibold uppercase tracking-widest text-[#cd8973]">Product</h5>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Trending Product</h3>
          </div>
          {newArrivalsLoading ? (
            <div className="flex justify-center py-8"><Spinner size="lg" /></div>
          ) : newArrivalsError ? (
            <div className="text-center py-8 text-red-600">Error loading products: {newArrivalsError}</div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.slice(0, 4).map((p) => {
                const imageSrc = p.thumbnail || (typeof p.images?.[0] === 'string' ? p.images[0] : (p.images?.[0] as { url?: string })?.url) || `https://dummyimage.com/300x300/ffffff/aaaaaa.png&text=${encodeURIComponent(p.title)}`;
                const calcPrice = (p as any)?.variants?.[0]?.calculated_price?.calculated_amount || 0;
                const directPrice = (p as any).price || 0;
                const price = calcPrice || directPrice;
                const originalPrice = (p as any).originalPrice || 0;
                const showDiscount = originalPrice && originalPrice > price;
                const discountPct = showDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                return (
                  <div key={p.id} className="ayur-tpro-box ayur-trepro-box bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 group">
                    <div className="relative ayur-tpro-img p-4 bg-white overflow-hidden">
                      <Image src={imageSrc} alt={p.title} width={360} height={260} className="w-full h-56 object-contain transition-transform duration-300 group-hover:scale-105" />
                      <button
                        className={`absolute right-4 top-4 w-8 h-8 rounded-full grid place-items-center shadow-sm transition-opacity duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 border bg-white ${favouritedIds.has(p.id) ? 'border-[#CD8973]' : 'border-gray-200'}`}
                        aria-label="Wishlist"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (favouritedIds.has(p.id)) {
                            removeFromFavourites(p.id);
                          } else {
                            addToFavourites(p.id, p.title);
                          }
                        }}
                      >
                        {favouritedIds.has(p.id) ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#CD8973]"><path d="M12 21s-1-.45-1-1.35C7.55 16.36 4 13.28 4 9.5 4 7.5 5.5 6 7.5 6c1.54 0 2.54.99 3 1.67C11.96 6.99 12.96 6 14.5 6 16.5 6 18 7.5 18 9.5c0 3.78-3.55 6.86-7 10.15 0 .9-1 1.35-1 1.35z"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        )}
                      </button>
                    </div>
                    <div className="ayur-tpro-text p-4">
                      <Link href={`/products/${p.id}`} className="block">
                        <h3 className="font-semibold text-gray-900 text-base line-clamp-2 hover:text-green-700 transition-colors duration-300">{p.title}</h3>
                      </Link>
                      <div className="ayur-tpro-price mt-3 flex items-center justify-between">
                        <p className="text-gray-900 font-semibold">
                          {showDiscount ? (
                            <>
                              <del className="mr-2 text-gray-400">₹{originalPrice}</del>₹{price}
                            </>
                          ) : (
                            <>₹{price}</>
                          )}
                        </p>
                        <div className="ayur-tpro-star flex items-center gap-2">
                          <Image src="/assets/images_New/star-icon.png" alt="star" width={16} height={16} />
                          <p className="text-sm text-gray-600">{(p as any).rating || '4.5'}/5</p>
                        </div>
                      </div>

                      <button
                        className="w-full mt-4 inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-300 bg-white text-gray-700 px-3 py-2 text-sm font-medium hover:bg-gray-50 whitespace-nowrap"
                        onClick={() => handleAddToCart(p.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.826087 0C0.606995 0 0.396877 0.0870339 0.241955 0.241955C0.0870339 0.396877 0 0.606995 0 0.826087C0 1.04518 0.0870339 1.2553 0.241955 1.41022C0.396877 1.56514 0.606995 1.65217 0.826087 1.65217H2.29652C2.4166 1.65238 2.53358 1.69029 2.63096 1.76054C2.72834 1.8308 2.8012 1.92986 2.83926 2.04374L5.56287 10.2162C5.6843 10.5797 5.69917 10.9696 5.60665 11.3413L5.38278 12.2393C5.05317 13.5561 6.07835 14.8696 7.43478 14.8696H17.3478C17.5669 14.8696 17.777 14.7825 17.932 14.6276C18.0869 14.4727 18.1739 14.2626 18.1739 14.0435C18.1739 13.8244 18.0869 13.6143 17.932 13.4593C17.777 13.3044 17.5669 13.2174 17.3478 13.2174H7.43478C7.11261 13.2174 6.90609 12.953 6.98457 12.6416L7.15391 11.9659C7.18244 11.8516 7.24833 11.7501 7.34112 11.6775C7.43391 11.6049 7.54828 11.5654 7.66609 11.5652H16.5217C16.6953 11.5654 16.8646 11.511 17.0055 11.4095C17.1463 11.3081 17.2517 11.1649 17.3065 11.0002L19.508 4.39148C19.5494 4.26729 19.5607 4.13505 19.5409 4.00566C19.5211 3.87626 19.4709 3.75342 19.3943 3.64725C19.3178 3.54108 19.2171 3.45463 19.1005 3.39501C18.984 3.33539 18.855 3.30432 18.7241 3.30435H5.415C5.29478 3.30431 5.17762 3.26649 5.08007 3.19622C4.98253 3.12595 4.90954 3.0268 4.87143 2.91278L4.0883 0.565043C4.03349 0.400482 3.92828 0.257348 3.78757 0.15593C3.64686 0.0545128 3.4778 0 3.30435 0H0.826087Z" fill="#6b7280" /></svg>
                        Add To Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Background shapes */}
        <div className="pointer-events-none select-none absolute inset-0 -z-10">
          <Image src="/assets/images/bg-shape3.png" alt="bg shape" width={420} height={220} className="hidden md:block absolute left-0 bottom-0 opacity-80" />
          <Image src="/assets/images/bg-leaf3.png" alt="bg leaf" width={320} height={320} className="hidden md:block absolute right-4 top-6" />
        </div>
      </section>

      {/* Health & Wellness */}
      {/* Why Pure Ayurveda - HTML UI */}
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h5 className="text-sm font-semibold uppercase tracking-widest text-[#CD8973] mb-2">Best For You</h5>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900">Why Pure Ayurveda</h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left - Feature boxes */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center min-h-[220px] flex flex-col items-center justify-center hover-card">
                <div className="w-20 h-20 rounded-full bg-[#CD8973] flex items-center justify-center mb-4 shadow-sm group">
                  <Image src="/assets/images/why-icon1.png" alt="100% Organic" width={38} height={38} className="flip-icon" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">100% Organic</h4>
                <p className="text-gray-600 text-sm">Pure herbs, chemical‑free, safe for daily use.</p>
              </div>
              <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center min-h-[220px] flex flex-col items-center justify-center hover-card">
                <div className="w-20 h-20 rounded-full bg-[#CD8973] flex items-center justify-center mb-4 shadow-sm group">
                  <Image src="/assets/images/why-icon2.png" alt="Best Quality" width={38} height={38} className="flip-icon" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Best Quality</h4>
                <p className="text-gray-600 text-sm">Crafted with traditional Ayurveda and modern standards.</p>
              </div>
              <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center min-h-[220px] flex flex-col items-center justify-center hover-card">
                <div className="w-20 h-20 rounded-full bg-[#CD8973] flex items-center justify-center mb-4 shadow-sm group">
                  <Image src="/assets/images/why-icon3.png" alt="Hygienic Product" width={38} height={38} className="flip-icon" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Hygienic Product</h4>
                <p className="text-gray-600 text-sm">Processed in clean facilities for freshness and potency.</p>
              </div>
              <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center min-h-[220px] flex flex-col items-center justify-center hover-card">
                <div className="w-20 h-20 rounded-full bg-[#CD8973] flex items-center justify-center mb-4 shadow-sm group">
                  <Image src="/assets/images/why-icon4.png" alt="Health Care" width={38} height={38} className="flip-icon" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Health Care</h4>
                <p className="text-gray-600 text-sm">Supports immunity, skin, hair, and overall wellness.</p>
              </div>
            </div>

            {/* Right - Text content with ticks */}
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Solve Your Problem with The Power of Nature</h3>
              <p className="text-gray-600 mb-6">Ayurveda offers natural solutions for health and lifestyle needs. Our products are safe, effective, and free from harmful chemicals. Made with authentic herbs sourced from trusted farms.</p>
              <p className="text-gray-600 mb-6">
                Promotes balance of body, mind, and spirit. Trusted by thousands for holistic wellness.designed to heal the body from within. Each formulation is time-tested, effective, and free from harmful chemicals.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 mb-6">
                {[
                  'Boosts immunity naturally.',
                  'Improves skin and hair health.',
                  'Supports digestion.',
                  'Relieves stress effectively.'
                ].map((text, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="inline-flex w-6 h-6 rounded-full bg-[#CD8973]-100 text-[#CD8973] items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l12-12-1.4-1.4z" /></svg>
                    </span>
                    <p className="text-gray-700 text-sm">{text}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 mb-8">Experience the wisdom of Ayurveda for a healthier tomorrow.</p>
              <Link href="/about" className="inline-block">
                <span className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#CD8973] text-white font-medium">Read More</span>
              </Link>
            </div>
          </div>

          {/* Video banner */}
          <div className="mt-12">
            <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-md bg-[#cc8972]/10">
              <a href="https://www.youtube.com/embed/hJTmi9euoNg" target="_blank" rel="noreferrer" className="absolute inset-0 grid place-items-center">
                <Image src="/assets/images/play-icon.svg" alt="play" width={64} height={64} />
              </a>
            </div>
          </div>
        </div>

        {/* Background shapes */}
        <div className="pointer-events-none select-none absolute inset-0 -z-10">
          <Image src="/assets/images/bg-shape4.png" alt="bg shape" width={420} height={220} className="hidden md:block absolute left-0 bottom-0 opacity-80" />
          <Image src="/assets/images/bg-leaf4.png" alt="bg leaf" width={320} height={320} className="hidden md:block absolute right-4 top-6" />
        </div>
      </section>

      {/* Testimonials Section (above Blog) */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 rounded-full bg-[#F4E5DF] text-[#C77B62] text-sm font-semibold mb-3">Our Testimonial</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">What Our Client’s Say</h2>
          </div>
          {(() => {
            const testimonials = testimonialsData;
            return testimonials.length > 0 ? (
              <div className="relative container">
                <div className="flex gap-6 justify-center">
                  {(() => {
                    const active = testimonialIndex % testimonials.length;
                    const next = (active + 1) % testimonials.length;
                    const indices = [active, next];
                    return indices.map((idx) => {
                      const t = testimonials[idx];
                      return (
                        <div key={idx} data-testimonial-card className="min-w-[100px] sm:min-w-[100px] lg:min-w-[100px] flex-shrink-2">
                          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative min-h-[200px]">
                            <div className="mb-4">
                              <p className="text-gray-700 leading-relaxed italic">"{t.quote}"</p>
                            </div>

                            {/* Separator line */}
                            <div className="border-t border-gray-200 mb-4"></div>

                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                                <Image src="/assets/images/test-img1.png" alt={t.name} width={48} height={48} />
                              </div>
                              <h3 className="font-semibold text-slate-800">{t.name}</h3>
                            </div>

                            {/* Decorative quote mark */}
                            <div className="absolute bottom-4 right-4 opacity-20">
                              <svg width="40" height="30" viewBox="0 0 74 53" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.8133 18.3798C12.1853 14.2231 9.62 10.1164 6.19133 6.16C5.106 4.90796 4.958 3.10504 5.846 1.70277C6.53667 0.600975 7.67133 0 8.90467 0C9.25 0 9.59533 0.0250397 9.94067 0.150242C17.1927 2.30374 34.1387 9.94113 34.6073 34.4309C34.78 43.8712 27.972 51.9844 19.1167 52.9109C14.208 53.4117 9.324 51.784 5.698 48.4787C3.90464 46.8276 2.47128 44.8141 1.48999 42.5673C0.508697 40.3205 0.0011672 37.8902 0 35.4325C0 27.1691 5.772 19.9324 13.8133 18.3798ZM58.4847 52.9109C53.6007 53.4117 48.7167 51.784 45.0907 48.4787C43.2972 46.8277 41.8638 44.8142 40.8824 42.5674C39.9011 40.3206 39.3937 37.8902 39.3927 35.4325C39.3927 27.1691 45.1647 19.9324 53.206 18.3798C51.578 14.2231 49.0127 10.1164 45.584 6.16C44.4987 4.90796 44.3507 3.10504 45.2387 1.70277C45.9293 0.600975 47.064 0 48.2973 0C48.6427 0 48.988 0.0250397 49.3333 0.150242C56.5853 2.30374 73.5313 9.94113 74 34.4309V34.7815C74 44.0715 67.266 51.9844 58.4847 52.9109Z" fill="#CD8973" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                <button
                  type="button"
                  onClick={() => setTestimonialIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
                  className="absolute -left-6 md:-left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#F4E5DF] border border-[#C77B62] shadow flex items-center justify-center hover:bg-[#E8D5CC] transition-colors z-10 pointer-events-auto"
                  aria-label="Previous"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 6l-6 6 6 6" stroke="#C77B62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setTestimonialIndex((i) => (i + 1) % testimonials.length)}
                  className="absolute -right-6 md:-right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#F4E5DF] border border-[#C77B62] shadow flex items-center justify-center hover:bg-[#E8D5CC] transition-colors z-10 pointer-events-auto"
                  aria-label="Next"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18l6-6-6-6" stroke="#C77B62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ) : null;
          })()}
        </div>
        <div className="pointer-events-none select-none absolute inset-0 -z-10">
          {/* <Image src="/assets/images/bg-shape5.png" alt="bg shape" width={420} height={100} className="hidden md:block absolute left-0 top-0 opacity-80" /> */}
          <Image src="/assets/images/bg-leaf5.png" alt="bg leaf" width={100} height={100} className="hidden md:block absolute right-4 bottom-6" />
        </div>
      </section>



      {/* Team Section */}
      <section className="relative py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 rounded-full bg-[#F4E5DF] text-[#C77B62] text-sm font-semibold mb-3">Our Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Trusted & Certificated Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 - hovered */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="relative group">
                <div className="rounded-xl overflow-hidden">
                  <Image src="/assets/images/team-1.png" alt="Esther Howard" width={420} height={420} className="w-full h-auto" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/92 border border-gray-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white">
                    <Image src="/assets/images/team-1.png" alt="Esther Howard" width={80} height={80} />
                  </div>
                  <p className="text-sm text-gray-600 -mt-1">Manager</p>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74157 20V10.8777H9.80231L10.2615 7.32156H6.74157V5.05147C6.74157 4.0222 7.02622 3.32076 8.50386 3.32076L10.3854 3.31999V0.13923C10.06 0.0969453 8.94308 0 7.64308 0C4.92848 0 3.07002 1.65697 3.07002 4.69927V7.32156H0V10.8777H3.07002V20H6.74157Z" fill="#C77B62" /></svg></span>
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8138 8.46864L19.0991 0H17.3727L11.0469 7.3532L5.9944 0H0.166992L7.8073 11.1193L0.166992 20H1.89349L8.57377 12.2348L13.9095 20H19.7369L11.8133 8.46864H11.8138ZM9.4491 11.2173L8.67498 10.1101L2.51557 1.29967H5.16736L10.1381 8.40994L10.9122 9.51718L17.3735 18.7594H14.7218L9.4491 11.2177V11.2173Z" fill="#C77B62" /></svg></span>
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.89667 0C3.41417 0.000833333 0.5 3.51333 0.5 7.34333C0.5 9.11917 1.4925 11.335 3.08167 12.0375C3.535 12.2417 3.475 11.9925 3.865 10.5008C3.88295 10.4406 3.88454 10.3766 3.8696 10.3156C3.85466 10.2545 3.82374 10.1985 3.78 10.1533C1.50833 7.52583 3.33667 2.12417 8.5725 2.12417C16.15 2.12417 14.7342 12.6092 9.89083 12.6092C8.6425 12.6092 7.7125 11.6292 8.00667 10.4167C8.36333 8.9725 9.06167 7.42 9.06167 6.37917C9.06167 3.75583 5.15333 4.145 5.15333 7.62083C5.15333 8.695 5.53333 9.42 5.53333 9.42C5.53333 9.42 4.27583 14.5 4.0425 15.4492C3.6475 17.0558 4.09583 19.6567 4.135 19.8808C4.15917 20.0042 4.2975 20.0433 4.375 19.9417C4.49917 19.7792 6.01917 17.6108 6.445 16.0433C6.6 15.4725 7.23583 13.1558 7.23583 13.1558C7.655 13.9125 8.86333 14.5458 10.1508 14.5458C13.9808 14.5458 16.7492 11.1792 16.7492 7.00167C16.7358 2.99667 13.3083 0 8.89667 0Z" fill="#C77B62" /></svg></span>
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.4996 0H5.49988C2.75019 0 0.5 2.25019 0.5 4.99988V15.0001C0.5 17.7491 2.75019 20 5.49988 20H15.4996C18.2493 20 20.4995 17.7491 20.4995 15.0001V4.99988C20.4995 2.25019 18.2493 0 15.4996 0ZM18.8328 15.0001C18.8328 16.8376 17.3381 18.3333 15.4996 18.3333H5.49988C3.66218 18.3333 2.16671 16.8376 2.16671 15.0001V4.99988C2.16671 3.16193 3.66218 1.66671 5.49988 1.66671H15.4996C17.3381 1.66671 18.8328 3.16193 18.8328 4.99988V15.0001Z" fill="#C77B62" /><path d="M15.9172 5.83295C16.6075 5.83295 17.1672 5.27332 17.1672 4.58298C17.1672 3.89264 16.6075 3.33301 15.9172 3.33301C15.2269 3.33301 14.6672 3.89264 14.6672 4.58298C14.6672 5.27332 15.2269 5.83295 15.9172 5.83295Z" fill="#C77B62" /><path d="M10.4999 5C7.73793 5 5.5 7.23818 5.5 9.99988C5.5 12.7606 7.73793 15.0002 10.4999 15.0002C13.261 15.0002 15.4998 12.7606 15.4998 9.99988C15.4998 7.23818 13.261 5 10.4999 5ZM10.4999 13.3335C8.65915 13.3335 7.16671 11.8411 7.16671 9.99988C7.16671 8.15866 8.65915 6.66671 10.4999 6.66671C12.3406 6.66671 13.833 8.15866 13.833 9.99988C13.833 11.8411 12.3406 13.3335 10.4999 13.3335Z" fill="#C77B62" /></svg></span>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="font-semibold text-slate-800">Esther Howard</h3>
                <p className="text-gray-500 text-sm">Manager</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="relative group">
                <div className="rounded-xl overflow-hidden">
                  <Image src="/assets/images/team-2.png" alt="Darlene Robertson" width={420} height={420} className="w-full h-auto" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/92 border border-gray-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white">
                    <Image src="/assets/images/team-2.png" alt="Darlene Robertson" width={80} height={80} />
                  </div>
                  <p className="text-sm text-gray-600 -mt-1">Manager</p>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74157 20V10.8777H9.80231L10.2615 7.32156H6.74157V5.05147C6.74157 4.0222 7.02622 3.32076 8.50386 3.32076L10.3854 3.31999V0.13923C10.06 0.0969453 8.94308 0 7.64308 0C4.92848 0 3.07002 1.65697 3.07002 4.69927V7.32156H0V10.8777H3.07002V20H6.74157Z" fill="#C77B62" /></svg></span>
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8138 8.46864L19.0991 0H17.3727L11.0469 7.3532L5.9944 0H0.166992L7.8073 11.1193L0.166992 20H1.89349L8.57377 12.2348L13.9095 20H19.7369L11.8133 8.46864H11.8138ZM9.4491 11.2173L8.67498 10.1101L2.51557 1.29967H5.16736L10.1381 8.40994L10.9122 9.51718L17.3735 18.7594H14.7218L9.4491 11.2177V11.2173Z" fill="#C77B62" /></svg></span>
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.89667 0C3.41417 0.000833333 0.5 3.51333 0.5 7.34333C0.5 9.11917 1.4925 11.335 3.08167 12.0375C3.535 12.2417 3.475 11.9925 3.865 10.5008C3.88295 10.4406 3.88454 10.3766 3.8696 10.3156C3.85466 10.2545 3.82374 10.1985 3.78 10.1533C1.50833 7.52583 3.33667 2.12417 8.5725 2.12417C16.15 2.12417 14.7342 12.6092 9.89083 12.6092C8.6425 12.6092 7.7125 11.6292 8.00667 10.4167C8.36333 8.9725 9.06167 7.42 9.06167 6.37917C9.06167 3.75583 5.15333 4.145 5.15333 7.62083C5.15333 8.695 5.53333 9.42 5.53333 9.42C5.53333 9.42 4.27583 14.5 4.0425 15.4492C3.6475 17.0558 4.09583 19.6567 4.135 19.8808C4.15917 20.0042 4.2975 20.0433 4.375 19.9417C4.49917 19.7792 6.01917 17.6108 6.445 16.0433C6.6 15.4725 7.23583 13.1558 7.23583 13.1558C7.655 13.9125 8.86333 14.5458 10.1508 14.5458C13.9808 14.5458 16.7492 11.1792 16.7492 7.00167C16.7358 2.99667 13.3083 0 8.89667 0Z" fill="#C77B62" /></svg></span>
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.4996 0H5.49988C2.75019 0 0.5 2.25019 0.5 4.99988V15.0001C0.5 17.7491 2.75019 20 5.49988 20H15.4996C18.2493 20 20.4995 17.7491 20.4995 15.0001V4.99988C20.4995 2.25019 18.2493 0 15.4996 0ZM18.8328 15.0001C18.8328 16.8376 17.3381 18.3333 15.4996 18.3333H5.49988C3.66218 18.3333 2.16671 16.8376 2.16671 15.0001V4.99988C2.16671 3.16193 3.66218 1.66671 5.49988 1.66671H15.4996C17.3381 1.66671 18.8328 3.16193 18.8328 4.99988V15.0001Z" fill="#C77B62" /><path d="M15.9172 5.83295C16.6075 5.83295 17.1672 5.27332 17.1672 4.58298C17.1672 3.89264 16.6075 3.33301 15.9172 3.33301C15.2269 3.33301 14.6672 3.89264 14.6672 4.58298C14.6672 5.27332 15.2269 5.83295 15.9172 5.83295Z" fill="#C77B62" /><path d="M10.4999 5C7.73793 5 5.5 7.23818 5.5 9.99988C5.5 12.7606 7.73793 15.0002 10.4999 15.0002C13.261 15.0002 15.4998 12.7606 15.4998 9.99988C15.4998 7.23818 13.261 5 10.4999 5ZM10.4999 13.3335C8.65915 13.3335 7.16671 11.8411 7.16671 9.99988C7.16671 8.15866 8.65915 6.66671 10.4999 6.66671C12.3406 6.66671 13.833 8.15866 13.833 9.99988C13.833 11.8411 12.3406 13.3335 10.4999 13.3335Z" fill="#C77B62" /></svg></span>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="font-semibold text-slate-800">Darlene Robertson</h3>
                <p className="text-gray-500 text-sm">Manager</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="relative group">
                <div className="rounded-xl overflow-hidden">
                  <Image src="/assets/images/team-3.png" alt="Robert Fox" width={420} height={420} className="w-full h-auto" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/92 border border-gray-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white">
                    <Image src="/assets/images/team-3.png" alt="Robert Fox" width={80} height={80} />
                  </div>
                  <p className="text-sm text-gray-600 -mt-1">Manager</p>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74157 20V10.8777H9.80231L10.2615 7.32156H6.74157V5.05147C6.74157 4.0222 7.02622 3.32076 8.50386 3.32076L10.3854 3.31999V0.13923C10.06 0.0969453 8.94308 0 7.64308 0C4.92848 0 3.07002 1.65697 3.07002 4.69927V7.32156H0V10.8777H3.07002V20H6.74157Z" fill="#C77B62" /></svg></span>
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8138 8.46864L19.0991 0H17.3727L11.0469 7.3532L5.9944 0H0.166992L7.8073 11.1193L0.166992 20H1.89349L8.57377 12.2348L13.9095 20H19.7369L11.8133 8.46864H11.8138ZM9.4491 11.2173L8.67498 10.1101L2.51557 1.29967H5.16736L10.1381 8.40994L10.9122 9.51718L17.3735 18.7594H14.7218L9.4491 11.2177V11.2173Z" fill="#C77B62" /></svg></span>
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.89667 0C3.41417 0.000833333 0.5 3.51333 0.5 7.34333C0.5 9.11917 1.4925 11.335 3.08167 12.0375C3.535 12.2417 3.475 11.9925 3.865 10.5008C3.88295 10.4406 3.88454 10.3766 3.8696 10.3156C3.85466 10.2545 3.82374 10.1985 3.78 10.1533C1.50833 7.52583 3.33667 2.12417 8.5725 2.12417C16.15 2.12417 14.7342 12.6092 9.89083 12.6092C8.6425 12.6092 7.7125 11.6292 8.00667 10.4167C8.36333 8.9725 9.06167 7.42 9.06167 6.37917C9.06167 3.75583 5.15333 4.145 5.15333 7.62083C5.15333 8.695 5.53333 9.42 5.53333 9.42C5.53333 9.42 4.27583 14.5 4.0425 15.4492C3.6475 17.0558 4.09583 19.6567 4.135 19.8808C4.15917 20.0042 4.2975 20.0433 4.375 19.9417C4.49917 19.7792 6.01917 17.6108 6.445 16.0433C6.6 15.4725 7.23583 13.1558 7.23583 13.1558C7.655 13.9125 8.86333 14.5458 10.1508 14.5458C13.9808 14.5458 16.7492 11.1792 16.7492 7.00167C16.7358 2.99667 13.3083 0 8.89667 0Z" fill="#C77B62" /></svg></span>
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.4996 0H5.49988C2.75019 0 0.5 2.25019 0.5 4.99988V15.0001C0.5 17.7491 2.75019 20 5.49988 20H15.4996C18.2493 20 20.4995 17.7491 20.4995 15.0001V4.99988C20.4995 2.25019 18.2493 0 15.4996 0ZM18.8328 15.0001C18.8328 16.8376 17.3381 18.3333 15.4996 18.3333H5.49988C3.66218 18.3333 2.16671 16.8376 2.16671 15.0001V4.99988C2.16671 3.16193 3.66218 1.66671 5.49988 1.66671H15.4996C17.3381 1.66671 18.8328 3.16193 18.8328 4.99988V15.0001Z" fill="#C77B62" /><path d="M15.9172 5.83295C16.6075 5.83295 17.1672 5.27332 17.1672 4.58298C17.1672 3.89264 16.6075 3.33301 15.9172 3.33301C15.2269 3.33301 14.6672 3.89264 14.6672 4.58298C14.6672 5.27332 15.2269 5.83295 15.9172 5.83295Z" fill="#C77B62" /><path d="M10.4999 5C7.73793 5 5.5 7.23818 5.5 9.99988C5.5 12.7606 7.73793 15.0002 10.4999 15.0002C13.261 15.0002 15.4998 12.7606 15.4998 9.99988C15.4998 7.23818 13.261 5 10.4999 5ZM10.4999 13.3335C8.65915 13.3335 7.16671 11.8411 7.16671 9.99988C7.16671 8.15866 8.65915 6.66671 10.4999 6.66671C12.3406 6.66671 13.833 8.15866 13.833 9.99988C13.833 11.8411 12.3406 13.3335 10.4999 13.3335Z" fill="#C77B62" /></svg></span>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="font-semibold text-slate-800">Robert Fox</h3>
                <p className="text-gray-500 text-sm">Manager</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="relative group">
                <div className="rounded-xl overflow-hidden">
                  <Image src="/assets/images/team-4.png" alt="Jenny Wilson" width={420} height={420} className="w-full h-auto" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/92 border border-gray-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white">
                    <Image src="/assets/images/team-4.png" alt="Jenny Wilson" width={80} height={80} />
                  </div>
                  <p className="text-sm text-gray-600 -mt-1">Manager</p>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74157 20V10.8777H9.80231L10.2615 7.32156H6.74157V5.05147C6.74157 4.0222 7.02622 3.32076 8.50386 3.32076L10.3854 3.31999V0.13923C10.06 0.0969453 8.94308 0 7.64308 0C4.92848 0 3.07002 1.65697 3.07002 4.69927V7.32156H0V10.8777H3.07002V20H6.74157Z" fill="#C77B62" /></svg></span>
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8138 8.46864L19.0991 0H17.3727L11.0469 7.3532L5.9944 0H0.166992L7.8073 11.1193L0.166992 20H1.89349L8.57377 12.2348L13.9095 20H19.7369L11.8133 8.46864H11.8138ZM9.4491 11.2173L8.67498 10.1101L2.51557 1.29967H5.16736L10.1381 8.40994L10.9122 9.51718L17.3735 18.7594H14.7218L9.4491 11.2177V11.2173Z" fill="#C77B62" /></svg></span>
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.89667 0C3.41417 0.000833333 0.5 3.51333 0.5 7.34333C0.5 9.11917 1.4925 11.335 3.08167 12.0375C3.535 12.2417 3.475 11.9925 3.865 10.5008C3.88295 10.4406 3.88454 10.3766 3.8696 10.3156C3.85466 10.2545 3.82374 10.1985 3.78 10.1533C1.50833 7.52583 3.33667 2.12417 8.5725 2.12417C16.15 2.12417 14.7342 12.6092 9.89083 12.6092C8.6425 12.6092 7.7125 11.6292 8.00667 10.4167C8.36333 8.9725 9.06167 7.42 9.06167 6.37917C9.06167 3.75583 5.15333 4.145 5.15333 7.62083C5.15333 8.695 5.53333 9.42 5.53333 9.42C5.53333 9.42 4.27583 14.5 4.0425 15.4492C3.6475 17.0558 4.09583 19.6567 4.135 19.8808C4.15917 20.0042 4.2975 20.0433 4.375 19.9417C4.49917 19.7792 6.01917 17.6108 6.445 16.0433C6.6 15.4725 7.23583 13.1558 7.23583 13.1558C7.655 13.9125 8.86333 14.5458 10.1508 14.5458C13.9808 14.5458 16.7492 11.1792 16.7492 7.00167C16.7358 2.99667 13.3083 0 8.89667 0Z" fill="#C77B62" /></svg></span>
                    <span className="w-9 h-9 grid place-items-center rounded-full bg-[#F4E5DF]"><svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.4996 0H5.49988C2.75019 0 0.5 2.25019 0.5 4.99988V15.0001C0.5 17.7491 2.75019 20 5.49988 20H15.4996C18.2493 20 20.4995 17.7491 20.4995 15.0001V4.99988C20.4995 2.25019 18.2493 0 15.4996 0ZM18.8328 15.0001C18.8328 16.8376 17.3381 18.3333 15.4996 18.3333H5.49988C3.66218 18.3333 2.16671 16.8376 2.16671 15.0001V4.99988C2.16671 3.16193 3.66218 1.66671 5.49988 1.66671H15.4996C17.3381 1.66671 18.8328 3.16193 18.8328 4.99988V15.0001Z" fill="#C77B62" /><path d="M15.9172 5.83295C16.6075 5.83295 17.1672 5.27332 17.1672 4.58298C17.1672 3.89264 16.6075 3.33301 15.9172 3.33301C15.2269 3.33301 14.6672 3.89264 14.6672 4.58298C14.6672 5.27332 15.2269 5.83295 15.9172 5.83295Z" fill="#C77B62" /><path d="M10.4999 5C7.73793 5 5.5 7.23818 5.5 9.99988C5.5 12.7606 7.73793 15.0002 10.4999 15.0002C13.261 15.0002 15.4998 12.7606 15.4998 9.99988C15.4998 7.23818 13.261 5 10.4999 5ZM10.4999 13.3335C8.65915 13.3335 7.16671 11.8411 7.16671 9.99988C7.16671 8.15866 8.65915 6.66671 10.4999 6.66671C12.3406 6.66671 13.833 8.15866 13.833 9.99988C13.833 11.8411 12.3406 13.3335 10.4999 13.3335Z" fill="#C77B62" /></svg></span>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="font-semibold text-slate-800">Jenny Wilson</h3>
                <p className="text-gray-500 text-sm">Manager</p>
              </div>
            </div>
          </div>
        </div>
       
      </section>

      {/* Blog Section */}
      <BlogSection />

      {/* Trust & Testimonials Section */}
      {/* <TrustSection
        certifications={homepageData.certifications}
        testimonials={homepageData.testimonials}
        stats={homepageData.trustStats}
      /> */}

      {/* Newsletter Signup */}
      {/* <NewsletterSignup
        title="Subscribe to our newsletter"
        subtitle="Get the latest updates on new products and special offers"
        onSubmit={handleNewsletterSubmit}
      /> */}

      {/* Service Features Section */}
      {/* <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                    <path d="M12 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-1">Safe Payments</h3>
                <p className="text-gray-600 text-sm">Multiple payment options</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-1">Minimum Order</h3>
                <p className="text-gray-600 text-sm">Shop over Rs.250/-</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items:center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-1">Partial COD</h3>
                <p className="text-gray-600 text-sm">Pay 25% and Get COD.</p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* WhatsApp Float Button */}
      {/* <WhatsAppFloat /> */}

      {/* Back to Top Button */}
      <BackToTop />
    </>
  );
}
