import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ImageZoomProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  zoomLevel?: number;
  className?: string;
  containerClassName?: string;
}

const ImageZoom: React.FC<ImageZoomProps> = ({
  src,
  alt,
  width = 600,
  height = 400,
  zoomLevel = 2.5,
  className = '',
  containerClassName = ''
}) => {
  const [isZooming, setIsZooming] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseEnter = useCallback(() => {
    setIsZooming(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsZooming(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the container
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    
    // Calculate percentage position
    const xPercent = (x / containerRect.width) * 100;
    const yPercent = (y / containerRect.height) * 100;
    
    setMousePosition({ x, y });
    
    // Calculate zoom position (inverted for natural zoom effect)
    const zoomX = (xPercent / 100) * (imageRect.width * zoomLevel - containerRect.width);
    const zoomY = (yPercent / 100) * (imageRect.height * zoomLevel - containerRect.height);
    
    setZoomPosition({ x: -zoomX, y: -zoomY });
  }, [zoomLevel]);

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden cursor-zoom-in ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{ width, height }}
      >
        <Image
          ref={imageRef}
          src={src}
          alt={alt}
          fill
          className="object-contain transition-transform duration-200 ease-out"
          style={{
            transform: isZooming 
              ? `scale(${zoomLevel}) translate(${zoomPosition.x / zoomLevel}px, ${zoomPosition.y / zoomLevel}px)`
              : 'scale(1) translate(0px, 0px)',
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
              className="absolute w-8 h-8 bg-white rounded-full shadow-lg border-2 border-green-600 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: mousePosition.x,
                top: mousePosition.y,
                zIndex: 10
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
      
      {/* Zoom Instructions */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          {isZooming ? 'Move mouse to zoom' : 'Hover to zoom'}
        </p>
      </div>
    </div>
  );
};

export default ImageZoom;
