import React from 'react';
import CompressedImage from '@components/CompressedImageClient';
import { Button, Badge } from './index';
import { sdk } from '@lib/config';
import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useProductRating } from '../../hooks/useProductRating';

interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  review_count?: number;
}

interface ProductVariant {
  id: string;
  title: string;
  prices?: Array<{
    amount: number;
    currency_code: string;
  }>;
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
  type?: {
    value: string;
    label: string;
  };
  categories?: {
    id: string;
    name: string;
  }[];
}


interface ProductCardProps {
  product: Product;
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  showAddToCart?: boolean;
  className?: string;
  wishlist?: any;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  onAddToCart,
  showAddToCart = true,
  className = '',
  wishlist,
}) => {

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product.id);
    }
  };

  const { updateFavouriteCount } = useAppContext();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  // Temporarily disable status check - all products are in stock
  const isInStock = true;
  const hasDiscount = product.original_price && product.price && product.original_price > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const customerToken = getCookie('_shopenup_jwt');

 useEffect(() => {
    if (!wishlist || !product?.variants) return;

    const wishlistItems = wishlist.items || [];
    const productVariantIds = product.variants.map((v: any) => v.id);

    const exists = wishlistItems.some((item: any) =>
      productVariantIds.includes(item.product_variant?.id)
    );

    setIsInWishlist(exists);
  }, [wishlist, product]);





  const addToFavourites = async (product: Product) => {
    try {
      const variantId = product.variants?.[0]?.id;
      if (!variantId) { return; }

      if (!customerToken) {
        const guestWishlist = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");
        if (!guestWishlist.includes(variantId)) {
          guestWishlist.push(variantId);
          localStorage.setItem("guest_wishlist", JSON.stringify(guestWishlist));
        }
        setIsInWishlist(true);
        // unknown guest count; skip increment
        return;
      }

      // 1. Check for existing wishlist
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
      } catch { }

      // 2. Create wishlist if none exists
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

      if (!wishlist) { return; }

      // 3. Add item to wishlist
      await sdk.client.fetch("/store/customers/me/wishlists/items", {
        method: "POST",
        body: { variant_id: variantId },
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || "",
          "Authorization": `Bearer ${customerToken}`
        },
      });
      setIsInWishlist(true);
      updateFavouriteCount((wishlist?.items?.length || 0) + 1);
    } catch {
      // silent
    }
  };

  const removeFromFavourites = async (productId: string) => {
    try {
      if (!customerToken) {
        setIsInWishlist(false);
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
        setIsInWishlist(false);
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
      setIsInWishlist(false);
      const newCount = Math.max(0, (res?.wishlist?.items?.length || 1) - 1);
      updateFavouriteCount(newCount);
    } catch {
      // silent
    }
  };

  const { rating, reviewCount, loading: ratingLoading } = useProductRating(product.id);




  return (
    <div
      className={`ayur-tpro-box bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 group cursor-pointer ${className}`}
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative p-6 flex items-center justify-center h-[220px] overflow-hidden">
        <CompressedImage
          src={
            product.thumbnail
              ? typeof product.thumbnail === 'string'
                ? product.thumbnail
                : (product.thumbnail as ProductImage).url || '/placeholder-product.jpg'
              : product.images && product.images[0]
                ? typeof product.images[0] === 'string'
                  ? product.images[0]
                  : (product.images[0] as ProductImage).url || '/placeholder-product.jpg'
                : '/placeholder-product.jpg'
          }
          alt={product.title}
          width={200}
          height={200}
          className="object-contain max-h-full transition-transform duration-300 group-hover:scale-105"
          useCase="card"
          fallbackSrc="/placeholder-product.jpg"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        
        {/* Favorite Icon - Top Right */}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (isInWishlist) {
              await removeFromFavourites(product.id);
            } else {
              await addToFavourites(product);
            }
          }}
          className={`absolute right-4 top-4 w-8 h-8 rounded-full grid place-items-center shadow-sm border bg-white ${isInWishlist ? 'border-[#CD8973]' : 'border-gray-200'}`}
          aria-label="Wishlist"
        >
          {isInWishlist ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#CD8973]"><path d="M12 21s-1-.45-1-1.35C7.55 16.36 4 13.28 4 9.5 4 7.5 5.5 6 7.5 6c1.54 0 2.54.99 3 1.67C11.96 6.99 12.96 6 14.5 6 16.5 6 18 7.5 18 9.5c0 3.78-3.55 6.86-7 10.15 0 .9-1 1.35-1 1.35z"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
          )}
        </button>

        {/* Discount Badge - Top Left */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Sale
          </div>
        )}

        {/* Stock Status */}
        {!isInStock && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}

        {/* New Badge */}
        {isInStock && product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
          <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
            New
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-6 pb-6">
        <h3 className="font-semibold text-gray-900 text-base text-center line-clamp-2 min-h-[44px] hover:text-green-700 transition-colors duration-300">
          {product.title}
        </h3>

        {/* Price and Rating */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-gray-900 font-semibold">
            {product.original_price && product.original_price > product.price ? (
              <>
                <del className="mr-2 text-gray-400">₹{product.original_price.toFixed(2)}</del>₹{product.price.toFixed(2)}
              </>
            ) : (
              <>₹{product.price.toFixed(2)}</>
            )}
          </p>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <p className="text-sm text-gray-600">
              {ratingLoading
                ? 'Loading...'
                : rating && rating > 0
                  ? `${rating.toFixed(1)}/5`
                  : '0'}
            </p>
          </div>
        </div>

        {/* Add to Cart Button */}
        {showAddToCart && (
          <button
            className="w-full mt-4 inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-300 bg-white text-gray-700 px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
            onClick={(e) => {
              e?.stopPropagation(); // Prevent card navigation
              if (onAddToCart) {
                onAddToCart(product.id);
              }
            }}
            disabled={!isInStock}
          >
            <svg width="16" height="16" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.826087 0C0.606995 0 0.396877 0.0870339 0.241955 0.241955C0.0870339 0.396877 0 0.606995 0 0.826087C0 1.04518 0.0870339 1.2553 0.241955 1.41022C0.396877 1.56514 0.606995 1.65217 0.826087 1.65217H2.29652C2.4166 1.65238 2.53358 1.69029 2.63096 1.76054C2.72834 1.8308 2.8012 1.92986 2.83926 2.04374L5.56287 10.2162C5.6843 10.5797 5.69917 10.9696 5.60665 11.3413L5.38278 12.2393C5.05317 13.5561 6.07835 14.8696 7.43478 14.8696H17.3478C17.5669 14.8696 17.777 14.7825 17.932 14.6276C18.0869 14.4727 18.1739 14.2626 18.1739 14.0435C18.1739 13.8244 18.0869 13.6143 17.932 13.4593C17.777 13.3044 17.5669 13.2174 17.3478 13.2174H7.43478C7.11261 13.2174 6.90609 12.953 6.98457 12.6416L7.15391 11.9659C7.18244 11.8516 7.24833 11.7501 7.34112 11.6775C7.43391 11.6049 7.54828 11.5654 7.66609 11.5652H16.5217C16.6953 11.5654 16.8646 11.511 17.0055 11.4095C17.1463 11.3081 17.2517 11.1649 17.3065 11.0002L19.508 4.39148C19.5494 4.26729 19.5607 4.13505 19.5409 4.00566C19.5211 3.87626 19.4709 3.75342 19.3943 3.64725C19.3178 3.54108 19.2171 3.45463 19.1005 3.39501C18.984 3.33539 18.855 3.30432 18.7241 3.30435H5.415C5.29478 3.30431 5.17762 3.26649 5.08007 3.19622C4.98253 3.12595 4.90954 3.0268 4.87143 2.91278L4.0883 0.565043C4.03349 0.400482 3.92828 0.257348 3.78757 0.15593C3.64686 0.0545128 3.4778 0 3.30435 0H0.826087Z" fill="#6b7280" />
            </svg>
            Add To Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;