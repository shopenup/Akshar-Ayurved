import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface ProductImageZoomProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  zoomLevel?: number;
  className?: string;
  containerClassName?: string;
  showZoomedView?: boolean;
  enableMobileZoom?: boolean;
}

const ProductImageZoom: React.FC<ProductImageZoomProps> = ({
  src,
  alt,
  width = 600,
  height = 400,
  zoomLevel = 2.5,
  className = '',
  containerClassName = '',
  showZoomedView = true,
  enableMobileZoom = true
}) => {
  const [isZooming, setIsZooming] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsZooming(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsZooming(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the container
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    
    // Calculate percentage position (0 to 1)
    const xPercent = Math.max(0, Math.min(1, x / containerRect.width));
    const yPercent = Math.max(0, Math.min(1, y / containerRect.height));
    
    setMousePosition({ x, y });
    
    // For zoom, we want to move the image so that the point under the mouse stays under the mouse
    // When zoomed, the image is larger, so we need to offset it
    const zoomX = (xPercent - 0.5) * (zoomLevel - 1) * 100;
    const zoomY = (yPercent - 0.5) * (zoomLevel - 1) * 100;
    
    setZoomPosition({ x: zoomX, y: zoomY });
  }, [zoomLevel]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!enableMobileZoom || !isMobile) return;
    e.preventDefault();
    setIsZooming(true);
  }, [enableMobileZoom, isMobile]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!enableMobileZoom || !isMobile || !containerRef.current || !imageRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const x = touch.clientX - containerRect.left;
    const y = touch.clientY - containerRect.top;
    
    // Calculate percentage position (0 to 1)
    const xPercent = Math.max(0, Math.min(1, x / containerRect.width));
    const yPercent = Math.max(0, Math.min(1, y / containerRect.height));
    
    setMousePosition({ x, y });
    
    // For zoom, we want to move the image so that the point under the touch stays under the touch
    const zoomX = (xPercent - 0.5) * (zoomLevel - 1) * 100;
    const zoomY = (yPercent - 0.5) * (zoomLevel - 1) * 100;
    
    setZoomPosition({ x: zoomX, y: zoomY });
  }, [enableMobileZoom, isMobile, zoomLevel]);

  const handleTouchEnd = useCallback(() => {
    if (!enableMobileZoom || !isMobile) return;
    setIsZooming(false);
  }, [enableMobileZoom, isMobile]);

  return (
    <div className={`flex gap-4 ${containerClassName}`}>
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden cursor-zoom-in group ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ width, height }}
      >
        <Image
          ref={imageRef}
          src={src}
          alt={alt}
          fill
          className="object-contain transition-all duration-300 ease-out"
          style={{
            transform: isZooming 
              ? `scale(${zoomLevel}) translate(${zoomPosition.x}%, ${zoomPosition.y}%)`
              : 'scale(1) translate(0%, 0%)',
            transformOrigin: 'center center'
          }}
          sizes="(max-width: 1024px) 100vw, 50vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.jpg';
          }}
        />
        
        {/* Zoom Indicator */}
        {isZooming && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Magnifying Glass Icon */}
            <div 
              className="absolute w-8 h-8 bg-white rounded-full shadow-lg border-2 border-green-600 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: mousePosition.x,
                top: mousePosition.y,
              }}
            >
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Zoom Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-5"></div>
          </div>
        )}
      </div>
      
      {/* Zoomed View (Flipkart Style) */}
      {showZoomedView && isZooming && (
        <div 
          className="relative overflow-hidden border border-gray-200 rounded-lg shadow-lg bg-white"
          style={{ width: width * 0.8, height: height * 0.8 }}
        >
          <Image
            src={src}
            alt={`${alt} - Zoomed`}
            fill
            className="object-contain"
            style={{
              transform: `scale(${zoomLevel}) translate(${zoomPosition.x}%, ${zoomPosition.y}%)`,
              transformOrigin: 'center center'
            }}
            sizes="(max-width: 1024px) 100vw, 40vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.jpg';
            }}
          />
          
          {/* Zoom View Label */}
          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
            Zoom View
          </div>
        </div>
      )}
      
      {/* Zoom Instructions */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-gray-500">
          {isMobile 
            ? (isZooming ? 'Touch and drag to explore' : 'Touch to zoom')
            : (isZooming ? 'Move mouse to explore' : 'Hover to zoom')
          }
        </p>
      </div>
    </div>
  );
};

export default ProductImageZoom;
