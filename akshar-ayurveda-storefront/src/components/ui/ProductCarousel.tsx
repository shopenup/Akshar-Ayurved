import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button, Badge } from './index';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  className?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  title,
  subtitle,
  autoPlay = true,
  interval = 4000,
  showArrows = true,
  showDots = true,
  onProductClick,
  onAddToCart,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4; // Number of products visible at once
  const totalSlides = Math.ceil(products.length / itemsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
    );
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay || products.length <= itemsPerView) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, products.length, itemsPerView]);

  if (!products || products.length === 0) return null;

  return (
    <div className={className}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600">{subtitle}</p>
          )}
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative">
        {/* Products Container */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {Array.from({ length: totalSlides }, (_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                  {products
                    .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => onProductClick?.(product.id)}
                      >
                        {/* Product Image */}
                        <div className="relative h-48">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                          
                          {/* Discount Badge */}
                          {product.originalPrice && product.price && product.originalPrice > product.price && (
                            <Badge 
                              variant="danger" 
                              size="sm" 
                              className="absolute top-2 left-2"
                            >
                              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                            </Badge>
                          )}
                          
                          {/* Stock Status */}
                          {product.inStock === false && (
                            <Badge 
                              variant="warning" 
                              size="sm" 
                              className="absolute top-2 right-2"
                            >
                              Out of Stock
                            </Badge>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <Badge variant="secondary" size="sm" className="mb-2">
                            {product.category}
                          </Badge>
                          
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          
                          {/* Rating */}
                          <div className="flex items-center mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < 4 ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-1">
                              (24)
                            </span>
                          </div>
                          
                          {/* Price */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-green-600">
                                ₹{(product.price || 0).toFixed(2)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{(product.originalPrice || 0).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Add to Cart Button */}
                          {onAddToCart && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e?.stopPropagation();
                                onAddToCart(product.id);
                              }}
                              disabled={product.inStock === false}
                              fullWidth
                            >
                              {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {showArrows && products.length > itemsPerView && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white shadow-lg text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-all z-10"
              aria-label="Previous products"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white shadow-lg text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-all z-10"
              aria-label="Next products"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {showDots && products.length > itemsPerView && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-green-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCarousel;
