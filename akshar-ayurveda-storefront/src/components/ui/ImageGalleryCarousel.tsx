import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface ImageGalleryCarouselProps {
  images: {
    id: string;
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }[];
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showThumbnails?: boolean;
  height?: string;
  className?: string;
  onImageClick?: (imageId: string) => void;
}

const ImageGalleryCarousel: React.FC<ImageGalleryCarouselProps> = ({
  images,
  autoPlay = false,
  interval = 4000,
  showArrows = true,
  showDots = true,
  showThumbnails = true,
  height = 'h-96',
  className = '',
  onImageClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide]);

  if (!images || images.length === 0) return null;

  return (
    <div className={className}>
      {/* Main Image Carousel */}
      <div className={`relative overflow-hidden rounded-lg ${height}`}>
        {/* Images Container */}
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image) => (
            <div
              key={image.id}
              className="w-full flex-shrink-0 relative"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover cursor-pointer"
                sizes="100vw"
                onClick={() => onImageClick?.(image.id)}
              />
              
              {/* Image Info Overlay */}
              {(image.title || image.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black bg-opacity-75 to-transparent p-4 text-white">
                  {image.title && (
                    <h3 className="text-lg font-semibold mb-1">{image.title}</h3>
                  )}
                  {image.description && (
                    <p className="text-sm opacity-90">{image.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {showArrows && images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all z-10"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all z-10"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Dots Indicator */}
        {showDots && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden transition-all ${
                  index === currentIndex 
                    ? 'ring-2 ring-green-500 ring-offset-2' 
                    : 'hover:opacity-75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Navigation Info */}
      {images.length > 1 && (
        <div className="mt-2 text-center text-sm text-gray-500">
          Use arrow keys or click to navigate
        </div>
      )}
    </div>
  );
};

export default ImageGalleryCarousel;
