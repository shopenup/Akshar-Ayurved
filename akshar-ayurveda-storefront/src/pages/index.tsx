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

export default function HomePage() {
  // Use Shopenup product hooks
  const { products: newArrivals, loading: newArrivalsLoading, error: newArrivalsError } = useNewArrivals(8);
  // Remove useCategories hook
  // const { categories: shopenupCategories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [categories, setCategories] = React.useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  const [categoriesError, setCategoriesError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getCategoriesList()
      .then(res => {
        setCategories(res.product_categories || []);
        setCategoriesLoading(false);
      })
      .catch(err => {
        setCategoriesError(err.message);
        setCategoriesLoading(false);
      });
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
      image: cat.image || `https://dummyimage.com/300x300/4ade80/ffffff?text=${encodeURIComponent(cat.name)}`,
      count: cat.product_count || 0
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
          banners={categories.slice(0, 2).map((category: any) => ({
            id: category.id,
            title: category.name,
            subtitle: `Explore ${category.name}`,
            description: category.description || `Discover our collection of ${category.name.toLowerCase()} products`,
            image: category.image || `https://dummyimage.com/1200x400/4ade80/ffffff?text=${encodeURIComponent(category.name)}`,
            buttonText: "Shop Now",
            buttonLink: `/gallery`,
            backgroundColor: "#009947"
          }))}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
                  className="group text-center"
                >
                  <div className="bg-white rounded-lg shadow-md p-4 mb-3 hover:shadow-lg transition-shadow">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={200}
                      height={96}
                      className="w-full object-cover rounded-lg mb-3"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.count} products</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Shop by Collection */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">SHOP BY COLLECTION</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {collectionsLoading ? (
              <div className="col-span-4 flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              collections.map((collection: Collection) => (
                <Link
                  key={collection.id}
                  href={`/products/collection/${collection.id}`}
                  className="group text-center"
                >
                  <div className="bg-white rounded-lg shadow-md p-4 mb-3 hover:shadow-lg transition-shadow">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      width={200}
                      height={96}
                      className="w-full object-cover rounded-lg mb-3"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-gray-500">{collection.description}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

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
      <section className="py-16 bg-green-50">
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
      </section>

      {/* Digestive Health Promotional Banner */}
      <section className="py-16 bg-white">
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
      </section>

      {/* Healthcare Through Nature Banner */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-8">HEALTHCARE THROUGH NATURE</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xl mb-6">
                Discover the power of authentic Ayurvedic formulations for holistic wellness
              </p>
              <Link href="/products">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-800">
                  View All Products
                </Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <Image
                src="https://dummyimage.com/400x300/14532d/ffffff?text=Healthcare+Through+Nature"
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
      </section>

      {/* Piles Wellness */}
      <section className="py-16 bg-gray-50">
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
      </section>

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

      {/* WhatsApp Float Button */}
      <WhatsAppFloat />

      {/* Back to Top Button */}
      <BackToTop />
    </>
  );
}
