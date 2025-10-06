import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface SimpleImageZoomProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  zoomLevel?: number;
  className?: string;
  containerClassName?: string;
  responsive?: boolean;
}

const SimpleImageZoom: React.FC<SimpleImageZoomProps> = ({
  src,
  alt,
  width = 600,
  height = 400,
  zoomLevel = 2,
  className = '',
  containerClassName = '',
  responsive = true
}) => {
  const [isZooming, setIsZooming] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [currentDimensions, setCurrentDimensions] = useState({ width, height });
  const containerRef = useRef<HTMLDivElement>(null);

  // Device detection and responsive sizing
  useEffect(() => {
    const checkDevice = () => {
      const screenWidth = window.innerWidth;
      const isMobileDevice = screenWidth < 768;
      const isTabletDevice = screenWidth >= 768 && screenWidth < 1024;
      
      setIsMobile(isMobileDevice);
      setIsTablet(isTabletDevice);
      
      if (responsive) {
        if (isMobileDevice) {
          setCurrentDimensions({ width: Math.min(width, screenWidth - 32), height: height * 0.8 });
        } else if (isTabletDevice) {
          setCurrentDimensions({ width: Math.min(width, screenWidth * 0.8), height: height * 0.9 });
        } else {
          setCurrentDimensions({ width, height });
        }
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [width, height, responsive]);

  const handleMouseEnter = useCallback(() => {
    setIsZooming(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsZooming(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  }, [isZooming]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    e.preventDefault();
    setIsZooming(true);
  }, [isMobile]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || !containerRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setMousePosition({ x, y });
  }, [isMobile]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile) return;
    setIsZooming(false);
  }, [isMobile]);

  // Get device-specific zoom level
  const getDeviceZoomLevel = useCallback(() => {
    if (isMobile) return Math.min(zoomLevel, 1.5); // Reduced zoom for mobile
    if (isTablet) return Math.min(zoomLevel, 2); // Moderate zoom for tablet
    return zoomLevel; // Full zoom for desktop
  }, [isMobile, isTablet, zoomLevel]);

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${isMobile ? 'cursor-pointer' : 'cursor-zoom-in'} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          width: currentDimensions.width, 
          height: currentDimensions.height,
          maxWidth: '100%',
          minHeight: isMobile ? '200px' : '300px'
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain transition-transform duration-300 ease-out"
          style={{
            transform: isZooming ? `scale(${getDeviceZoomLevel()})` : 'scale(1)',
            transformOrigin: `${(mousePosition.x / currentDimensions.width) * 100}% ${(mousePosition.y / currentDimensions.height) * 100}%`,
            cursor: isZooming ? 'zoom-out' : 'zoom-in'
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 50vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.jpg';
          }}
          priority={true}
        />
        
        {/* Zoom Overlay */}
        {isZooming && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div 
              className="absolute w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl border-2 border-green-500 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{
                left: mousePosition.x,
                top: mousePosition.y,
              }}
            >
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10"></div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          {isMobile 
            ? (isZooming ? 'Touch and drag to explore' : 'Touch to zoom')
            : isTablet
            ? (isZooming ? 'Move finger to explore' : 'Touch to zoom')
            : (isZooming ? 'Move mouse to explore' : 'Hover to zoom')
          }
        </p>
      </div>
    </div>
  );
};

export default SimpleImageZoom;
