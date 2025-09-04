import React from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import {
  BannerCarousel,
  ProductCarousel,
  TestimonialCarousel,
  NewsletterSignup,
  TrustSection,
  BlogSection,
  FeatureHighlights,
  WhatsAppFloat,
  Tabs,
  Accordion,
  Breadcrumb,
  Progress,
  Skeleton
} from '../components/ui';

export default function TestComponents() {
  // Sample data
  const bannerData = [
    {
      id: '1',
      title: 'Test Banner',
      subtitle: 'Test Subtitle',
      description: 'Test description',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=400&fit=crop',
      buttonText: 'Test Button',
      buttonLink: '/test'
    }
  ];

  const productData = [
    {
      id: '1',
      name: 'Test Product',
      price: 299,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
      category: 'Test',
      rating: 4.5,
      reviewCount: 10,
      inStock: true
    }
  ];

  const testimonialData = [
    {
      id: '1',
      name: 'Test User',
      role: 'Test Role',
      company: 'Test Company',
      content: 'Test testimonial content',
      rating: 5
    }
  ];

  const blogData = [
    {
      id: '1',
      title: 'Test Blog Post',
      excerpt: 'Test blog excerpt',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=250&fit=crop',
      author: 'Test Author',
      date: 'Dec 15, 2024',
      readTime: '5 min read',
      category: 'Test'
    }
  ];

  const featureData = [
    {
      id: '1',
      icon: <span>🌿</span>,
      text: 'Test Feature'
    }
  ];

  const tabsData = [
    {
      id: 'tab1',
      label: 'Tab 1',
      content: <div>Tab 1 content</div>
    },
    {
      id: 'tab2',
      label: 'Tab 2',
      content: <div>Tab 2 content</div>
    }
  ];

  const accordionData = [
    {
      id: 'acc1',
      title: 'Accordion 1',
      content: <div>Accordion 1 content</div>
    },
    {
      id: 'acc2',
      title: 'Accordion 2',
      content: <div>Accordion 2 content</div>
    }
  ];

  const breadcrumbData = [
    { label: 'Home', href: '/' },
    { label: 'Test', href: '/test' },
    { label: 'Current' }
  ];

  return (
    <Layout cartItemCount={0} favouriteCount={0} isLoggedIn={false}>
      <Head>
        <title>Component Test Page</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <h1 className="text-3xl font-bold text-center">Component Test Page</h1>

        {/* Feature Highlights */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Feature Highlights</h2>
          <FeatureHighlights features={featureData} background="green" />
        </section>

        {/* Banner Carousel */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Banner Carousel</h2>
          <BannerCarousel banners={bannerData} height="h-64" />
        </section>

        {/* Product Carousel */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Product Carousel</h2>
          <ProductCarousel products={productData} />
        </section>

        {/* Testimonial Carousel */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Testimonial Carousel</h2>
          <TestimonialCarousel testimonials={testimonialData} />
        </section>

        {/* Tabs */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Tabs</h2>
          <Tabs tabs={tabsData} />
        </section>

        {/* Accordion */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Accordion</h2>
          <Accordion items={accordionData} />
        </section>

        {/* Breadcrumb */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Breadcrumb</h2>
          <Breadcrumb items={breadcrumbData} />
        </section>

        {/* Progress */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Progress</h2>
          <Progress value={75} showLabel />
        </section>

        {/* Skeleton */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Skeleton</h2>
          <Skeleton variant="text" width="100%" height="20px" />
        </section>

        {/* Blog Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Blog Section</h2>
          <BlogSection posts={blogData} />
        </section>

        {/* Trust Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Trust Section</h2>
          <TrustSection
            stats={{
              customers: '15K+',
              products: '500+',
              years: '25+'
            }}
          />
        </section>

        {/* Newsletter Signup */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Newsletter Signup</h2>
          <NewsletterSignup />
        </section>

        {/* WhatsApp Float */}
        <WhatsAppFloat />
      </div>
    </Layout>
  );
}
