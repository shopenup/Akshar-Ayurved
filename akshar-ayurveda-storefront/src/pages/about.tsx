import React from 'react';
import Head from 'next/head';
import Image from 'next/image';


export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us - AKSHAR AYURVED</title>
        <meta name="description" content="Learn about AKSHAR AYURVED's mission to provide authentic Ayurvedic medicines and wellness products." />
      </Head>

      <div className="bg-gradient-to-br from-green-50 to-yellow-50 min-h-screen">
        {/* Hero Section */}
        <section className="py-20 bg-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                About AKSHAR AYURVED
              </h1>
              <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
                Bridging ancient wisdom with modern wellness for a healthier tomorrow
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  At AKSHAR AYURVED, we are committed to making authentic Ayurvedic medicines 
                  and wellness products accessible to everyone. Our mission is to preserve the 
                  ancient wisdom of Ayurveda while adapting it to modern lifestyles.
                </p>
                <p className="text-lg text-gray-600">
                  We believe in the power of natural healing and strive to provide products that 
                  not only treat symptoms but address the root cause of health issues, promoting 
                  overall wellness and balance.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-green-600 mb-4">Our Vision</h3>
                <p className="text-gray-600 mb-4">
                  To become the most trusted platform for Ayurvedic wellness, empowering 
                  individuals to take control of their health through natural, time-tested solutions.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">Authentic Ayurvedic Products</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">Expert Consultation</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">Personalized Wellness Plans</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Authenticity</h3>
                <p className="text-gray-600">
                  We source only the purest and most authentic Ayurvedic ingredients, 
                  ensuring every product meets the highest standards of quality and efficacy.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💚</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Wellness First</h3>
                <p className="text-gray-600">
                  Your health and wellness are our top priority. We provide personalized 
                  recommendations and expert guidance to support your wellness journey.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Trust & Transparency</h3>
                <p className="text-gray-600">
                  We believe in complete transparency about our products, ingredients, 
                  and processes, building lasting trust with our community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Meet Our Expert Team
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-6xl">👨‍⚕️</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dr. Rajesh Kumar</h3>
                  <p className="text-green-600 font-medium mb-3">Chief Ayurvedic Physician</p>
                  <p className="text-gray-600 text-sm">
                    With over 20 years of experience in Ayurvedic medicine, Dr. Kumar leads 
                    our medical team and ensures all products meet traditional standards.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <span className="text-6xl">👩‍🔬</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dr. Priya Sharma</h3>
                  <p className="text-green-600 font-medium mb-3">Research & Development</p>
                  <p className="text-gray-600 text-sm">
                    Dr. Sharma specializes in modernizing traditional Ayurvedic formulations 
                    while maintaining their therapeutic efficacy and safety standards.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-6xl">👨‍💼</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Amit Patel</h3>
                  <p className="text-green-600 font-medium mb-3">Customer Wellness Advisor</p>
                  <p className="text-gray-600 text-sm">
                    Amit helps customers find the right products and provides personalized 
                    wellness guidance based on individual health needs and dosha profiles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  ShopenUp Ayurveda was born from a deep passion for natural healing and 
                  a desire to make authentic Ayurvedic medicines accessible to everyone. 
                  Our founder, having experienced the transformative power of Ayurveda 
                  firsthand, envisioned a platform that would bridge the gap between 
                  traditional wisdom and modern convenience.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  What started as a small family business has grown into a trusted 
                  destination for Ayurvedic wellness, serving thousands of customers 
                  across India. We remain committed to our roots while embracing 
                  innovation to better serve our community.
                </p>
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-semibold text-green-600 mb-3">Our Commitment</h3>
                  <p className="text-gray-600">
                    Every product we offer is carefully selected and tested to ensure 
                    it meets our high standards for quality, safety, and effectiveness. 
                    We work directly with certified Ayurvedic practitioners and 
                    traditional manufacturers to bring you the best of Ayurveda.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-green-600 mb-6">Why Choose Us?</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Authentic Products</h4>
                      <p className="text-gray-600 text-sm">Sourced from traditional manufacturers</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Expert Guidance</h4>
                      <p className="text-gray-600 text-sm">Certified Ayurvedic practitioners</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Quality Assurance</h4>
                      <p className="text-gray-600 text-sm">Rigorous testing and certification</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Personalized Care</h4>
                      <p className="text-gray-600 text-sm">Tailored to your dosha profile</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Certifications & Quality Standards
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We maintain the highest standards of quality and authenticity through various certifications and rigorous testing processes.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  id: '1',
                  name: 'GMP Certified',
                  image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=128&h=128&fit=crop',
                  alt: 'GMP Certified',
                  description: 'Good Manufacturing Practice'
                },
                {
                  id: '2',
                  name: 'ISO Certified',
                  image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=128&h=128&fit=crop',
                  alt: 'ISO Certified',
                  description: 'International Standards Organization'
                },
                {
                  id: '3',
                  name: 'Organic Certified',
                  image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=128&h=128&fit=crop',
                  alt: 'Organic Certified',
                  description: '100% Organic Ingredients'
                },
                {
                  id: '4',
                  name: 'Ayurvedic Certified',
                  image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=128&h=128&fit=crop',
                  alt: 'Ayurvedic Certified',
                  description: 'Traditional Ayurvedic Standards'
                }
              ].map((cert) => (
                <div key={cert.id} className="text-center">
                  <div className="bg-white rounded-lg p-8 shadow-lg mb-4">
                    <Image
                      src={cert.image}
                      alt={cert.alt}
                      width={80}
                      height={80}
                      className="mx-auto object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Your Wellness Journey Today
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of customers who have transformed their health with our 
              authentic Ayurvedic products and expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Explore Products
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
                Contact Us
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
