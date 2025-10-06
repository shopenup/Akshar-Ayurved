'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { compressImageFromUrl, getCompressionOptions, formatFileSize, CompressionOptions } from '@lib/util/image-compression'

interface CompressedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  quality?: number
  sizes?: string
  useCase?: 'thumbnail' | 'card' | 'hero' | 'gallery'
  compressionOptions?: CompressionOptions
  fallbackSrc?: string
  onLoad?: () => void
  onError?: () => void
  showCompressionInfo?: boolean
  lazy?: boolean
}

const CompressedImage: React.FC<CompressedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  quality = 75,
  sizes,
  useCase = 'card',
  compressionOptions,
  fallbackSrc,
  onLoad,
  onError,
  showCompressionInfo = false,
  lazy = true,
}) => {
  // In-memory cache to avoid recompressing the same URL during client navigations
  const cache: Map<string, string> = (CompressedImage as any)._cache || new Map<string, string>()
  ;(CompressedImage as any)._cache = cache

  const [compressedSrc, setCompressedSrc] = useState<string>(src)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: string
    compressedSize: string
    compressionRatio: number
  } | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Compression function
  const compressImage = useCallback(async (imageSrc: string) => {
    if (typeof window === "undefined") {
      console.warn("[CompressedImage] Skipping compression on server for:", imageSrc)
      return
    }
    if (!mountedRef.current) return

    try {
      // Only block UI for larger views; cards/thumbnails should render immediately
      setIsCompressing(useCase === 'hero' || useCase === 'gallery')
      setHasError(false)

      // Create abort controller for this compression operation
      abortControllerRef.current = new AbortController()
      
      // Set a timeout for compression (10 seconds)
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
      }, 10000)
      
      // Get compression options
      const options = compressionOptions || getCompressionOptions(0, useCase)
      options.signal = abortControllerRef.current.signal as any

      // Compress the image
      const result = await compressImageFromUrl(imageSrc, options)
      
      // Clear timeout if compression succeeds
      clearTimeout(timeoutId)
      
      if (!mountedRef.current) return

      // Handle null result (compression failed)
      if (!result.compressedBlob) {
        console.warn('Image compression returned null, falling back to original')
        setCompressedSrc(src)
        setIsCompressing(false)
        return
      }

      // Convert compressed file to data URL
      const reader = new FileReader()
      reader.onload = () => {
        if (!mountedRef.current) return
        
        const dataUrl = reader.result as string
        setCompressedSrc(dataUrl)
        // cache result for future renders
        cache.set(src, dataUrl)
        
        // Set compression info if requested
        if (showCompressionInfo) {
          setCompressionInfo({
            originalSize: formatFileSize(result.originalSize),
            compressedSize: formatFileSize(result.compressedSize),
            compressionRatio: result.compressionRatio,
          })
        }
        
        setIsCompressing(false)
      }
      reader.readAsDataURL(result.compressedBlob)
      
    } catch (error) {
      if (!mountedRef.current) return
      
      console.error('Image compression failed:', error)
      
      // On any failure (including CORS/timeout), gracefully fall back to original
      setCompressedSrc(src)
      setIsCompressing(false)
      setHasError(false)
    }
  }, [src, useCase, compressionOptions, showCompressionInfo])

  // Compress image when src changes
  useEffect(() => {
    if (typeof window === "undefined") {
      console.warn("[CompressedImage] Skipping compression on server for:", src)
      return
    }
    if (src && lazy) {
      // For small usages (cards/thumbnails), show original immediately and compress in background
      if (useCase === 'card' || useCase === 'thumbnail') {
        setCompressedSrc(src)
        setIsCompressing(false)
        setHasError(false)
        void compressImage(src) // background compress; will swap to data URL when ready
        return
      }

      // Serve from cache if available
      if (cache.has(src)) {
        setCompressedSrc(cache.get(src) as string)
        setIsCompressing(false)
        setHasError(false)
        return
      }

      // Always attempt compression (dev and prod)
      const compressionPromise = compressImage(src)
      
      // Fallback: if compression takes too long, use original image
      const fallbackTimeout = setTimeout(() => {
        if (isCompressing) {
          console.warn('Compression timeout, using original:', src)
          setCompressedSrc(src)
          setIsCompressing(false)
          setHasError(false)
        }
      }, 5000)
      
      // Clean up timeout when compression completes
      compressionPromise.finally(() => {
        clearTimeout(fallbackTimeout)
      })
    } else {
      setCompressedSrc(src)
    }
  }, [src, compressImage, lazy, isCompressing])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    if (fallbackSrc && compressedSrc !== fallbackSrc) {
      setCompressedSrc(fallbackSrc)
      setHasError(false)
    } else {
      setHasError(true)
      onError?.()
    }
  }, [fallbackSrc, compressedSrc, onError])

  // Show loading state while compressing
  if (isCompressing && (useCase === 'hero' || useCase === 'gallery')) {
    return (
      <div className={`relative bg-gray-200 animate-pulse ${className}`}>
        {width && height && (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ width, height }}
          >
            <div className="text-gray-400 text-sm">
              Compressing...
            </div>
          </div>
        )}
        {fill && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-sm">
              Compressing...
            </div>
          </div>
        )}
      </div>
    )
  }

  // For small cards/thumbnails, render a plain img to avoid dark placeholder artifacts
  if (useCase === 'card' || useCase === 'thumbnail') {
    return (
      <Image
        src={compressedSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ backgroundColor: '#ffffff', objectFit: 'contain' }}
        onLoad={handleLoad as any}
        onError={() => {
          if (fallbackSrc && compressedSrc !== fallbackSrc) {
            setCompressedSrc(fallbackSrc)
          }
        }}
        unoptimized={typeof compressedSrc === 'string' && compressedSrc.startsWith('data:')}
      />
    )
  }

  return (
    <div className="relative">
      {/* Non-card views (we already returned for card/thumbnail above) */}
      {(() => {
        const resolvedPlaceholder = blurDataURL ? 'blur' : placeholder
        const imgStyle: React.CSSProperties = { backgroundColor: 'transparent' }

        return (
      <Image
        src={compressedSrc}
        alt={alt}   
        width={width}
        height={height}
        fill={fill}
        className={className}
        priority={priority}
        placeholder={resolvedPlaceholder as any}
        blurDataURL={blurDataURL}
        quality={quality}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        style={imgStyle}
        unoptimized={typeof compressedSrc === 'string' && compressedSrc.startsWith('data:')}
      />
        )
      })()}
      
      {/* Compression info overlay */}
      {showCompressionInfo && compressionInfo && isLoaded && (
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs p-1 rounded">
          <div>Original: {compressionInfo.originalSize}</div>
          <div>Compressed: {compressionInfo.compressedSize}</div>
          <div>Saved: {compressionInfo.compressionRatio}%</div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center p-4">
            <div>Failed to load image</div>
            {fallbackSrc && (
              <button 
                onClick={() => setCompressedSrc(fallbackSrc)}
                className="text-blue-500 underline text-sm mt-1"
              >
                Use fallback
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CompressedImage


