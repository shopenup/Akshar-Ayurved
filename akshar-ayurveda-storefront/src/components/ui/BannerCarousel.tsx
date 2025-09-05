import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from './index';
import Link from 'next/link';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  height?: string;
  className?: string;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  autoPlay = true,
  interval = 6000,
  showArrows = true,
  showDots = true,
  height = 'h-96',
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to get background image based on banner index
  const getBackgroundImage = (index: number) => {
    const backgroundImages = [
      '/assets/banner1.jpg',
      '/assets/banner2.jpg',
      // '/assets/banner2.jpeg', // fallback for additional banners
    ];
    return backgroundImages[index] || backgroundImages[0];
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      banners.length === 0
        ? 0
        : prevIndex === banners.length - 1
        ? 0
        : prevIndex + 1
    );
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      banners.length === 0
        ? 0
        : prevIndex === 0
        ? banners.length - 1
        : prevIndex - 1
    );
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, banners.length]);

  // Reset currentIndex if banners array changes and currentIndex is out of bounds
  useEffect(() => {
    if (currentIndex > banners.length - 1) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className={`relative overflow-hidden  ${className}`}>
      {/* Banners Container */}
      <div
        className={`flex transition-transform duration-700 ease-in-out ${height}`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="w-full flex-shrink-0 relative"
            style={{ backgroundColor: banner.backgroundColor }}
          >
            {/* Background Image */}
            <div className="absolute inset-0 h-full w-full bg-green-50">
              <Image
                src={banner.image || '/assets/banner-bg.jpg'}
                alt="Banner Background"
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  height: '100%',
                  width: '100%'
                }}
                onError={(e) => {
                  console.error('Banner image failed to load:', e);
                  // Fallback to solid color if image fails
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const overlay = target.nextElementSibling as HTMLElement;
                  if (overlay) {
                    overlay.style.backgroundColor = '#009947';
                  }
                }}
              />
              {/* Removed overlay to show clean background image */}
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center h-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="text-left max-w-2xl">
                  <h2
                    className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
                    style={{ color: banner.textColor || '#1a5f3a' }}
                  >
                    {banner.title}
                  </h2>

                  {banner.subtitle && (
                    <h3
                      className="text-xl md:text-2xl font-semibold mb-4"
                      style={{ color: banner.textColor || '#1a5f3a' }}
                    >
                      {banner.subtitle}
                    </h3>
                  )}

                  {banner.description && (
                    <p
                      className="text-lg md:text-xl mb-8"
                      style={{ color: banner.textColor || '#1a5f3a' }}
                    >
                      {banner.description}
                    </p>
                  )}

                  {banner.buttonText && banner.buttonLink && (
                    <a href={banner.buttonLink}>
                      <Button
                        variant="custom"
                        size="lg"
                        className="bg-green-800 text-white hover:bg-green-700 border border-green-800 focus:ring-green-800 focus:ring-offset-2"
                      >
                        {banner.buttonText}
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 text-white p-3 rounded-full hover:bg-opacity-50 transition-all duration-200 z-20 backdrop-blur-sm shadow-lg hover:scale-110"
            aria-label="Previous banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 text-white p-3 rounded-full hover:bg-opacity-50 transition-all duration-200 z-20 backdrop-blur-sm shadow-lg hover:scale-110"
            aria-label="Next banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                idx === currentIndex
                  ? 'bg-white shadow-lg'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75 hover:scale-110'
              }`}
              aria-label={`Go to banner ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {autoPlay && banners.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-20 z-20">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: `${((currentIndex + 1) / banners.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
