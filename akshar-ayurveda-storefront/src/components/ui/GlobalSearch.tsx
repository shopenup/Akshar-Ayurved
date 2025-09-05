import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { sdk } from '@lib/config';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
}

interface GlobalSearchProps {
  className?: string;
}

export default function GlobalSearch({ className = '' }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('GlobalSearch - Fetching products...');
        
        // Try different API endpoints
        let productsData;
        try {
          productsData = await sdk.client.fetch('/products', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (firstError) {
          console.log('GlobalSearch - First API call failed, trying alternative...');
          try {
            productsData = await sdk.client.fetch('/store/products', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
          } catch (secondError) {
            console.log('GlobalSearch - Second API call failed, trying direct fetch...');
            productsData = await fetch('/api/products').then(res => res.json());
          }
        }
        
        console.log('GlobalSearch - Products data:', productsData);

        let productsArray: any[] = [];
        if (Array.isArray(productsData)) {
          productsArray = productsData;
        } else if (productsData && typeof productsData === 'object') {
          if (Array.isArray((productsData as any).products)) {
            productsArray = (productsData as any).products;
          } else if (Array.isArray((productsData as any).data)) {
            productsArray = (productsData as any).data;
          }
        }

        if (productsArray.length > 0) {
          const mappedProducts = productsArray.map((product: any) => ({
            id: product.id,
            name: product.title || product.name || 'Untitled Product',
            originalPrice: product.variants?.[0]?.original_price || product.original_price,
            image: product.images?.[0]?.url || product.thumbnail || '/assets/placeholder-product.jpg',
            category: product.categories?.[0]?.name || product.category?.name || 'Uncategorized',
            description: product.description || product.subtitle || '',
            inStock: product.variants?.[0]?.inventory_quantity > 0 || product.in_stock !== false,
            price: product.variants?.[0]?.calculated_price?.calculated_amount || product.price || 0,
          }));
          
          setAllProducts(mappedProducts);
          console.log('GlobalSearch - Mapped products:', mappedProducts);
        }
      } catch (error) {
        console.error('GlobalSearch - Error fetching products:', error);
        // Fallback to sample products if API fails
        const fallbackProducts = [
          {
            id: 'fallback-1',
            name: 'Chyawanprash',
            price: 299,
            originalPrice: 399,
            image: '/assets/placeholder-product.jpg',
            category: 'Immunity Boosters',
            description: 'Traditional Ayurvedic immunity booster',
            inStock: true
          },
          {
            id: 'fallback-2',
            name: 'Ashwagandha Capsules',
            price: 599,
            originalPrice: 799,
            image: '/assets/placeholder-product.jpg',
            category: 'Stress Relief',
            description: 'Natural stress relief capsules',
            inStock: true
          },
          {
            id: 'fallback-3',
            name: 'Triphala Churna',
            price: 199,
            image: '/assets/placeholder-product.jpg',
            category: 'Digestive Health',
            description: 'Natural digestive supplement',
            inStock: true
          }
        ];
        setAllProducts(fallbackProducts);
        console.log('GlobalSearch - Using fallback products:', fallbackProducts);
      }
    };

    fetchProducts();
  }, []);

  // Search function
  const searchProducts = (searchQuery: string): Product[] => {
    if (!searchQuery.trim()) return [];
    
    console.log('GlobalSearch - Searching for:', searchQuery);
    console.log('GlobalSearch - Available products:', allProducts.length);
    console.log('GlobalSearch - All products:', allProducts);
    
    const query = searchQuery.toLowerCase();
    const filteredProducts = allProducts.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(query);
      const categoryMatch = product.category?.toLowerCase().includes(query);
      const descriptionMatch = product.description?.toLowerCase().includes(query);
      
      console.log('GlobalSearch - Product:', product.name, {
        nameMatch,
        categoryMatch,
        descriptionMatch,
        productName: product.name,
        productCategory: product.category
      });
      
      return nameMatch || categoryMatch || descriptionMatch;
    });
    
    console.log('GlobalSearch - Filtered results:', filteredProducts);
    return filteredProducts.slice(0, 6); // Limit to 6 results for dropdown
  };

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
        const searchResults = searchProducts(value);
        setResults(searchResults);
        setIsLoading(false);
        setIsOpen(true);
      }, 300);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  // Handle product click
  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
    setIsOpen(false);
    setQuery('');
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            className="w-4/5 pl-12 pr-10 py-2.5 text-base border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none hover:bg-white transition-all duration-200 placeholder-gray-500"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-full"
            >
              <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">
                  Found {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
                </p>
              </div>
              <div className="py-2">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded-lg mr-4"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                      {/* <p className="text-sm text-gray-500 truncate">{product.originalPrice}</p> */}
                      
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 p-4">
                <button
                  onClick={handleSubmit}
                  className="w-full text-center text-green-600 hover:text-green-700 hover:bg-green-50 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  View all results for &quot;{query}&quot;
                </button>
              </div>
            </>
          ) : query.trim() ? (
            <div className="p-6 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-600 font-medium">No products found for &quot;{query}&quot;</p>
              <p className="text-sm text-gray-400 mt-1">Try different keywords or browse our categories</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
