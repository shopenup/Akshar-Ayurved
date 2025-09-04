import React from 'react';
import Head from 'next/head';
import { Layout, Section } from '../components';
import {
  Carousel,
  ProductCarousel,
  TestimonialCarousel,
  BannerCarousel,
  ImageGalleryCarousel
} from '../components/ui';

export default function CarouselDemo() {
  // Sample data for different carousels
  const bannerData = [
    {
      id: '2',
      title: 'New Arrivals',
      subtitle: 'Fresh from Nature',
      description: 'Explore our latest collection of organic wellness products',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop',
      buttonText: 'Explore',
      buttonLink: '/products'
    }
  ];

  const productData = [
    {
      id: '1',
      name: 'Organic Ashwagandha Powder',
      price: 299,
      originalPrice: 399,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
      category: 'Herbs',
      rating: 4.5,
      reviewCount: 128,
      inStock: true
    },
    {
      id: '2',
      name: 'Turmeric Golden Milk',
      price: 199,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      category: 'Beverages',
      rating: 4.8,
      reviewCount: 89,
      inStock: true
    },
    {
      id: '3',
      name: 'Neem Face Wash',
      price: 149,
      originalPrice: 199,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
      category: 'Skincare',
      rating: 4.2,
      reviewCount: 67,
      inStock: true
    },
    {
      id: '4',
      name: 'Sandalwood Oil',
      price: 399,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
      category: 'Essential Oils',
      rating: 4.7,
      reviewCount: 156,
      inStock: false
    },
    {
      id: '5',
      name: 'Triphala Churna',
      price: 179,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      category: 'Herbs',
      rating: 4.4,
      reviewCount: 93,
      inStock: true
    },
    {
      id: '6',
      name: 'Aloe Vera Gel',
      price: 129,
      originalPrice: 159,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
      category: 'Skincare',
      rating: 4.6,
      reviewCount: 234,
      inStock: true
    },
    {
      id: '7',
      name: 'Ginger Tea Bags',
      price: 89,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
      category: 'Beverages',
      rating: 4.3,
      reviewCount: 78,
      inStock: true
    },
    {
      id: '8',
      name: 'Brahmi Capsules',
      price: 249,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      category: 'Supplements',
      rating: 4.5,
      reviewCount: 112,
      inStock: true
    }
  ];

  const testimonialData = [
    {
      id: '1',
      name: 'Priya Sharma',
      role: 'Yoga Instructor',
      company: 'Wellness Studio',
      content: 'The Ashwagandha powder has been a game-changer for my stress management. I feel more balanced and energized throughout the day.',
      rating: 5,
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      role: 'Fitness Trainer',
      company: 'Health Club',
      content: 'I\'ve been using their turmeric products for months now. The quality is exceptional and I can feel the difference in my overall health.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Anjali Patel',
      role: 'Nutritionist',
      company: 'Holistic Health',
      content: 'As a nutritionist, I recommend their products to my clients. The organic certification and traditional preparation methods are impressive.',
      rating: 4,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];

  const galleryData = [
    {
      id: '1',
      src: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop',
      alt: 'Ayurvedic herbs and spices',
      title: 'Traditional Herbs',
      description: 'Collection of authentic Ayurvedic herbs'
    },
    {
      id: '2',
      src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      alt: 'Organic products display',
      title: 'Organic Collection',
      description: 'Pure and natural wellness products'
    },
    {
      id: '3',
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      alt: 'Wellness lifestyle',
      title: 'Wellness Journey',
      description: 'Your path to holistic health'
    },
    {
      id: '4',
      src: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop',
      alt: 'Skincare products',
      title: 'Natural Skincare',
      description: 'Gentle and effective natural care'
    }
  ];

  const handleProductClick = (productId: string) => {
    console.log('Product clicked:', productId);
  };

  const handleAddToCart = (productId: string) => {
    console.log('Add to cart:', productId);
  };

  const handleImageClick = (imageId: string) => {
    console.log('Image clicked:', imageId);
  };

  return (
    <Layout cartItemCount={3} favouriteCount={5} isLoggedIn={false}>
      <Head>
        <title>Carousel Components Demo - AKSHAR AYURVED</title>
        <meta name="description" content="Explore our collection of carousel components for e-commerce" />
      </Head>

      {/* Hero Section */}
      <Section background="white" padding="lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Carousel Components Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our collection of 5 different carousel components designed specifically for e-commerce applications.
            Each carousel is fully responsive, customizable, and optimized for performance.
          </p>
        </div>
      </Section>

      {/* Banner Carousel */}
      <Section background="gray" padding="lg">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Banner Carousel</h2>
          <p className="text-gray-600 mb-6">
            Perfect for promotional banners, announcements, and hero sections. Features auto-play, navigation arrows, dots, and progress bar.
          </p>
        </div>
        <BannerCarousel 
          banners={bannerData}
          autoPlay={true}
          interval={5000}
          showArrows={true}
          showDots={true}
          height="h-96"
        />
      </Section>

      {/* Product Carousel */}
      <Section background="white" padding="lg">
        <ProductCarousel
          products={productData}
          title="Featured Products"
          subtitle="Discover our best-selling Ayurvedic products"
          autoPlay={true}
          interval={4000}
          showArrows={true}
          showDots={true}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />
      </Section>

      {/* Testimonial Carousel */}
      <Section background="green" padding="lg">
        <TestimonialCarousel
          testimonials={testimonialData}
          title="Customer Testimonials"
          subtitle="What our customers say about our products"
          autoPlay={true}
          interval={6000}
          showArrows={true}
          showDots={true}
        />
      </Section>

      {/* Image Gallery Carousel */}
      <Section background="white" padding="lg">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Image Gallery Carousel</h2>
          <p className="text-gray-600 mb-6">
            Ideal for product galleries, portfolio showcases, and image collections. Features thumbnails, image counter, and smooth transitions.
          </p>
        </div>
        <ImageGalleryCarousel
          images={galleryData}
          autoPlay={false}
          showArrows={true}
          showDots={true}
          showThumbnails={true}
          height="h-96"
          onImageClick={handleImageClick}
        />
      </Section>

      {/* Basic Carousel */}
      <Section background="gray" padding="lg">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Basic Carousel</h2>
          <p className="text-gray-600 mb-6">
            A simple, flexible carousel for any content. Perfect for custom implementations and simple slideshows.
          </p>
        </div>
        <Carousel
          autoPlay={true}
          interval={3000}
          showArrows={true}
          showDots={true}
          height="h-64"
        >
          <div className="bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            Slide 1
          </div>
          <div className="bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
            Slide 2
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
            Slide 3
          </div>
        </Carousel>
      </Section>

      {/* Features Section */}
      <Section background="white" padding="lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Carousel Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fully Responsive</h3>
              <p className="text-gray-600">All carousels adapt perfectly to mobile, tablet, and desktop screens</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Highly Customizable</h3>
              <p className="text-gray-600">Extensive props for styling, behavior, and functionality customization</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessibility Ready</h3>
              <p className="text-gray-600">Built with ARIA labels, keyboard navigation, and screen reader support</p>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
