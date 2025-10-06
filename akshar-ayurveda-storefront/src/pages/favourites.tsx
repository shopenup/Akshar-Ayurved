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
import Breadcrumb from '@components/about/Breadcrumb';
import { getCustomer } from '@lib/shopenup/customer';
import { useCustomer } from '@hooks/customer';



interface FavouriteProduct {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  image?: string;
  category?: string;
  rating?: number;
  inStock?: boolean;
  productId: string; // Added to navigate to product details
  description?: string; // added description
  variantId: string;
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
  const { data: customer } = useCustomer()

  const { mutateAsync: addLineItem, isPending: isAddingToCart } = useAddLineItem();
  
  const { showToast } = useToast();
  const router = useRouter();

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
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

    // After adding to cart, remove this item from favourites (server + UI)
    await removeFromFavourites(product.id);
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
    // const getCookie = (name: string) => {
    //   if (typeof document === 'undefined') return null;
    //   const value = `; ${document.cookie}`;
    //   const parts = value.split(`; ${name}=`);
    //   if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    //   return null;
    // };
    // const customerToken = getCookie('_shopenup_jwt');// const customer = await getCustomer();
    // if (!customerToken) {
    //   setLoading(false)
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

        return {
          id: item.id, // wishlist item ID (for removal)
          productId: product.id, // product ID (for navigation)
          title: product.title || variant.title || "",
          price: variant.prices?.[0]?.amount || 0,
          image: product.thumbnail || product.images?.[0]?.url,
          description: product.description,
          inStock: product.status === "published",
          rating: 4.5,
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
}, [updateFavouriteCount]);


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
      <>
        {/* Breadcrumb Section */}
        <Breadcrumb title="My Wishlist" crumbs={[{ label: 'Home', href: '/' }, { label: 'favourites' }]} imageSrc="/assets/images/bredcrumb-bg.jpg" />
        
        <div className="h-auto bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Heart Icon */}
              <div className="mb-2">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#E7E4D1] to-[#D8BFA3] rounded-full mb-6 shadow-lg border-4 border-white/50">
                  <svg className="w-10 h-10 text-[#878E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
              </div>

              {/* Main Content */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                Your Wishlist is Empty
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
                Discover amazing Ayurvedic products and start building your collection of wellness essentials. 
                Save your favorites here for easy access later!
              </p>

              {/* Features Grid */}
              {/* <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Save Favorites</h3>
                  <p className="text-gray-600 text-sm">Heart products you love and access them anytime</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Access</h3>
                  <p className="text-gray-600 text-sm">Easily find and purchase your saved items</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Stay Updated</h3>
                  <p className="text-gray-600 text-sm">Get notified about price drops and new arrivals</p>
                </div>
              </div> */}

              {/* Call to Action */}
              <div className="space-y-4">
              <Link href="/products">
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="hover:from-[#676E3F] hover:to-[#B89F73] text-gray-800  px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Start Shopping Now
                  </Button>
                </Link>
                
                <div className="text-sm text-gray-500">
                  <p>Explore our curated collection of authentic Ayurvedic products</p>
                </div>
              </div>

              {/* Popular Categories */}
              {/* <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-800 mb-8">Popular Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Herbal Supplements', icon: '🌿', href: '/products?category=supplements' },
                    { name: 'Skincare', icon: '✨', href: '/products?category=skincare' },
                    { name: 'Wellness', icon: '🧘', href: '/products?category=wellness' },
                    { name: 'Personal Care', icon: '🛁', href: '/products?category=personal-care' }
                  ].map((category, index) => (
                    <Link key={index} href={category.href}>
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 hover:bg-white/80 transition-all duration-300 cursor-pointer group">
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                          {category.icon}
                        </div>
                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {category.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </>
    );
  }

  // return (
  //   <div className="min-h-screen bg-gray-50 py-12">
  //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //       <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

  //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" >
  //         {favourites.map((product) => (
  //           <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow" onClick={() => handleProductClick(product.productId)}>
  //             <div className="relative w-full h-48">
  //               {product.image && (
  //                 <Image
  //                   src={product.image}
  //                   alt={product.title}
  //                   fill
  //                  className="w-full h-48 object-contain rounded-t-lg"
  //                 />
  //               )}
  //               <button
  //                 onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
  //                   e?.preventDefault();
  //                   e?.stopPropagation();
  //                   // removeFromFavourites(product.id);
  //                   setConfirmId(product.id);
  //                 }}
  //                 className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
  //               >
  //                 <Trash className="w-5 h-5 text-red-600 ml-1 mt-1" />
  //               </button>

  //             </div>

  //             <div className="p-4">
  //               {/* <Badge variant="secondary" size="sm" className="mb-2">
  //                 {product.category || 'Uncategorized'}
  //               </Badge> */}
  //               <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
  //                 {product.title}
  //               </h3>
  //               {product.description && (
  //                 <p className="text-gray-600 text-sm mb-2 line-clamp-3">
  //                   {product.description}
  //                 </p>
  //               )}
  //               <p className="text-green-600 font-bold mt-2 mb-2 text-lg">₹{product.price}</p>

  //               <Button
  //                 variant="primary"
  //                 size="sm"
  //                 className="mt-2 w-full"
  //                 onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
  //                   e?.preventDefault();
  //                   e?.stopPropagation();
  //                   handleAddToCart(product);
  //                 }}
  //               >
  //                 Add to Cart
  //               </Button>
  //             </div>
  //           </Card>
  //         ))}
  //       </div>
  //        {/* Confirmation Dialog */}
  //       {confirmId && (
  //         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
  //           <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
  //             <p className="text-gray-800 mb-4">Are you sure you want to remove this item from your wishlist?</p>
  //             <div className="flex justify-around">
  //               <Button
  //                 variant="secondary"
  //                 onClick={() => setConfirmId(null)}
  //               >
  //                 Cancel
  //               </Button>
  //               <Button
  //                 variant="primary"
  //                 className="bg-red-600 text-white hover:bg-red-700"
  //                 onClick={(e) => {
  //                   e?.stopPropagation();
  //                   removeFromFavourites(confirmId)}}
  //               >
  //                 Remove
  //               </Button>
  //             </div>
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
//   return (
//   <div className="min-h-screen bg-gray-50 py-12">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

//       <div className="overflow-x-auto">
//         <table className="min-w-full border-collapse">
//           <thead>
//             <tr className="bg-[#C88370] text-white text-left">
//               <th className="py-2 px-4 font-semibold">S.No.</th>
//               <th className="py-2 px-4 font-semibold">Product Image</th>
//               <th className="py-2 px-4 font-semibold">Product Name</th>
//               <th className="py-2 px-4 font-semibold">Price</th>
//               <th className="py-2 px-4 font-semibold">Option</th>
//               <th className="py-2 px-4 font-semibold">Remove</th>
//             </tr>
//           </thead>
//           <tbody>
//             {favourites.map((product, index) => (
//               <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
//                 <td className="py-4 px-4">{index + 1}</td>
//                 <td className="py-4 px-4 w-24 h-24">
//                   {product.image && (
//                     <Image
//                       src={product.image}
//                       alt={product.title}
//                       width={80}
//                       height={80}
//                       className="object-contain rounded-full"
//                     />
//                   )}
//                 </td>
//                 <td className="py-4 px-4 font-medium">{product.title}</td>
//                 <td className="py-4 px-4 text-gray-700">₹{product.price}</td>
//                 <td className="py-4 px-4">
//                   <Button
//                     variant="primary"
//                     size="sm"
//                     className="bg-[#C88370] text-white rounded-full px-4 py-1 hover:bg-[#b2705c]"
//                     onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
//                       e?.preventDefault();
//                       e?.stopPropagation();
//                       handleAddToCart(product);
//                     }}
//                   >
//                     Add To Cart
//                   </Button>
//                 </td>
//                 <td className="py-4 px-4">
//                   <button
//                     onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
//                       e?.preventDefault();
//                       e?.stopPropagation();
//                       setConfirmId(product.id);
//                     }}
//                     className="text-[#C88370] hover:text-red-600"
//                   >
//                     <Trash className="w-5 h-5" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Confirmation Dialog */}
//       {confirmId && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
//           <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
//             <p className="text-gray-800 mb-4">Are you sure you want to remove this item from your wishlist?</p>
//             <div className="flex justify-around">
//               <Button variant="secondary" onClick={() => setConfirmId(null)}>
//                 Cancel
//               </Button>
//               <Button
//                 variant="primary"
//                 className="bg-red-600 text-white hover:bg-red-700"
//                 onClick={(e) => {
//                   e?.stopPropagation();
//                   removeFromFavourites(confirmId);
//                 }}
//               >
//                 Remove
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   </div>
// );

// return (
//   <div className="rounded-[10px] text-center min-h-screen py-12 ayur-bgcover ayur-cartpage-wrapper ayur-wishlistpage bg-white">
//     <div className="overflow-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       <h1 className="text-3xl font-bold mb-6 text-left">My Wishlist</h1>

//       <table className="w-full table-fixed">
//         <thead>
//           <tr>
//             <th className="bg-[#CD8973] text-white text-center py-3 px-2 rounded-tl-[10px] w-[60px]">S.No.</th>
//             <th className="bg-[#CD8973] text-white text-center py-3 px-2 w-[120px]">Product Image</th>
//             <th className="bg-[#CD8973] text-white text-center py-3 px-2 w-[200px]">Product Name</th>
//             <th className="bg-[#CD8973] text-white text-center py-3 px-2 w-[100px]">Price</th>
//             <th className="bg-[#CD8973] text-white text-center py-3 px-2 w-[100px]">Option</th>
//             <th className="bg-[#CD8973] text-white text-center py-3 px-2 rounded-tr-[10px] w-[80px]">Remove</th>
//           </tr>
//         </thead>
//         <tbody className="bg-white">
//           {favourites.map((product, index) => (
//             <tr key={product.id}>
//               <td className="text-center border border-[#F0F0F0] py-3 px-2 text-[16px] font-medium text-[#797979]">
//                 {index + 1}
//               </td>
//               <td className="text-center border border-[#F0F0F0] py-3 px-2">
//                 <div className="w-[60px] h-[60px] mx-auto relative">
//                   {product.image ? (
//                     <Image
//                       src={product.image}
//                       alt={product.title}
//                       fill
//                       className="object-cover"
//                       sizes="60px"
//                     />
//                   ) : (
//                     <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//                       <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                       </svg>
//                     </div>
//                   )}
//                 </div>
//               </td>
//               <td className="text-center border border-[#F0F0F0] py-3 px-2">
//                 <h2 className="text-[16px] font-medium text-[#222222]">{product.title}</h2>
//               </td>
//               <td className="text-center border border-[#F0F0F0] py-3 px-2 text-[16px] font-medium text-[#797979]">
//                 ₹{product.price}
//               </td>
//               <td className="text-center border border-[#F0F0F0] py-3 px-2">
//                 <Button
//                   variant="primary"
//                   size="sm"
//                   className="bg-[#C88370] text-white rounded-full px-4 py-1 hover:bg-[#b2705c]"
//                   onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
//                     e?.preventDefault();
//                     e?.stopPropagation();
//                     handleAddToCart(product);
//                   }}
//                 >
//                   Add To Cart
//                 </Button>
//               </td>
//               <td className="text-center border border-[#F0F0F0] py-3 px-2">
//                 <button
//                   onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
//                     e?.preventDefault();
//                     e?.stopPropagation();
//                     setConfirmId(product.id);
//                   }}
//                   className="hover:opacity-70"
//                 >
//                   <Image
//                     src="/assets/images/delete.png"
//                     alt="delete"
//                     width={20}
//                     height={20}
//                     className="object-cover"
//                   />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Confirmation Dialog */}
//       {confirmId && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
//           <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
//             <p className="text-gray-800 mb-4">Are you sure you want to remove this item from your wishlist?</p>
//             <div className="flex justify-around">
//               <Button variant="secondary" onClick={() => setConfirmId(null)}>
//                 Cancel
//               </Button>
//               <Button
//                 variant="primary"
//                 className="bg-red-600 text-white hover:bg-red-700"
//                 onClick={(e) => {
//                   e?.stopPropagation();
//                   removeFromFavourites(confirmId);
//                 }}
//               >
//                 Remove
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   </div>
// );

return (
  <>
   {/* Breadcrumb Section */}
          <Breadcrumb title="My Wishlist" crumbs={[{ label: 'Home', href: '/' }, { label: 'favourites' }]} imageSrc="/assets/images/bredcrumb-bg.jpg" />

  <div className="rounded-[10px] text-center min-h-screen py-12 ayur-bgcover ayur-cartpage-wrapper ayur-wishlistpage bg-white">
    <div className="overflow-x-auto max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      
      <div className="inline-block min-w-full align-middle">
        <table className="w-full border-collapse min-w-[640px] sm:min-w-full">
          <thead>
            <tr>
              <th className="bg-[#CD8973] text-white text-center py-2 sm:py-3 px-1 sm:px-2 rounded-tl-[10px] w-[60px] hidden sm:table-cell">S.No.</th>
              <th className="bg-[#CD8973] text-white text-center py-2 sm:py-3 px-1 sm:px-2 w-[90px] sm:w-[120px]">Image</th>
              <th className="bg-[#CD8973] text-white text-center py-2 sm:py-3 px-1 sm:px-2 w-[160px] sm:w-[200px]">Product</th>
              <th className="bg-[#CD8973] text-white text-center py-2 sm:py-3 px-1 sm:px-2 w-[80px] sm:w-[100px]">Price</th>
              <th className="bg-[#CD8973] text-white text-center py-2 sm:py-3 px-1 sm:px-2 w-[90px] sm:w-[110px]">Option</th>
              <th className="bg-[#CD8973] text-white text-center py-2 sm:py-3 px-1 sm:px-2 rounded-tr-[10px] w-[70px]">Remove</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {favourites.map((product, index) => (
              <tr key={product.id}>
                <td className="text-center border border-[#F0F0F0] py-2 sm:py-3 px-1 sm:px-2 text-[14px] sm:text-[16px] font-medium text-[#797979] hidden sm:table-cell">{index + 1}</td>
                <td className="text-center border border-[#F0F0F0] py-2 sm:py-3 px-1 sm:px-2">
                  <div className="w-12 h-12 sm:w-[60px] sm:h-[60px] mx-auto relative ">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover cursor-pointer"
                        sizes="(max-width: 640px) 48px, 60px"
                        onClick={() => handleProductClick(product.productId)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>
                <td className="text-center border border-[#F0F0F0] py-2 sm:py-3 px-1 sm:px-2">
                  <h2 className="text-[14px] sm:text-[16px] font-medium text-[#222222]">{product.title}</h2>
                </td>
                <td className="text-center border border-[#F0F0F0] py-2 sm:py-3 px-1 sm:px-2 text-[14px] sm:text-[16px] font-medium text-[#797979]">₹{product.price}</td>
                <td className="text-center border border-[#F0F0F0] py-2 sm:py-3 px-1 sm:px-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="ayur-btn bg-[#CD8973] hover:bg-[#B8755F] text-white px-3 py-2 text-xs sm:px-8 sm:py-3 sm:text-base rounded-md"
                    onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                      e?.preventDefault();
                      e?.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    Add To Cart
                  </Button>
                </td>
                <td className="text-center border border-[#F0F0F0] py-2 sm:py-3 px-1 sm:px-2">
                  <button
                    onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                      e?.preventDefault();
                      e?.stopPropagation();
                      setConfirmId(product.id);
                    }}
                    className="hover:opacity-70 inline-flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto"
                  >
                    <Image
                      src="/assets/images/delete.png"
                      alt="delete"
                      width={18}
                      height={18}
                      className="object-cover"
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      {confirmId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <p className="text-gray-800 mb-4">Are you sure you want to remove this item from your wishlist?</p>
            <div className="flex justify-around">
              <Button variant="secondary" onClick={() => setConfirmId(null)}>Cancel</Button>
              <Button
                variant="primary"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={(e) => {
                  e?.stopPropagation();
                  removeFromFavourites(confirmId);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  </>
);


} 
