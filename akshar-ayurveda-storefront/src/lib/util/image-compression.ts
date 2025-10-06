import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  quality?: number
  fileType?: string
  preserveExif?: boolean
  signal?: AbortSignal
}

export interface CompressionResult {
  compressedFile?: File
  compressedBlob?: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
  originalImage?: HTMLImageElement
}

// Global lightweight semaphore to limit concurrent compressions in lists
const MAX_PARALLEL_COMPRESSIONS = 2
let activeCompressions = 0
const waiters: Array<() => void> = []

const withCompressionSlot = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (activeCompressions >= MAX_PARALLEL_COMPRESSIONS) {
    await new Promise<void>((resolve) => waiters.push(resolve))
  }
  activeCompressions++
  try {
    return await fn()
  } finally {
    activeCompressions--
    const next = waiters.shift()
    if (next) next()
  }
}

/**
 * Compress an image file with configurable options
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  const defaultOptions: CompressionOptions = {
    maxSizeMB: 0.5, // Maximum file size in MB
    maxWidthOrHeight: 1920, // Maximum width or height in pixels
    useWebWorker: true,
    quality: 0.8, // Image quality (0-1)
    fileType: 'image/jpeg',
    preserveExif: false,
    ...options,
  }


  try {
    // Create a preview of the original image
    const originalImage = await createImageFromFile(file)
    
    // Compress the image
    const compressedFile = await imageCompression(file, defaultOptions)
    
    // Calculate compression ratio
    const originalSize = file.size
    const compressedSize = compressedFile.size
    const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100)


    return {
      compressedFile,
      compressedBlob: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
      originalImage,
    }
  } catch (error) {
    throw new Error(`Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Compress an image from URL
 */
export const compressImageFromUrl = async (
  imageUrl: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  try {
    // Normalize common admin file URLs: ensure /static/ prefix for localhost:9000
    let originalUrl = imageUrl
    try {
      const u = new URL(imageUrl)
      const isLocal9000 = (u.hostname === 'localhost' || u.hostname === '127.0.0.1') && (u.port === '9000' || u.port === '')
      if (isLocal9000 && !u.pathname.startsWith('/static/')) {
        u.pathname = `/static${u.pathname.startsWith('/') ? '' : '/'}${u.pathname}`
        originalUrl = u.toString()
      }
    } catch {
      // if it's a relative path, leave as-is
    }

    // Build a same-origin proxy URL to avoid CORS in production
    const proxied = `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`

    // Add cache-busting parameter to force fresh fetch
    const cacheBustingUrl = proxied.includes('?')
      ? `${proxied}&cb=${Date.now()}&rand=${Math.random()}`
      : `${proxied}?cb=${Date.now()}&rand=${Math.random()}`

    // Limit parallelism so lists don't stall; fetch and compress within a slot
    let response: Response
    try {
      response = await withCompressionSlot(async () => {
        return await fetch(cacheBustingUrl, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
      })
    } catch (fetchError) {
      console.warn(`Network error fetching image: ${fetchError}. Using fallback.`)
      return {
        compressedBlob: undefined,
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 0,
        originalImage: undefined,
      }
    }
    
    if (!response.ok) {
      // If image fetch fails, return a fallback result instead of throwing
      console.warn(`Failed to fetch image: ${response.statusText}. Using fallback.`)
      return {
        compressedBlob: undefined,
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 0,
        originalImage: undefined,
      }
    }

    const blob = await response.blob()
    
    const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' })

    return await withCompressionSlot(async () => await compressImage(file, options))
  } catch (error) {
    throw new Error(`Failed to compress image from URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Create an HTMLImageElement from a File
 */
const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Get compression options based on image size and use case
 */
export const getCompressionOptions = (
  imageSize: number,
  useCase: 'thumbnail' | 'card' | 'hero' | 'gallery' = 'card'
): CompressionOptions => {
  const options: CompressionOptions = {
    useWebWorker: true,
    preserveExif: false,
  }

  switch (useCase) {
    case 'thumbnail':
      return {
        ...options,
        maxSizeMB: 0.1,
        maxWidthOrHeight: 300,
        quality: 0.7,
      }
    
    case 'card':
      return {
        ...options,
        maxSizeMB: 0.3,
        maxWidthOrHeight: 600,
        quality: 0.8,
      }
    
    case 'hero':
      return {
        ...options,
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        quality: 0.85,
      }
    
    case 'gallery':
      return {
        ...options,
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        quality: 0.8,
      }
    
    default:
      return {
        ...options,
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        quality: 0.8,
      }
  }
}

/**
 * Check if an image needs compression based on size
 */
export const shouldCompressImage = (
  file: File,
  maxSizeMB: number = 0.5
): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size > maxSizeBytes
}

/**
 * Get image dimensions from File
 */
export const getImageDimensions = async (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    img.onerror = reject
    
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
