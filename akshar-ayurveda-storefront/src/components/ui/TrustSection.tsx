import React from 'react';
import Image from 'next/image';

interface Certification {
  id: string;
  name: string;
  image: string;
  alt: string;
}

interface Testimonial {
  id: string;
  name: string;
  content: string;
  avatar?: string;
  rating: number;
}

interface TrustSectionProps {
  certifications?: Certification[];
  testimonials?: Testimonial[];
  stats?: {
    customers?: string;
    products?: string;
    years?: string;
  };
  className?: string;
}

const TrustSection: React.FC<TrustSectionProps> = ({
  certifications = [],
  testimonials = [],
  stats,
  className = '',
}) => {
  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Certifications */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Certifications & Awards</h3>
            <div className="grid grid-cols-2 gap-6">
              {certifications.map((cert) => (
                <div key={cert.id} className="text-center">
                  <div className="bg-gray-100 rounded-lg p-6 mb-3">
                    <Image
                      src={cert.image}
                      alt={cert.alt}
                      width={64}
                      height={64}
                      className="mx-auto object-contain"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Customer Testimonials</h3>
            <div className="space-y-6">
              {testimonials.slice(0, 3).map((testimonial) => (
                <div key={testimonial.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    {testimonial.avatar && (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="rounded-full mr-4 object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <blockquote className="text-gray-600 italic">
                    &quot;{testimonial.content}&quot;
                  </blockquote>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Our Numbers</h3>
            <div className="space-y-6">
              {stats?.customers && (
                <div className="text-center bg-green-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.customers}
                  </div>
                  <p className="text-gray-600">Happy Customers</p>
                </div>
              )}
              
              {stats?.products && (
                <div className="text-center bg-blue-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats.products}
                  </div>
                  <p className="text-gray-600">Products</p>
                </div>
              )}
              
              {stats?.years && (
                <div className="text-center bg-yellow-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {stats.years}
                  </div>
                  <p className="text-gray-600">Years of Experience</p>
                </div>
              )}
            </div>
            
            {/* Natural Ingredients Image */}
            <div className="mt-8 text-center">
              <div className="bg-gray-100 rounded-lg p-6">
                <Image
                  src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop"
                  alt="Natural ingredients"
                  width={96}
                  height={96}
                  className="mx-auto object-cover rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-3">100% Natural Ingredients</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
