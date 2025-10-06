import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getCategoriesList } from '@lib/shopenup/categories';
import { GlobalSearch } from '../ui';
import { useSignout } from '@hooks/customer';
import { useAppContext } from '@context/AppContext';
import { useCartWithSync } from '@hooks/cart';
import { sdk } from '@lib/config';



interface Category {
  id: string;
  name: string;
  description?: string;
}

interface NavigationProps {
  cartItemCount?: number;
  favouriteCount?: number;
  isLoggedIn?: boolean;
  updateCartCount?: (count: number) => void;
  setLoggedIn?: (loggedIn: boolean) => void;
  resetAppState?: () => void;
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

export default function Navigation({
  cartItemCount = 0,
  favouriteCount = 0,
  isLoggedIn = false,
  resetAppState
}: NavigationProps) {
  const router = useRouter();
  const { mutateAsync: signout, isPending: isSigningOut } = useSignout();
  const { resetAppState: contextResetAppState, updateCartCount: contextUpdateCartCount } = useAppContext();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const { updateFavouriteCount } = useAppContext();


  // Use cart hook to get real-time cart data with automatic context sync
  useCartWithSync({ enabled: true });

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profileDropdownTimeout, setProfileDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  // Use the cart count from context - it's automatically synced by useCartWithSync
  const currentCartCount = cartItemCount;
  favouriteCount = wishlist?.items?.length || 0;

  const toggleProductsDropdown = () => {
    setIsProductsDropdownOpen((prev) => !prev);
  };

  const handleProfileMouseEnter = () => {
    if (profileDropdownTimeout) {
      clearTimeout(profileDropdownTimeout);
      setProfileDropdownTimeout(null);
    }
    setIsProfileDropdownOpen(true);
  };

  const handleProfileMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsProfileDropdownOpen(false);
    }, 500); // Increased delay to 500ms for better UX
    setProfileDropdownTimeout(timeout);
  };




  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isLoggedIn) {
        setWishlist(null);
        setWishlistLoading(false);
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
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setWishlist(null);
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchWishlist();
  }, [updateFavouriteCount, isLoggedIn]);


  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const response = await getCategoriesList();
        if (response && response.product_categories) {
          setCategories(response.product_categories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
        setCategoriesError(errorMessage);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Restrict this handler to desktop-only to avoid interfering with mobile menu toggle
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
      const target = event.target as Element;
      if (isProductsDropdownOpen && !target.closest('.products-dropdown')) {
        setIsProductsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProductsDropdownOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (profileDropdownTimeout) {
        clearTimeout(profileDropdownTimeout);
      }
    };
  }, [profileDropdownTimeout]);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About Us', href: '/about' },
    { name: 'Blogs', href: '/blogs' },
    // { name: 'Gallery', href: '/gallery' },
    { name: 'Contact Us', href: '/contact' }
  ];

  const handleSignout = async () => {
    try {
      await signout('in');

      // Clear checkout data (email and shipping address)
      try {
        const { clearCheckoutData } = await import('@lib/shopenup/cart');
        await clearCheckoutData();
      } catch (error) {
      }

      // Reset app state but keep cart data
      if (contextResetAppState) {
        contextResetAppState();
      }
      if (resetAppState) {
        resetAppState();
      }

      // Redirect to home page
      router.push('/');
    } catch (error) {
      // Force redirect even if there's an error
      router.push('/');
    }
  };

  return (
    <nav className="bg-transparent w-full fixed top-0 left-0 right-0 z-[1000]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 bg-white shadow-md border border-gray-100 rounded-b-3xl px-3 sm:px-4 lg:px-6 overflow-visible">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center">
                <span className="text-xl sm:text-xl lg:text-2xl font-semibold uppercase tracking-wide text-[#cd8973]">
                  Akshar  <br /> Ayurved
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - hide on desktop to match template header UI */}
          <div className="hidden">
            <GlobalSearch />
          </div>

          {/* Desktop Navigation & User Actions */}
          <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
            {/* Navigation Items */}
            <div className="flex items-center gap-4 xl:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-1 xl:px-2 py-1 xl:py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${router.pathname === item.href
                    ? 'text-[#cd8973]'
                    : 'text-[#222222] hover:text-[#cd8973]'
                    }`}
                >
                  {router.pathname === item.href && (
                    <span className="hidden xl:inline mr-2 text-[#CD8973]">—</span>
                  )}
                  <span className="hidden xl:inline">{item.name}</span>
                  <span className="xl:hidden">{item.name.split(' ')[0]}</span>
                  {router.pathname === item.href && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#cd8973] rounded-full" />
                  )}
                </Link>
              ))}

              {/* Products Dropdown - Commented out for now */}
              {/* <div className="relative products-dropdown">
                <button
                  onClick={toggleProductsDropdown}
                  className={`px-1 xl:px-2 py-1 xl:py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                    router.pathname.startsWith('/products')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  {categoriesLoading ? (
                    <div className="flex items-center space-x-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <>
                      Products
                      <svg
                        className={`ml-1 inline-block w-3 h-3 xl:w-4 xl:h-4 transition-transform ${
                          isProductsDropdownOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>

                {isProductsDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 xl:w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    {categoriesLoading ? (
                      <div className="px-3 xl:px-4 py-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          <span>Loading categories...</span>
                        </div>
                      </div>
                    ) : categoriesError ? (
                      <div className="px-3 xl:px-4 py-2 text-sm text-red-500">
                        Error loading categories
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="px-3 xl:px-4 py-2 text-sm text-gray-500">
                        No categories available
                      </div>
                    ) : (
                      <>
                        <Link
                          href="/products"
                          className="block px-3 xl:px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 border-b border-gray-100"
                          onClick={() => setIsProductsDropdownOpen(false)}
                        >
                          <div className="font-medium">All Products</div>
                          <div className="text-xs text-gray-500 hidden xl:block">
                            Browse all available products ({categories.length} categories)
                          </div>
                        </Link>
                        
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/products/category/${category.id}`}
                            className="block px-3 xl:px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                            onClick={() => setIsProductsDropdownOpen(false)}
                          >
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs text-gray-500 hidden xl:block">
                              {category.description || 'No description available'}
                            </div>
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div> */}

              {/* Simple Products Link */}
              {/* <Link
                href="/products"
                className={`px-1 xl:px-2 py-1 xl:py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                  router.pathname.startsWith('/products')
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                Products
              </Link> */}
            </div>

            {/* User Actions - icon style */}
            <div className="flex items-center gap-6">
              {/* Favourites */}
              <Link href="/favourites" className="relative text-gray-800 hover:text-[#cd8973] transition-colors duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="drop-shadow-sm">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favouriteCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#CD8973] text-white text-xs rounded-full h-5 w-5 grid place-items-center font-semibold">
                    {favouriteCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative text-gray-800 hover:text-[#cd8973] transition-colors duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="drop-shadow-sm">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {(currentCartCount ?? 0) > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#CD8973] text-white text-xs rounded-full h-6 w-6 grid place-items-center font-semibold">
                    {currentCartCount}
                  </span>
                )}
              </Link>

              {/* Login/User */}
              {isLoggedIn ? (
                <div
                  className="relative"
                  onMouseEnter={handleProfileMouseEnter}
                  onMouseLeave={handleProfileMouseLeave}
                >
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-800 hover:text-[#cd8973] transition-colors duration-300"
                    >
                      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 
             2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 
             3.134-7 7h14c0-3.866-3.134-7-7-7z"/>
                    </svg>
                  </button>



                  {/* Profile Dropdown - Show on hover */}
                  {isProfileDropdownOpen && (
                    <div
                      className="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 z-[9999] border border-gray-200 transition-all duration-200"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: '0',
                        marginTop: '0px', // No gap between button and dropdown
                        width: '192px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        padding: '4px 0',
                        zIndex: 9999,
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700  hover:text-[#cd8973]"
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700  hover:text-[#cd8973]"
                      >
                        Your Orders
                      </Link>
                      <Link
                        href="/favourites"
                        className="block px-4 py-2 text-sm text-gray-700  hover:text-[#cd8973]"
                      >
                        Favourites
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleSignout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="text-gray-800 hover:text-[#cd8973]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Social Media Icons - Desktop Only */}
            <div className="hidden xl:flex items-center space-x-1 2xl:space-x-2">
              {/* Facebook */}
              {/* <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4 2xl:w-5 2xl:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a> */}

              {/* Instagram */}
              {/* <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
              >
                <svg className="w-4 h-4 2xl:w-5 2xl:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.23 16.39c-1.214-.864-2.034-2.253-2.034-3.847 0-2.613 2.121-4.733 4.734-4.733s4.733 2.12 4.733 4.733c0 1.594-.82 2.983-2.034 3.847a4.705 4.705 0 01-2.699.886 4.704 4.704 0 01-2.7-.886zm8.84-9.67h-1.789c-.711 0-1.287-.576-1.287-1.287s.576-1.287 1.287-1.287h1.789c.711 0 1.287.576 1.287 1.287s-.576 1.287-1.287 1.287z"/>
                </svg>
              </a> */}

              {/* Twitter/X */}
              {/* <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-400 transition-colors"
              >
                <svg className="w-4 h-4 2xl:w-5 2xl:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a> */}

              {/* YouTube */}
              {/* <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <svg className="w-4 h-4 2xl:w-5 2xl:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a> */}

              {/* WhatsApp */}
              <a
                href="https://wa.me/9412721980"
                target="_blank"
                rel="noopener noreferrer"
                className="relative text-gray-800 hover:text-green-600 transition-colors duration-300"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-sm">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.488" />
                </svg>
              </a>
            </div>
          </div>

          {/* Tablet Navigation (md-lg) */}
          <div className="hidden sm:flex lg:hidden items-center space-x-2 flex-shrink-0">
            {/* Essential User Actions Only */}
            <Link href="/favourites" className="relative p-2 text-[#CD8973] hover:text-[#CD8973]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favouriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#CD8973] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {favouriteCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative p-2 text-[#CD8973] hover:text-[#CD8973]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              {(currentCartCount ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#CD8973] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {currentCartCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleProductsDropdown}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#CD8973] hover:text-[#CD8973] hover:bg-[#F6F1ED]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile actions: Favourites, Cart, and Menu toggle */}
          <div className="sm:hidden flex items-center gap-2 flex-shrink-0">
            <Link href="/favourites" className="relative p-1 xs:p-2 text-[#CD8973] hover:text-[#CD8973]">
              <svg className="h-5 w-5 xs:h-6 xs:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favouriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#CD8973] text-white text-[10px] leading-none rounded-full h-4 w-4 grid place-items-center">
                  {favouriteCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative p-1 xs:p-2 text-[#CD8973] hover:text-[#CD8973]">
              <svg  className="h-5 w-5 xs:h-6 xs:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              {(currentCartCount ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#CD8973] text-white text-[10px] leading-none rounded-full h-4 w-4 grid place-items-center">
                  {currentCartCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleProductsDropdown}
              className="inline-flex items-center justify-center p-1 xs:p-2 rounded-md text-[#CD8973] hover:text-[#CD8973]"
            >
              <svg
                className={`${isProductsDropdownOpen ? 'hidden' : 'block'} h-5 w-5 xs:h-6 xs:w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isProductsDropdownOpen ? 'block' : 'hidden'} h-5 w-5 xs:h-6 xs:w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isProductsDropdownOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 bg-black/40 z-[999]" onClick={() => setIsProductsDropdownOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-56 bg-white z-[1000] shadow-xl border-r border-gray-100 transform transition-transform duration-300 ease-out">
            <div className="px-4 pt-5 pb-4">
              <div className="mb-4" />
              <div className="space-y-1">
                {navItems.map((item) => {
                  // More precise route matching
                  const isActive = item.href === '/' 
                    ? router.pathname === '/' 
                    : router.pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'text-[#CD8973] border-l-2 border-[#CD8973] bg-[#F6F1ED]'
                          : 'text-gray-700 hover:text-[#CD8973] hover:bg-[#F6F1ED] focus:text-[#CD8973] focus:bg-[#F6F1ED] focus:outline-none focus:ring-2 focus:ring-[#CD8973] focus:ring-opacity-50'
                      }`}
                      onClick={() => setIsProductsDropdownOpen(false)}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4">
                {!isLoggedIn ? (
                  <Link href="/login" className="block w-full bg-[#CD8973] text-white px-3 py-2 rounded-md text-center text-sm font-medium hover:opacity-90 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#CD8973] focus:ring-opacity-50 transition-opacity duration-200" onClick={() => setIsProductsDropdownOpen(false)}>Login</Link>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 rounded-md hover:bg-[#F6F1ED] hover:text-[#CD8973] focus:bg-[#F6F1ED] focus:text-[#CD8973] focus:outline-none focus:ring-2 focus:ring-[#CD8973] focus:ring-opacity-50 transition-colors duration-200"
                    >
                      <span>Your Account</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isAccountMenuOpen && (
                      <div className="ml-2 pl-1 border-l border-[#F6F1ED] space-y-1">
                        <Link href="/profile" className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-[#F6F1ED] hover:text-[#CD8973] focus:bg-[#F6F1ED] focus:text-[#CD8973] focus:outline-none focus:ring-2 focus:ring-[#CD8973] focus:ring-opacity-50 transition-colors duration-200" onClick={() => setIsProductsDropdownOpen(false)}>Your Profile</Link>
                        <Link href="/orders" className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-[#F6F1ED] hover:text-[#CD8973] focus:bg-[#F6F1ED] focus:text-[#CD8973] focus:outline-none focus:ring-2 focus:ring-[#CD8973] focus:ring-opacity-50 transition-colors duration-200" onClick={() => setIsProductsDropdownOpen(false)}>Your Orders</Link>
                        <Link href="/favourites" className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-[#F6F1ED] hover:text-[#CD8973] focus:bg-[#F6F1ED] focus:text-[#CD8973] focus:outline-none focus:ring-2 focus:ring-[#CD8973] focus:ring-opacity-50 transition-colors duration-200" onClick={() => setIsProductsDropdownOpen(false)}>Favourites</Link>
                        <button onClick={() => { handleSignout(); setIsProductsDropdownOpen(false); }} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded-md transition-colors duration-200">Sign Out</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Follow Us */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-3">Follow Us</div>
                {/* <div className="grid grid-cols-2 gap-3">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex justify-center p-2 bg-[#F6F1ED] rounded-lg text-[#CD8973] hover:opacity-90">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex justify-center p-2 bg-[#F6F1ED] rounded-lg text-[#CD8973] hover:opacity-90">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.23 16.39c-1.214-.864-2.034-2.253-2.034-3.847 0-2.613 2.121-4.733 4.734-4.733s4.733 2.12 4.733 4.733c0 1.594-.82 2.983-2.034 3.847a4.705 4.705 0 01-2.699.886 4.704 4.704 0 01-2.7-.886zm8.84-9.67h-1.789c-.711 0-1.287-.576-1.287-1.287s.576-1.287 1.287-1.287h1.789c.711 0 1.287.576 1.287 1.287s-.576 1.287-1.287 1.287z"/></svg>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex justify-center p-2 bg-[#F6F1ED] rounded-lg text-[#CD8973] hover:opacity-90">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex justify-center p-2 bg-[#F6F1ED] rounded-lg text-[#CD8973] hover:opacity-90">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.015 3.015 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/></svg>
                  </a>
                  <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="flex justify-center p-2 bg-[#F6F1ED] rounded-lg text-[#CD8973] hover:opacity-90">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.488"/></svg>
                  </a>
                </div> */}
               <div className="grid grid-cols-2 gap-3">

  {/* Facebook */}
  <a
    href="https://facebook.com"
    target="_blank"
    rel="noopener noreferrer"
    className="flex justify-center p-2  rounded-lg text-white hover:opacity-90"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path fill="#6246ecff" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  </a>

  {/* Instagram */}
  <a
  href="https://instagram.com"
  target="_blank"
  rel="noopener noreferrer"
  className="flex justify-center p-2 rounded-lg hover:opacity-90"
>
  <svg
    className="w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <path
      fill="#E1306C"  // Official Instagram pink color
      d="M349.33,69.33H162.67C103.43,69.33,53.33,119.43,53.33,178.67v186.67
        c0,59.24,50.1,109.34,109.34,109.34h186.67c59.24,0,109.34-50.1,109.34-109.34V178.67
        C458.67,119.43,408.57,69.33,349.33,69.33z
        M256,341.33c-47.06,0-85.33-38.27-85.33-85.33S208.94,170.67,256,170.67
        S341.33,208.94,341.33,256S303.06,341.33,256,341.33z
        M370.67,148.67c0,14.9-12.1,27-27,27s-27-12.1-27-27s12.1-27,27-27
        S370.67,133.77,370.67,148.67z"
    />
  </svg>
</a>


  {/* Twitter (X) */}
  <a
    href="https://twitter.com"
    target="_blank"
    rel="noopener noreferrer"
    className="flex justify-center p-2  rounded-lg text-white hover:opacity-90"
  >
    <svg
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path  fill="#040404ff" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.53l-5.214-6.822-5.97 6.822H2.036l7.73-8.84L1.5 2.25h6.953l4.713 6.231 5.078-6.231z" />
    </svg>
  </a>

  {/* YouTube */}
  <a
    href="https://youtube.com"
    target="_blank"
    rel="noopener noreferrer"
    className="flex justify-center p-2  rounded-lg text-white hover:opacity-90"
  >
   <svg
    className="w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 97 70"
  >
    <path
      fill="#FF0000"
      d="M94.7,12.7c-1.4-5.3-5.5-9.4-10.9-10.8C77,1,48.5,1,48.5,1s-28.5,0-35.3,0.9
         C8.8,3.3,4.7,7.3,3.3,12.7C1,25.5,1,35,1,35s0,9.5,2.3,22.3c1.4,5.3,5.5,9.4,10.9,10.8
         c6.8,0.9,35.3,0.9,35.3,0.9s28.5,0,35.3-0.9c5.3-1.4,9.4-5.5,10.9-10.8
         c2.3-12.8,2.3-22.3,2.3-22.3S97,25.5,94.7,12.7z"
    />
    <polygon fill="#FFFFFF" points="39.5,47 63.5,35 39.5,23"/>
  </svg>
  </a>

  {/* WhatsApp */}
  <a
    href="https://wa.me/1234567890"
    target="_blank"
    rel="noopener noreferrer"
    className="flex justify-center p-2  rounded-lg text-white hover:opacity-90"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path fill="#2be747ff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.488" />
    </svg>
  </a>

</div>


              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
