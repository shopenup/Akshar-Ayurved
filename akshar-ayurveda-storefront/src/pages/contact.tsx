import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/layout/Hero';
import Section from '../components/layout/Section';
import ContactForm from '../components/forms/ContactForm';
import Card from '../components/ui/Card';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: { name: string; email: string; subject: string; message: string }) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Contact form submitted:', formData);
    setIsSubmitting(false);
    // Here you would typically send the data to your backend
  };

  return (
    <>
      <Head>
        <title>Contact Us - AKSHAR AYURVED</title>
        <meta name="description" content="Get in touch with AKSHAR AYURVED for any questions or support." />
      </Head>

      <div className="bg-gradient-to-br from-green-50 to-yellow-50 min-h-screen">
        <Hero
          title="Contact Us"
          subtitle="Get in touch with our team for any questions or support"
          backgroundGradient="bg-green-600"
        />

        <Section>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-lg text-gray-600 mb-8">
                We&apos;re here to help! Whether you have questions about our products, 
                need wellness advice, or want to share feedback, we&apos;d love to hear from you.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600">
                      D 14 15 INDUSTRIAL AREA,UPSIDC<br />
                      FIROZABAD-283203 UP INDIA
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">
                      <a href="tel:+919412721980" className="hover:text-green-600 transition-colors">
                        +919412721980
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">
                      <a href="mailto:aksharayurved@rediffmail.com" className="hover:text-green-600 transition-colors">
                        aksharayurved@rediffmail.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 7:00 PM<br />
                      Saturday: 9:00 AM - 5:00 PM<br />
                      Sunday: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <ContactForm
                onSubmit={handleSubmit}
                loading={isSubmitting}
              />
            </div>
          </div>
        </Section>

        {/* FAQ Section */}
        <Section background="gray" title="Frequently Asked Questions">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How do I know which products are right for me?
              </h3>
              <p className="text-gray-600">
                We recommend taking our dosha assessment to get personalized product recommendations 
                based on your unique constitution and health goals.
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Are your products authentic and safe?
              </h3>
              <p className="text-gray-600">
                Yes, all our products are sourced from certified manufacturers and undergo 
                rigorous quality testing to ensure authenticity and safety.
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What is your return policy?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day return policy for unopened products. Please contact our 
                customer service team for return instructions.
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you ship internationally?
              </h3>
              <p className="text-gray-600">
                Currently, we ship within India. We&apos;re working on expanding our shipping 
                to international destinations soon.
              </p>
            </Card>
          </div>
        </Section>
      </div>
    </>
  );
}
