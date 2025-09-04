import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
  title,
  subtitle,
  autoPlay = true,
  interval = 5000,
  showArrows = true,
  showDots = true,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      testimonials.length === 0
        ? 0
        : prevIndex === testimonials.length - 1
        ? 0
        : prevIndex + 1
    );
  }, [testimonials.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      testimonials.length === 0
        ? 0
        : prevIndex === 0
        ? testimonials.length - 1
        : prevIndex - 1
    );
  }, [testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay || testimonials.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, testimonials.length]);

  // Reset currentIndex if testimonials array changes and currentIndex is out of bounds
  useEffect(() => {
    if (currentIndex > testimonials.length - 1) {
      setCurrentIndex(0);
    }
  }, [testimonials.length, currentIndex]);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div className={className}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600">{subtitle}</p>
          )}
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative max-w-4xl mx-auto">
        {/* Testimonials Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="w-full flex-shrink-0 px-4"
              >
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  {/* Quote Icon */}
                  <div className="mb-6">
                    <svg className="w-12 h-12 text-green-200 mx-auto" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                  </div>

                  {/* Rating */}
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-lg text-gray-700 mb-8 leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center justify-center">
                    {testimonial.avatar && (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="rounded-full mr-4 object-cover"
                      />
                    )}
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      {(testimonial.role || testimonial.company) && (
                        <div className="text-sm text-gray-600">
                          {testimonial.role}
                          {testimonial.role && testimonial.company && ' at '}
                          {testimonial.company}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {showArrows && testimonials.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg text-gray-600 p-3 rounded-full hover:bg-gray-50 transition-all z-10"
              aria-label="Previous testimonial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg text-gray-600 p-3 rounded-full hover:bg-gray-50 transition-all z-10"
              aria-label="Next testimonial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {showDots && testimonials.length > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'bg-green-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
