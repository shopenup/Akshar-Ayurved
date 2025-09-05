import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { sdk } from '@lib/config';
import { getCategoriesList } from '@lib/shopenup/categories';
import { ProductGrid } from '@components/products';
import Hero from '@components/layout/Hero';
import Section from '@components/layout/Section';
import { Button } from '@components/ui';
import { useToast } from '@components/ui';
import { useAppContext } from '@context/AppContext';
import { useAddLineItem } from '@hooks/cart';
import { useCountryCode } from '@hooks/country-code';

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
  const { updateCartCount } = useAppContext();
  const countryCode = useCountryCode() || 'in';
  const { mutateAsync: addLineItem, isPending: isAddingToCart } = useAddLineItem();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCategoryAndProducts();
    }
  }, [id]);


  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesResponse = await getCategoriesList();   
      const categoryData = categoriesResponse.product_categories.find((cat: any) => cat.id === id);
      
      if (!categoryData) {
        setError('Category not found');
        setLoading(false);
        return;
      }

      // Set category info first
      setCategory({
        id: categoryData.id,
        name: categoryData.name,
        description: categoryData.description || '',
        image: (categoryData as any).thumbnail || '',
        productCount: 0, // Will be updated after fetching products
        isActive: (categoryData as any).is_active !== undefined ? (categoryData as any).is_active : true
      });

      // Fetch products for this category from API
      const query: any = {
        limit: 100,
        offset: 0,
        fields: '*variants.calculated_price',
        category_id: id as string
      };
      
      
      const productsResponse = await sdk.client.fetch<{ products: any[]; count: number }>(
        '/store/products',
        {
          query,
          next: { tags: ['products'] },
        }
      );
      

      const formattedProducts: Product[] = (productsResponse.products || []).map((product: any) => {
        // Try to get price from different sources
        let price = 0;
        
        // Check calculated_price first (most common)
        if (product.variants?.[0]?.calculated_price?.calculated_amount) {
          price = product.variants[0].calculated_price.calculated_amount;
        }
        // Fallback to direct price
        else if (product.price) {
          price = product.price;
        }
        
        
        return {
          id: product.id,
          name: product.title,
          description: product.description || '',
          price: price,
          originalPrice: product.original_price,
          image: product.thumbnail || product.images?.[0]?.url || '',
          images: product.images?.map((img: any) => img.url).filter(Boolean) || [],
          category: product.category?.name || product.type?.label || '',
          tags: product.tags || [],
          rating: product.rating,
          reviewCount: product.review_count,
          inStock: product.variants?.[0]?.inventory_quantity > 0 || product.in_stock !== false
        };
      });

      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
      
      // Update category with actual product count
      setCategory(prev => prev ? {
        ...prev,
        productCount: formattedProducts.length
      } : null);
    } catch (err) {
      console.error('Error fetching category data:', err);
      setError('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

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
      const productResponse = await sdk.client.fetch<{ product: any }>(
        `/store/products/${productId}`,
        {
          next: { tags: ['products'] },
        }
      );

      const variantId = productResponse.product?.variants?.[0]?.id;
      if (!variantId) {
        console.error('No variant found for product:', productId);
        showToast('Product variant not found', 'error');
        return;
      }

      
      await addLineItem({
        variantId,
        quantity: 1,
        countryCode
      });

      showToast(`${product.name} added to cart`, 'success');

    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add product to cart', 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleAddToFavorites = (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        showToast('Product not found', 'error');
        return;
      }

      // Get existing favorites
      const savedFavorites = localStorage.getItem('favorites');
      let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];

      // Check if already in favorites
      const isAlreadyFavorite = favorites.some((fav: any) => fav.id === productId);
      
      if (isAlreadyFavorite) {
        // Remove from favorites
        favorites = favorites.filter((fav: any) => fav.id !== productId);
        showToast(`${product.name} removed from favorites`, 'success');
      } else {
        // Add to favorites
        const favoriteItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image
        };
        favorites.push(favoriteItem);
        showToast(`${product.name} added to favorites`, 'success');
      }

      // Save favorites
      localStorage.setItem('favorites', JSON.stringify(favorites));

    } catch (error) {
      console.error('Error managing favorites:', error);
      showToast('Failed to update favorites', 'error');
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
            backgroundGradient="bg-green-600"
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
        <div className="bg-gradient-to-br from-green-50 to-yellow-50 min-h-screen">
          <Hero
            title="Category Not Found"
            subtitle="The category you're looking for doesn't exist"
            backgroundGradient="bg-green-600"
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
      
      <div className="bg-gradient-to-br from-green-50 to-yellow-50 min-h-screen">
        <Hero
          title={category.name}
          subtitle={category.description || `Explore our ${category.name} collection`}
          backgroundGradient="bg-green-600"
        />
        
        {/* Search and Filter Section */}
        <Section background="white" padding="sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              <ProductGrid
                products={filteredProducts}
                columns={4}
                showActions={true}
                onAddToCart={handleAddToCart}
                onAddToFavorites={handleAddToFavorites}
                onProductClick={handleProductClick}
                addingToCart={addingToCart}
              />
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
        <Section className='!bg-green-600' padding="lg">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Explore More {category.name}
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Discover our complete collection of authentic Ayurvedic products for your wellness journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-green-600"
                onClick={() => router.push('/products')}
              >
                Browse All Products
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-green-600"
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
