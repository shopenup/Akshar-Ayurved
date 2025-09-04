import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Product360ViewProps {
  images: string[];
  productName: string;
  className?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

const Product360View: React.FC<Product360ViewProps> = ({
  images,
  productName,
  className = '',
  autoRotate = false,
  autoRotateSpeed = 2000
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouseX = useRef(0);
  const autoRotateRef = useRef<NodeJS.Timeout>();

  const totalImages = images.length;
  const sensitivity = 3; // How many pixels to drag to move to next image

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    setLoadedImages(prev => {
      const newCount = prev + 1;
      if (newCount === totalImages) {
        setIsLoading(false);
      }
      return newCount;
    });
  }, [totalImages]);

  // Auto rotation effect
  useEffect(() => {
    if (isAutoRotating && !isDragging && !isLoading) {
      autoRotateRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % totalImages);
      }, autoRotateSpeed);
    } else if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [isAutoRotating, isDragging, isLoading, totalImages, autoRotateSpeed]);

  // Mouse/Touch handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    lastMouseX.current = e.clientX;
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMouseX.current;
    const steps = Math.floor(Math.abs(deltaX) / sensitivity);

    if (steps > 0) {
      if (deltaX > 0) {
        // Dragging right - move forward
        setCurrentImageIndex(prev => (prev + steps) % totalImages);
      } else {
        // Dragging left - move backward
        setCurrentImageIndex(prev => (prev - steps + totalImages) % totalImages);
      }
      lastMouseX.current = e.clientX;
    }
  }, [isDragging, totalImages]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    lastMouseX.current = e.touches[0].clientX;
    e.preventDefault();
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;

    const deltaX = e.touches[0].clientX - lastMouseX.current;
    const steps = Math.floor(Math.abs(deltaX) / sensitivity);

    if (steps > 0) {
      if (deltaX > 0) {
        setCurrentImageIndex(prev => (prev + steps) % totalImages);
      } else {
        setCurrentImageIndex(prev => (prev - steps + totalImages) % totalImages);
      }
      lastMouseX.current = e.touches[0].clientX;
    }
    e.preventDefault();
  }, [isDragging, totalImages]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e);
    const handleGlobalTouchEnd = () => handleTouchEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Manual controls
  const rotateLeft = () => {
    setIsAutoRotating(false);
    setCurrentImageIndex(prev => (prev - 1 + totalImages) % totalImages);
  };

  const rotateRight = () => {
    setIsAutoRotating(false);
    setCurrentImageIndex(prev => (prev + 1) % totalImages);
  };

  const toggleAutoRotate = () => {
    setIsAutoRotating(prev => !prev);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-500">No 360° images available</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading 360° view...</p>
            <p className="text-sm text-gray-500">{loadedImages}/{totalImages} images loaded</p>
          </div>
        </div>
      )}

      {/* 360° View Container */}
      <div
        ref={containerRef}
        className={`relative w-full h-full select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* All Images (hidden except current) */}
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-200 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image}
              alt={`${productName} - View ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              onLoad={handleImageLoad}
              priority={index < 3} // Prioritize first 3 images
            />
          </div>
        ))}

        {/* 360° Badge */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>360°</span>
        </div>

        {/* Progress Indicator */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
          {currentImageIndex + 1}/{totalImages}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black bg-opacity-70 rounded-full px-4 py-2">
        {/* Rotate Left */}
        <button
          onClick={rotateLeft}
          className="text-white hover:text-green-400 transition-colors p-1"
          title="Rotate Left"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
        </button>

        {/* Auto Rotate Toggle */}
        <button
          onClick={toggleAutoRotate}
          className={`transition-colors p-1 ${
            isAutoRotating ? 'text-green-400' : 'text-white hover:text-green-400'
          }`}
          title={isAutoRotating ? 'Stop Auto Rotation' : 'Start Auto Rotation'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16v-2a2 2 0 012-2h2a2 2 0 012 2v2M12 8V6a2 2 0 00-2-2H8a2 2 0 00-2 2v2h6z" />
          </svg>
        </button>

        {/* Rotate Right */}
        <button
          onClick={rotateRight}
          className="text-white hover:text-green-400 transition-colors p-1"
          title="Rotate Right"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Instructions */}
      {!isDragging && !isLoading && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-xs">
          Drag to rotate
        </div>
      )}
    </div>
  );
};

export default Product360View;
