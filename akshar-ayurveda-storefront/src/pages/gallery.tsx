import React, { useState } from 'react';
import Head from 'next/head';
import Hero from '../components/layout/Hero';
import Section from '../components/layout/Section';
import ProductGrid from '../components/products/ProductGrid';
import { Button } from '../components/ui';
import { sdk } from '@lib/config';
import { HttpTypes } from '@shopenup/types';
import { getCategoriesList } from '@lib/shopenup/categories';

interface GalleryItem {
  id: number;
  category: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  count: number;
}

// NOTE: Make sure you have NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY set in your .env.local file
// Example: NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY=your_actual_publishable_key

export default function GalleryPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [loading, setLoading] = React.useState(true);
  const [catLoading, setCatLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [catError, setCatError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        setCatLoading(true);
          const cats = await getCategoriesList();
        console.log('cats', cats);
        setCategories(cats.product_categories || []);
      } catch (err: any) {
        setCatError(err.message);
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  React.useEffect(() => {
    // Fetch products
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query: any = {
          limit: 100,
          offset: 0,
          fields: '*variants.calculated_price',
        };
        
        // Add category filter if a specific category is selected
        if (selectedCategory !== 'all') {
          query.category_id = selectedCategory;
        }
        
        console.log('Fetching products with query:', query);
        
        const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
          '/store/products',
          {
            query,
            next: { tags: ['products'] },
            // cache: 'force-cache',
          }
        );
        
        const sdkProducts = response.products || [];
        console.log('API Response:', response);
        console.log('Total products returned:', sdkProducts.length);
        console.log('Product IDs:', sdkProducts.map(p => ({ id: p.id, title: p.title, status: p.status })));
        
        setProducts(sdkProducts);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]); // Add selectedCategory as dependency

  // // Custom fetch to always include the publishable API key header
  // React.useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       const apiUrl = process.env['NEXT_PUBLIC_SHOPENUP_BACKEND_URL'] || 'http://localhost:9000';
  //       const res = await fetch(`${apiUrl}/store/products?limit=50&offset=0`, {
  //         headers: {
  //           'x-publishable-api-key': process.env['NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY'] || 'pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f',
  //         },
  //       });
  //       if (!res.ok) throw new Error('Failed to fetch products');
  //       const data = await res.json();
  //       setProducts(data.products || []);
  //     } catch (err: any) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchProducts();
  // }, []);

  // const [selectedCategory, setSelectedCategory] = useState('all');
  // const categories: Category[] = [
  //   { id: 'all', name: 'All Products', count: 8 },
  //   { id: 'herbs', name: 'Herbs & Spices', count: 2 },
  //   { id: 'oils', name: 'Ayurvedic Oils', count: 2 },
  //   { id: 'supplements', name: 'Supplements', count: 2 },
  //   { id: 'cosmetics', name: 'Natural Cosmetics', count: 2 }
  // ];
  // const galleryItems: GalleryItem[] = [
  //   { id: 1, category: 'herbs', title: 'Ashwagandha Root Powder', description: 'Traditional herb for stress relief', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', tags: ['Stress Relief', 'Energy'] },
  //   { id: 2, category: 'oils', title: 'Sesame Oil', description: 'Pure sesame oil for massage', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', tags: ['Massage', 'Cooking'] },
  //   { id: 3, category: 'supplements', title: 'Chyawanprash', description: 'Traditional immunity booster', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', tags: ['Immunity', 'Energy'] },
  //   { id: 4, category: 'cosmetics', title: 'Neem Face Pack', description: 'Natural skin care', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', tags: ['Skin Care', 'Natural'] },
  //   { id: 5, category: 'herbs', title: 'Turmeric Powder', description: 'Pure turmeric for health', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', tags: ['Anti-inflammatory', 'Immunity'] },
  //   { id: 6, category: 'oils', title: 'Coconut Oil', description: 'Virgin coconut oil', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', tags: ['Hair Care', 'Skin Care'] },
  //   { id: 7, category: 'supplements', title: 'Triphala Churna', description: 'Digestive supplement', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', tags: ['Digestion', 'Detox'] },
  //   { id: 8, category: 'cosmetics', title: 'Aloe Vera Gel', description: 'Pure aloe vera gel', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', tags: ['Hydration', 'Skin Care'] }
  // ];
  // const filteredItems = selectedCategory === 'all' ? galleryItems : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <>
      <Head>
        <title>Gallery - AKSHAR AYURVED</title>
        <meta name="description" content="Explore our collection of authentic Ayurvedic products." />
      </Head>
      <div className="bg-gradient-to-br from-green-50 to-yellow-50 min-h-screen">
        <Hero
          title="Product Gallery"
          subtitle="Discover our authentic collection of Ayurvedic products"
          backgroundGradient="bg-green-600"
        />
        {/* Category Filter - commented out for now */}
        <Section background="white" padding="sm">
          <div className="flex flex-wrap justify-center gap-4">
            {catLoading ? (
              <div>Loading categories...</div>
            ) : catError ? (
              <div className="text-red-600">{catError}</div>
            ) : (
              <>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-6 py-3 rounded-full font-medium transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-green-700 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Products
                </button>
                {categories.map((category: any) => (
                  <button
                     key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-3 rounded-full font-medium transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-green-700 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </Section>
        <Section>
          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : (
            <ProductGrid
              products={products.map((product: any) => {
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
                  description: product.description,
                  price: price,
                  image: product.thumbnail || product.images?.[0]?.url || '',
                  images: product.images?.map((img: any) => img.url).filter(Boolean) || [],
                  category: product.category?.name || product.type?.label || '',
                  tags: product.tags || [],
                  rating: product.rating,
                  reviewCount: product.review_count,
                  inStock: product.variants?.[0]?.inventory_quantity > 0 || product.in_stock !== false
                };
              })}
              columns={4}
              showActions={false}
            />
          )}
        </Section>
        {/* CTA Section */}
        {/* <Section className='!bg-green-600' padding="lg">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Experience Authentic Ayurveda?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Browse our complete collection and find the perfect products for your wellness journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                Shop Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                Take Dosha Assessment
              </Button>
            </div>
          </div>
        </Section> */}
      </div>
    </>
  );
}
