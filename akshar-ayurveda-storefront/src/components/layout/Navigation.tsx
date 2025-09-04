import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getCategoriesList } from '@lib/shopenup/categories';
import { GlobalSearch } from '../ui';
import { useSignout } from '../../hooks/customer';
import { useAppContext } from '../../context/AppContext';
import { useCart } from '../../hooks/cart';


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

export default function Navigation({ 
  cartItemCount = 0, 
  favouriteCount = 0, 
  isLoggedIn = false,
  updateCartCount,
  setLoggedIn,
  resetAppState
}: NavigationProps) {
  const router = useRouter();
  const { mutateAsync: signout, isPending: isSigningOut } = useSignout();
  const { resetAppState: contextResetAppState, updateCartCount: contextUpdateCartCount } = useAppContext();
  
  // Use cart hook to get real-time cart data
  const { data: cart } = useCart({ enabled: true });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate cart count from cart data
  const currentCartCount = cart?.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  // Update cart count in context when cart changes
  useEffect(() => {
    if (contextUpdateCartCount) {
      contextUpdateCartCount(currentCartCount);
    }
  }, [currentCartCount, contextUpdateCartCount]);

  const toggleProductsDropdown = () => {
    setIsProductsDropdownOpen(!isProductsDropdownOpen);
  };

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
      const target = event.target as Element;
      if (isProductsDropdownOpen && !target.closest('.products-dropdown')) {
        setIsProductsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProductsDropdownOpen]);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact Us', href: '/contact' }
  ];

  const handleSignout = async () => {
    try {
      await signout('in');
      
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
      console.error('❌ Error during signout:', error);
      // Force redirect even if there's an error
      router.push('/');
    }
  };

  return (
    <nav className="bg-white shadow-lg w-full">
      <div className="w-full px-1 xs:px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 2xl:px-12">
        <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16 md:h-18 lg:h-20 py-1 xs:py-2">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center">
                <Image
                  src="/assets/logo.webp"
                  alt="Akshar Ayurved Logo"
                  width={120}
                  height={40}
                  className="h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 w-auto object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop/Tablet */}
          <div className="hidden sm:block flex-1 mx-1 xs:mx-2 sm:mx-3 md:mx-4 lg:mx-6 xl:mx-8 max-w-2xl">
            <GlobalSearch />
          </div>

          {/* Desktop Navigation & User Actions */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2 2xl:space-x-3 flex-shrink-0">
            {/* Navigation Items */}
            <div className="flex items-center space-x-1 xl:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-1 xl:px-2 py-1 xl:py-2 rounded-md text-xs xl:text-sm font-medium transition-colors ${
                    router.pathname === item.href
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <span className="hidden xl:inline">{item.name}</span>
                  <span className="xl:hidden">{item.name.split(' ')[0]}</span>
                </Link>
              ))}

              {/* Products Dropdown */}
              <div className="relative products-dropdown">
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
                        {/* All Products Link */}
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
                        
                        {/* Category Links */}
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
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-1 xl:space-x-2">
              {/* Favourites */}
              <Link href="/favourites" className="relative p-1 xl:p-2 text-gray-700 hover:text-green-600">
                <svg className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favouriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 xl:h-5 xl:w-5 flex items-center justify-center">
                    {favouriteCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-1 xl:p-2 text-gray-700 hover:text-green-600">
                <svg className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                {currentCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 xl:h-5 xl:w-5 flex items-center justify-center">
                    {currentCartCount}
                  </span>
                )}
              </Link>

              {/* Login/User */}
              {isLoggedIn ? (
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-green-600">
                    <svg className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs xl:text-sm font-medium hidden xl:inline">Account</span>
                    <svg className="ml-1 w-3 h-3 xl:w-4 xl:h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Profile Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/favourites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
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
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-green-600 text-white px-2 xl:px-3 py-1 xl:py-2 rounded-md text-xs xl:text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <span className="hidden xl:inline">Login</span>
                  <span className="xl:hidden">Log</span>
                </Link>
              )}
            </div>

            {/* Social Media Icons - Desktop Only */}
            <div className="hidden xl:flex items-center space-x-1 2xl:space-x-2 ml-2">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4 2xl:w-5 2xl:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
              >
                <svg className="w-4 h-4 2xl:w-5 2xl:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.23 16.39c-1.214-.864-2.034-2.253-2.034-3.847 0-2.613 2.121-4.733 4.734-4.733s4.733 2.12 4.733 4.733c0 1.594-.82 2.983-2.034 3.847a4.705 4.705 0 01-2.699.886 4.704 4.704 0 01-2.7-.886zm8.84-9.67h-1.789c-.711 0-1.287-.576-1.287-1.287s.576-1.287 1.287-1.287h1.789c.711 0 1.287.576 1.287 1.287s-.576 1.287-1.287 1.287z"/>
                </svg>
              </a>

              {/* Twitter/X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-400 transition-colors"
              >
                <svg className="w-4 h-4 2xl:w-5 2xl:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <svg className="w-4 h-4 2xl:w-5 2xl:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                <svg className="w-4 h-4 2xl:w-5 2xl:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.488"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Tablet Navigation (md-lg) */}
          <div className="hidden sm:flex lg:hidden items-center space-x-2 flex-shrink-0">
            {/* Essential User Actions Only */}
            <Link href="/favourites" className="relative p-2 text-gray-700 hover:text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favouriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {favouriteCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleProductsDropdown}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-green-50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex-shrink-0">
            <button
              onClick={toggleProductsDropdown}
              className="inline-flex items-center justify-center p-1 xs:p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-green-50"
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
          <div className="px-1 xs:px-2 sm:px-3 pt-2 pb-3 space-y-1 bg-white border-t">
            {/* Mobile Search - Only for small screens */}
            <div className="sm:hidden px-2 xs:px-3 py-2 xs:py-3">
              <GlobalSearch />
            </div>
            
            {/* Navigation Items */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-2 xs:px-3 py-2 rounded-md text-sm xs:text-base font-medium ${
                  router.pathname === item.href
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={() => setIsProductsDropdownOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Products */}
            <div className="px-2 xs:px-3 py-2">
              <div className="text-sm xs:text-base font-medium text-gray-700 mb-2">Products</div>
              <div className="pl-2 xs:pl-4 space-y-1">
                {categoriesLoading ? (
                  <div className="py-1 text-xs xs:text-sm text-gray-500">Loading...</div>
                ) : categoriesError ? (
                  <div className="py-1 text-xs xs:text-sm text-red-500">Error loading categories</div>
                ) : categories.length === 0 ? (
                  <div className="py-1 text-xs xs:text-sm text-gray-500">No categories available</div>
                ) : (
                  categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      href={`/products/${category.id}`}
                      className="block py-1 text-xs xs:text-sm text-gray-600 hover:text-green-600 truncate"
                      onClick={() => setIsProductsDropdownOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))
                )}
                <Link
                  href="/products"
                  className="block py-1 text-xs xs:text-sm text-green-600 font-medium"
                  onClick={() => setIsProductsDropdownOpen(false)}
                >
                  View All Products →
                </Link>
              </div>
            </div>

            {/* Mobile User Actions */}
            <div className="grid grid-cols-2 gap-2 px-2 xs:px-3 py-2 border-t">
              <Link
                href="/favourites"
                className="flex items-center justify-center p-2 xs:p-3 text-gray-700 hover:text-green-600 bg-gray-50 rounded-lg"
                onClick={() => setIsProductsDropdownOpen(false)}
              >
                <svg className="w-4 h-4 xs:w-5 xs:h-5 mr-1 xs:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-xs xs:text-sm">Favourites</span>
                {favouriteCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 xs:h-5 xs:w-5 flex items-center justify-center">
                    {favouriteCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="flex items-center justify-center p-2 xs:p-3 text-gray-700 hover:text-green-600 bg-gray-50 rounded-lg"
                onClick={() => setIsProductsDropdownOpen(false)}
              >
                <svg className="w-4 h-4 xs:w-5 xs:h-5 mr-1 xs:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <span className="text-xs xs:text-sm">Cart</span>
                {currentCartCount > 0 && (
                  <span className="ml-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 xs:h-5 xs:w-5 flex items-center justify-center">
                    {currentCartCount}
                  </span>
                )}
              </Link>
            </div>

            {!isLoggedIn && (
              <div className="px-2 xs:px-3 py-2">
                <Link
                  href="/login"
                  className="block w-full bg-green-600 text-white px-3 xs:px-4 py-2 xs:py-3 rounded-md text-center text-sm xs:text-base font-medium hover:bg-green-700 transition-colors"
                  onClick={() => setIsProductsDropdownOpen(false)}
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile Social Media */}
            <div className="px-2 xs:px-3 py-2 xs:py-3 border-t border-gray-200">
              <div className="text-xs xs:text-sm font-medium text-gray-700 mb-2 xs:mb-3">Follow Us</div>
              <div className="grid grid-cols-5 gap-2 xs:gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center p-2 xs:p-3 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center p-2 xs:p-3 bg-pink-50 rounded-lg text-pink-600 hover:bg-pink-100 transition-colors"
                >
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.23 16.39c-1.214-.864-2.034-2.253-2.034-3.847 0-2.613 2.121-4.733 4.734-4.733s4.733 2.12 4.733 4.733c0 1.594-.82 2.983-2.034 3.847a4.705 4.705 0 01-2.699.886 4.704 4.704 0 01-2.7-.886zm8.84-9.67h-1.789c-.711 0-1.287-.576-1.287-1.287s.576-1.287 1.287-1.287h1.789c.711 0 1.287.576 1.287 1.287s-.576 1.287-1.287 1.287z"/>
                  </svg>
                </a>

                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center p-2 xs:p-3 bg-blue-50 rounded-lg text-blue-400 hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>

                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center p-2 xs:p-3 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                >
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center p-2 xs:p-3 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors"
                >
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.488"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
