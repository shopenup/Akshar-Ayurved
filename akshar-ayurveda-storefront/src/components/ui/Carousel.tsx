import React, { useState, useEffect, useCallback } from 'react';

interface CarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
  height?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  autoPlay = true,
  interval = 5000,
  showArrows = true,
  showDots = true,
  className = '',
  height = 'h-64',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === children.length - 1 ? 0 : prevIndex + 1
    );
  }, [children.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? children.length - 1 : prevIndex - 1
    );
  }, [children.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide]);

  if (!children || children.length === 0) return null;

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Slides Container */}
      <div 
        className={`flex transition-transform duration-500 ease-in-out ${height}`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0"
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && children.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-all duration-200 z-20 shadow-lg hover:scale-110"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-all duration-200 z-20 shadow-lg hover:scale-110"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && children.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {children.map((_, index) => (
            <button
              type="button"
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75 hover:scale-110'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
