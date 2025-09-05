import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

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
  Spinner
} from '../components/ui';
import homepageData from '../data/homepage-data.json';
import { getIconComponent } from '../utils/icons';
import { Category, Collection, Product } from '../types/homepage';
import { useNewArrivals, useCategories, useCollections } from '../hooks/useShopenupProducts';
import { getCategoriesList } from '../lib/shopenup/categories';
import { sdk } from '../lib/config';

export default function HomePage() {
  // Use Shopenup product hooks
  const { products: newArrivals, loading: newArrivalsLoading, error: newArrivalsError } = useNewArrivals(8);
  // Remove useCategories hook
  // const { categories: shopenupCategories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [categories, setCategories] = React.useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  const [categoriesError, setCategoriesError] = React.useState<string | null>(null);

  // Function to get product count and thumbnail for a category
  const getCategoryData = async (categoryId: string) => {
    try {
      const response = await sdk.client.fetch<{ count: number; products: any[] }>('/store/products', {
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
    } catch (error) {
      console.error(`Error fetching data for category ${categoryId}:`, error);
      return { productCount: 0, productThumbnail: null };
    }
  };

  React.useEffect(() => {
    const fetchCategoriesWithCounts = async () => {
      try {
        const res = await getCategoriesList();
        console.log('Categories response:', res);
        
        const categoriesWithCounts = await Promise.all(
          (res.product_categories || []).map(async (category: any) => {
            const { productCount, productThumbnail } = await getCategoryData(category.id);
            return {
              ...category,
              product_count: productCount,
              product_thumbnail: productThumbnail
            };
          })
        );
        
        console.log('Categories with counts:', categoriesWithCounts);
        setCategories(categoriesWithCounts);
        setCategoriesLoading(false);
      } catch (err: any) {
        console.error('Categories error:', err);
        setCategoriesError(err.message);
        setCategoriesLoading(false);
      }
    };

    fetchCategoriesWithCounts();
  }, []);

  const { collections: shopenupCollections, loading: collectionsLoading } = useCollections();

  // Transform feature highlights to include icon components
  const featureHighlights = homepageData.featureHighlights.map(feature => ({
    ...feature,
    icon: React.createElement(getIconComponent(feature.icon))
  }));

  // Use dynamic categories if available, fallback to static
  const displayCategories = categories.length > 0
    ? categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      image: cat.product_thumbnail || cat.image || `https://dummyimage.com/300x300/4ade80/ffffff?text=${encodeURIComponent(cat.name)}`,
      count: cat.product_count !== undefined ? cat.product_count : '...'
    }))
    : homepageData.categories;

  const collections = shopenupCollections.length > 0 ? shopenupCollections.map(col => ({
    id: col.id,
    name: col.title,
    image: col.image || `https://dummyimage.com/300x300/22c55e/ffffff?text=${encodeURIComponent(col.title)}`,
    description: col.description
  })) : homepageData.collections;

  const handleProductClick = (productId: string) => {
    // Navigate to product detail page
    window.location.href = `/products/${productId}`;
  };

  const handleAddToCart = (productId: string) => {
    console.log('Add to cart:', productId);
  };

  const handleNewsletterSubmit = async (email: string) => {
    console.log('Newsletter subscription:', email);
    // Add your newsletter subscription logic here
  };

  return (
    <>
      <Head>
        <title>AKSHAR AYURVED</title>
        <meta name="description" content="Discover authentic Ayurvedic products for holistic wellness. Shop natural supplements, herbal remedies, and wellness solutions." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Feature Highlights Bar */}
      <FeatureHighlights features={featureHighlights} background="green" />

      {/* Hero Banner Carousel */}
      {categoriesLoading ? (
        <div className="h-96 bg-gray-100 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : categoriesError ? (
        <div className="h-96 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading categories</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      ) : categories.length > 0 ? (
        <BannerCarousel 
          banners={categories
            .filter((category: any) => 
              category.name.toLowerCase().includes('diabetic') || 
              category.name.toLowerCase().includes('cosmetic') ||
              category.name.toLowerCase().includes('premium')
            )
            .slice(0, 2)
            .map((category: any, index: number) => {
              // Map different background images based on category content
              const getBackgroundImage = (categoryName: string, index: number) => {
                const categoryLower = categoryName.toLowerCase();
                
                // Map specific categories to specific images
                if (categoryLower.includes('diabetic') || categoryLower.includes('care')) {
                  return '/assets/banner2.jpg';
                }
                if (categoryLower.includes('cosmetic') || categoryLower.includes('beauty')) {
                  return '/assets/banner1.webp';
                }
                if (categoryLower.includes('herb') || categoryLower.includes('natural')) {
                  return '/assets/banner-herbs.jpg';
                }
                if (categoryLower.includes('oil') || categoryLower.includes('massage')) {
                  return '/assets/banner-oils.jpg';
                }
                if (categoryLower.includes('supplement') || categoryLower.includes('vitamin')) {
                  return '/assets/banner-supplements.jpg';
                }
                
                // Fallback to numbered images based on index
                return `/assets/banner${index + 1}.jpg`;
              };

              // Get specific subtitle based on category type
              const getSubtitle = (categoryName: string) => {
                const categoryLower = categoryName.toLowerCase();
                
                if (categoryLower.includes('diabetic') || categoryLower.includes('diabetes')) {
                  return 'Collective benefits of powerful herbs and minerals to cure the Diabetes';
                }
                if (categoryLower.includes('cosmetic') || categoryLower.includes('beauty')) {
                  return 'Natural beauty solutions with authentic Ayurvedic ingredients';
                }
                if (categoryLower.includes('premium') || categoryLower.includes('luxury')) {
                  return 'Premium Ayurvedic formulations for enhanced wellness';
                }
                if (categoryLower.includes('herb') || categoryLower.includes('natural')) {
                  return 'Pure herbs and natural ingredients for holistic health';
                }
                if (categoryLower.includes('oil') || categoryLower.includes('massage')) {
                  return 'Therapeutic oils for massage and wellness treatments';
                }
                if (categoryLower.includes('supplement') || categoryLower.includes('vitamin')) {
                  return 'Essential supplements for daily health and vitality';
                }
                if (categoryLower.includes('medicine') || categoryLower.includes('remedy')) {
                  return 'Traditional Ayurvedic medicines for modern wellness';
                }
                
                // Default subtitle
              };

              return {
            id: category.id,
            title: category.name,
                subtitle: getSubtitle(category.name),
                image: getBackgroundImage(category.name, index),
            buttonText: "Shop Now",
                buttonLink: `/products/category/${category.id}`,
            backgroundColor: "#009947"
              };
            })}
          autoPlay={true}
          interval={5000}
          showArrows={true}
          showDots={true}
          height="h-[500px]"
        />
            ) : (
        <div className="h-96 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Welcome to AKSHAR AYURVED</h2>
            <p className="text-xl text-green-700 mb-6">Discover authentic Ayurvedic wellness products</p>
            <Link href="/products">
              <Button variant="primary" size="lg">
                Explore Products
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Popular Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">POPULAR CATEGORIES</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-stretch">
            {categoriesLoading ? (
              <div className="col-span-5 flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : categoriesError ? (
              <div className="col-span-5 text-center py-8 text-red-600">
                Error loading categories: {categoriesError}
              </div>
            ) : (
              displayCategories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/products/category/${category.id}`}
                  className="group text-center h-full flex flex-col"
                >
                  <div className="bg-white rounded-lg shadow-md p-4 mb-3 hover:shadow-lg transition-shadow flex-1 flex flex-col">
                    <div className="aspect-square w-full mb-3 overflow-hidden rounded-lg">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to dummy image if product image fails to load
                          e.currentTarget.src = `https://dummyimage.com/300x300/4ade80/ffffff?text=${encodeURIComponent(category.name)}`;
                        }}
                    />
                  </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors text-sm md:text-base line-clamp-2 mb-1">
                    {category.name}
                  </h3>
                      <p className="text-sm text-gray-500">
                        {typeof category.count === 'number' ? `${category.count} products` : 'Loading...'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Shop by Collection */}
      {/* <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">SHOP BY COLLECTION</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-stretch">
            {collectionsLoading ? (
              <div className="col-span-4 flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              collections.map((collection: Collection) => (
                <Link
                  key={collection.id}
                  href={`/products/collection/${collection.id}`}
                  className="group text-center h-full flex flex-col"
                >
                  <div className="bg-white rounded-lg shadow-md p-4 mb-3 hover:shadow-lg transition-shadow flex-1 flex flex-col">
                    <div className="aspect-square w-full mb-3 overflow-hidden rounded-lg">
                      <Image
                        src={collection.image}
                        alt={collection.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors text-sm md:text-base line-clamp-2 mb-1">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{collection.description}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section> */}

      {/* New Arrivals */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">NEW ARRIVALS</h2>
            <Link href="/products">
              <Button variant="outline" size="lg" className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white">
                View All Products
              </Button>
            </Link>
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
            <ProductCarousel
              products={newArrivals.map(product => {
                return {
                  id: product.id,
                  name: product.title,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  image: product.thumbnail || product.images?.[0] || `https://dummyimage.com/300x300/4ade80/ffffff?text=${encodeURIComponent(product.title)}`,
                  category: product.category?.name || 'General',
                  rating: product.variants?.[0]?.rating || 0,
                  reviewCount: product.variants?.[0]?.review_count || 0,
                  inStock: product.variants?.[0]?.in_stock !== false
                };
              })}
              autoPlay={true}
              interval={4000}
              showArrows={true}
              showDots={true}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          )}
        </div>
      </section>

      {/* Weight Gainer Promotional Banner */}
      {/* <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">START Weight Gainer</h3>
                <p className="text-gray-600 mb-4">₹ 799.00 - ₹ 999.00</p>
                <Link href="/products/1">
                  <Button variant="primary" size="lg">
                    Shop Now
                  </Button>
                </Link>
              </div>
              <div className="flex justify-center">
                <div className="grid grid-cols-2 gap-4">
                  {homepageData.products.weightGainer.map((product: Product) => (
                    <Link key={product.id} href={`/products/${product.id}`} className="text-center group">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={96}
                        height={96}
                        className="object-cover rounded-lg mx-auto mb-2 group-hover:scale-105 transition-transform"
                      />
                      <p className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">{product.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Digestive Health Promotional Banner */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Powerful Ayurvedic Formula to improve digestive health and bowel movements
                </h3>
                <Link href="/products/2">
                  <Button variant="primary" size="lg">
                    Shop Now
                  </Button>
                </Link>
              </div>
              <div className="flex justify-center">
                <Image
                  src="https://dummyimage.com/192x192/166534/ffffff?text=Digestive+Health"
                  alt="Digestive health"
                  width={192}
                  height={192}
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Healthcare Through Nature Banner */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-8">HEALTHCARE THROUGH NATURE</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xl mb-6">
                Discover the power of authentic Ayurvedic formulations <br/> for holistic wellness
              </p>
              <Link href="/products">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-800">
                  View All Products
                </Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <Image
                src="/assets/homeimage1.jpg"
                alt="Ayurvedic products"
                width={400}
                height={300}
                className="w-full max-w-md object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ayurvedic Medicines */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">AYURVEDIC MEDICINES</h2>
            <Link href="/products">
              <Button variant="outline" size="lg" className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white">
                View All Products
              </Button>
            </Link>
          </div>
          {newArrivalsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : newArrivalsError ? (
            <div className="text-center py-8 text-red-600">
              Error loading products: {newArrivalsError}
            </div>
          ) : (
            <ProductCarousel
              products={newArrivals.slice(4, 12).map(product => {
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
                  price: price,
                  originalPrice: product.originalPrice,
                  image: product.thumbnail || product.images?.[0]?.url || `https://dummyimage.com/300x300/4ade80/ffffff?text=${encodeURIComponent(product.title)}`,
                  category: product.category?.name || 'General',
                  rating: product.rating,
                  reviewCount: product.review_count,
                  inStock: product.variants?.[0]?.inventory_quantity > 0 || product.in_stock !== false
                };
              })}
              autoPlay={true}
              interval={4000}
              showArrows={true}
              showDots={true}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          )}
        </div>
      </section>

      {/* Fever, Malaria, Dengue Wellness */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">FEVER, MALARIA, DENGUE WELLNESS</h2>
            <Link href="/products">
              <Button variant="outline" size="lg" className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white">
                View All Products
              </Button>
            </Link>
          </div>
          {newArrivalsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : newArrivalsError ? (
            <div className="text-center py-8 text-red-600">
              Error loading products: {newArrivalsError}
            </div>
          ) : (
            <ProductCarousel
              products={newArrivals.slice(0, 8).map(product => {
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
                  price: price,
                  originalPrice: product.originalPrice,
                  image: product.thumbnail || product.images?.[0]?.url || `https://dummyimage.com/300x300/4ade80/ffffff?text=${encodeURIComponent(product.title)}`,
                  category: product.category?.name || 'General',
                  rating: product.rating,
                  reviewCount: product.review_count,
                  inStock: product.variants?.[0]?.inventory_quantity > 0 || product.in_stock !== false
                };
              })}
              autoPlay={true}
              interval={4000}
              showArrows={true}
              showDots={true}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          )}
        </div>
      </section>

      {/* Health & Wellness */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">HEALTH & WELLNESS</h2>
            <Link href="/products">
              <Button variant="outline" size="lg" className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white">
                View All Products
              </Button>
            </Link>
          </div>
          {newArrivalsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : newArrivalsError ? (
            <div className="text-center py-8 text-red-600">
              Error loading products: {newArrivalsError}
            </div>
          ) : (
            <ProductCarousel
              products={newArrivals.slice(0, 8).map(product => {
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
                  price: price,
                  originalPrice: product.originalPrice,
                  image: product.thumbnail || product.images?.[0]?.url || `https://dummyimage.com/300x300/4ade80/ffffff?text=${encodeURIComponent(product.title)}`,
                  category: product.category?.name || 'General',
                  rating: product.rating,
                  reviewCount: product.review_count,
                  inStock: product.variants?.[0]?.inventory_quantity > 0 || product.in_stock !== false
                };
              })}
              autoPlay={true}
              interval={4000}
              showArrows={true}
              showDots={true}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          )}
        </div>
      </section>

      {/* Piles Wellness */}
      {/* <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">PILES WELLNESS</h2>
            <Link href="/products">
              <Button variant="outline" size="lg" className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white">
                View All Products
              </Button>
            </Link>
          </div>
          <ProductCarousel
            products={homepageData.products.ayurvedicMedicines}
            autoPlay={true}
            interval={4000}
            showArrows={true}
            showDots={true}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section> */}

      {/* Blog Section */}
      <BlogSection posts={homepageData.blogPosts} />

      {/* Trust & Testimonials Section */}
      <TrustSection
        certifications={homepageData.certifications}
        testimonials={homepageData.testimonials}
        stats={homepageData.trustStats}
      />

      {/* Newsletter Signup */}
      <NewsletterSignup
        title="Subscribe to our newsletter"
        subtitle="Get the latest updates on new products and special offers"
        onSubmit={handleNewsletterSubmit}
      />

      {/* Service Features Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Safe Payments Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    <path d="M12 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-1">Safe Payments</h3>
                <p className="text-gray-600 text-sm">Multiple payment options</p>
              </div>
            </div>

            {/* Minimum Order Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-1">Minimum Order</h3>
                <p className="text-gray-600 text-sm">Shop over Rs.250/-</p>
              </div>
            </div>

            {/* Partial COD Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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
      </section>

      {/* WhatsApp Float Button */}
      <WhatsAppFloat />

      {/* Back to Top Button */}
      <BackToTop />
    </>
  );
}
