import React from 'react'
import CompressedImage from './CompressedImageClient' 

interface ProductImageProps {
  src: string
  alt: string
  title?: string
  width?: number
  height?: number
  className?: string
  showCompressionInfo?: boolean
  priority?: boolean
}

/**
 * ProductImage component that automatically compresses images
 * Use this instead of regular Image component for product images
 */
const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  title,
  width = 400,
  height = 400,
  className = '',
  showCompressionInfo = false,
  priority = false,
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <CompressedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        useCase="card"
        showCompressionInfo={showCompressionInfo}
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        fallbackSrc="/placeholder-product.jpg"
      />
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
          {title}
        </div>
      )}
    </div>
  )
}

export default ProductImage