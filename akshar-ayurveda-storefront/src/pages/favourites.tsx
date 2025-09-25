import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, Badge } from '../components/ui';
import { useAppContext } from '../context/AppContext';
import { sdk } from '@lib/config';
import { useAddLineItem } from '../hooks/cart';
import { useToast } from '../components/ui';
import { useRouter } from 'next/router';
import { Trash } from "@shopenup/icons"
import { useCountryCode } from '@hooks/country-code';


interface FavouriteProduct {
  id: string;
  title: string;
  variantTitle?: string;
  price: number;
  original_price?: number;
  image?: string;
  category?: string;
  rating?: number;
  inStock?: boolean;
  productId: string; // Added to navigate to product details
  description?: string; // added description
  variantId: string;
  variantOptions?: { option: string; value: string }[];
}

interface WishlistProduct {
  id: string;
  title: string;
  description?: string;
  status: string;
  thumbnail?: string;
  images?: { url: string }[];
}

interface WishlistVariant {
  id: string;
  title?: string;
  prices?: { amount: number }[];
  product: WishlistProduct;
}

interface WishlistItem {
  id: string; // wishlist item ID
  product_variant: WishlistVariant;
  options: {
    option: { title: string };
    value: string;
  }[];
}

interface Wishlist {
  id: string;
  items: WishlistItem[];
}

interface WishlistResponse {
  wishlist: Wishlist;
}

export default function Favourites() {
  const [favourites, setFavourites] = useState<FavouriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { updateFavouriteCount ,isLoggedIn} = useAppContext();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const countryCode = useCountryCode() || 'in';

  const { mutateAsync: addLineItem, isPending: isAddingToCart } = useAddLineItem();
  const { showToast } = useToast();
  const router = useRouter();

  const handleProductClick = (productId: string, variantId: string) => {
  router.push(`/products/${productId}?variant=${variantId}`);
};



const handleAddToCart = async (product: FavouriteProduct) => {
  try {
    setAddingToCart(product.id); // use wishlist item id to track button state

    if (!product.inStock) {
      showToast("Product is out of stock", "error");
      return;
    }

    if (!product.variantId) {
      console.error("No variant found for wishlist item:", product);
      showToast("Product variant not found", "error");
      return;
    }

    await addLineItem({
      variantId: product.variantId,
      quantity: 1,
      countryCode,
    });

    showToast(`${product.title} added to cart`, "success");
  } catch (error) {
    console.error("Error adding to cart:", error);
    showToast("Failed to add product to cart", "error");
  } finally {
    setAddingToCart(null);
  }
};


useEffect(() => {
  const fetchFavourites = async () => {
    if (!isLoggedIn) { // reset to empty for guests
      setFavourites([]);   // clear for guests
      setLoading(false);
      return;
    }
    try {
      //setLoading(true);

      const response = await sdk.client.fetch<WishlistResponse>(
        '/store/customers/me/wishlists',
        {}
      );

      const items: FavouriteProduct[] = response.wishlist.items.map((item) => {
        const variant = item.product_variant;
        const product = variant.product;
       
       
        // Map selected options from variant
        // const variantOptionsText = (variant as any).options
        //   ?.map((opt: any) => `${opt.option.title}: ${opt.value}`)
        //   .join(" | ") || "";

        const variantOptions = (variant as any).options?.map((opt: any) => ({
          option: opt.option.title,
          value: opt.value,
        })) || [];

        return {
          id: item.id, // wishlist item ID (for removal)
          productId: product.id, // product ID (for navigation)
          title: product.title || variant.title || "",
          variantOptions: variantOptions, // this will show "Color: Red, Size: L"
          price: variant.prices?.[0]?.amount || 0,
          image: product.thumbnail || product.images?.[0]?.url,
          description: product.description,
          inStock: product.status === "published",
          rating: 0,
          variantId: variant.id,
        };
      });

      setFavourites(items);
      updateFavouriteCount(items.length);
    } catch (error) {
      console.error("Error fetching favourites:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchFavourites();
}, [isLoggedIn]);

  const removeFromFavourites = async (wishlistItemId: string) => {
  try {
    await sdk.client.fetch(`/store/customers/me/wishlists/items/${wishlistItemId}`, {
      method: "DELETE",
      headers: {
          "x-publishable-api-key": process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY as string,
        },
      });

      // Optimistically update UI
      setFavourites((prev) => {
        const newFavs = prev.filter((item) => item.id !== wishlistItemId);
        updateFavouriteCount(newFavs.length);
        return newFavs;
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
  }finally {
      setConfirmId(null); // close modal
    }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  if (favourites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <Link href="/products">
              <Button variant="primary" size="lg">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" >
          {favourites.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow" onClick={() => handleProductClick(product.productId, product.variantId)}>
              <div className="relative w-full h-48">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                   className="w-full h-48 object-contain rounded-t-lg"
                  />
                )}
                <button
                  onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                    e?.preventDefault();
                    e?.stopPropagation();
                    // removeFromFavourites(product.id);
                    setConfirmId(product.id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash className="w-5 h-5 text-red-600 ml-1 mt-1" />
                </button>

              </div>

              <div className="p-4">
                {/* <Badge variant="secondary" size="sm" className="mb-2">
                  {product.category || 'Uncategorized'}
                </Badge> */}
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {product.title} 
                </h3>
                {product.variantOptions && product.variantOptions.length > 0 && (
                  <div className="mt-1 mb-2 text-sm text-gray-600 flex flex-wrap gap-2">
                    {product.variantOptions.map((opt, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-md bg-gray-100">
                      {opt.value}
                      </span>
                    ))}
                  </div>
                )}
                
                {product.description && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                    {product.description}
                  </p>
                )}
                <p className="text-green-600 font-bold mt-2 mb-2 text-lg">₹{product.price}</p>

                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                    e?.preventDefault();
                    e?.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
         {/* Confirmation Dialog */}
        {confirmId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
              <p className="text-gray-800 mb-4">Are you sure you want to remove this item from your wishlist?</p>
              <div className="flex justify-around">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={(e) => {
                    e?.stopPropagation();
                    removeFromFavourites(confirmId)}}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
