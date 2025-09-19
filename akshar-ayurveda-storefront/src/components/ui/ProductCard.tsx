import React from 'react';
import Image from 'next/image';
import { Button, Badge } from './index';
import { sdk } from '@lib/config';
import { useToast } from '@components/ui';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
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
  //console.log('product', product);

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product.id);
    }
  };

  const { updateFavouriteCount } = useAppContext();
  const { showToast } = useToast();
  const router = useRouter();
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

       if (!variantId) {
        showToast("No variant available for this product", "error");
        return;
      }

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

      if (!wishlist) {
        showToast("Could not create wishlist", "error");
        return;
      }

      // 3. Add item to wishlist
      try {
        await sdk.client.fetch("/store/customers/me/wishlists/items", {
          method: "POST",
          body: {
            variant_id: variantId,
          },
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || "",
            "Authorization": `Bearer ${customerToken}`
          },
        });

        showToast(`${product.title} Added to favorites!`, `success`);
        setIsInWishlist(true);
        updateFavouriteCount((wishlist?.items?.length || 0) + 1);
      } catch (err: any) {
        // Handle "already in wishlist" error from API
        if (err?.message?.includes("Variant is already in wishlist") || err?.type === "invalid_data") {
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




  return (
    <div
      className={`bg-white rounded-lg shadow-sm border hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer group ${className}`}
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden group">
        <Image
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
          width={300}
          height={192}
          className="w-full h-48 object-cover rounded-t-lg transition-transform duration-500 ease-in-out group-hover:scale-125"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.jpg';
          }}
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 ease-in-out rounded-t-lg"></div>

        {/* Favorite Icon - Top Left */}
        <button
          onClick={async (e) => {
            e.stopPropagation(); // Prevent card click
            await addToFavourites(product);
          }}
         className={`absolute top-2 left-2 p-1 bg-white rounded-full shadow-md transition-colors ${
            isInWishlist ? "text-red-600" : "text-black-400"
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>


        {/* Discount Badge */}
        {hasDiscount && (
          <Badge
            variant="danger"
            size="sm"
            className="absolute top-2 left-2"
          >
            -{discountPercentage}%
          </Badge>
        )}

        {/* Stock Status */}
        {!isInStock && (
          <Badge
            variant="warning"
            size="sm"
            className="absolute top-2 right-2"
          >
            Out of Stock
          </Badge>
        )}

        {/* New Badge */}
        {isInStock && product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
          <Badge
            variant="success"
            size="sm"
            className="absolute top-2 right-2"
          >
            New
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Badge variant="secondary" size="sm" className="mb-2">
          {product.categories && product.categories.length > 0
            ? product.categories[0].name
            : 'General'}
        </Badge>

        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-green-600">
            ₹{(product.price || 0).toFixed(2)}
          </span>
          {product.original_price && (
            <span className="text-sm text-gray-500 line-through">
              ₹{(product.original_price || 0).toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {showAddToCart && (
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e?.stopPropagation(); // Prevent card navigation
              if (onAddToCart) {
                onAddToCart(product.id);
              }
            }}
            disabled={!isInStock}
            fullWidth
          >
            {!isInStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;