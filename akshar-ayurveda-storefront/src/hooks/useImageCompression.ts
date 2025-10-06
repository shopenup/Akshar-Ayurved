import { useState, useCallback, useRef, useEffect } from 'react'
import { compressImageFromUrl, getCompressionOptions, CompressionOptions, CompressionResult } from '@lib/util/image-compression'

interface UseImageCompressionOptions {
  useCase?: 'thumbnail' | 'card' | 'hero' | 'gallery'
  compressionOptions?: CompressionOptions
  autoCompress?: boolean
  lazy?: boolean
}

interface UseImageCompressionReturn {
  compressedSrc: string
  isCompressing: boolean
  compressionInfo: {
    originalSize: string
    compressedSize: string
    compressionRatio: number
  } | null
  error: string | null
  compressImage: (src: string) => Promise<void>
  reset: () => void
}

export const useImageCompression = (
  initialSrc: string,
  options: UseImageCompressionOptions = {}
): UseImageCompressionReturn => {
  const {
    useCase = 'card',
    compressionOptions,
    autoCompress = true,
    lazy = true,
  } = options

  const [compressedSrc, setCompressedSrc] = useState<string>(initialSrc)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: string
    compressedSize: string
    compressionRatio: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  
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

  const compressImage = useCallback(async (src: string) => {
    if (!mountedRef.current) return

    try {
      setIsCompressing(true)
      setError(null)

      // Create abort controller for this compression operation
      abortControllerRef.current = new AbortController()
      
      // Get compression options
      const options = compressionOptions || getCompressionOptions(0, useCase)
      options.signal = abortControllerRef.current.signal

      // Compress the image
      const result = await compressImageFromUrl(src, options)
      
      if (!mountedRef.current) return

      if (!result.compressedFile) {
        throw new Error('Compression failed: No compressed file returned')
        }

      // Convert compressed file to data URL
      const reader = new FileReader()
      reader.onload = () => {
        if (!mountedRef.current) return
        
        const dataUrl = reader.result as string
        setCompressedSrc(dataUrl)
        
        // Set compression info
        setCompressionInfo({
          originalSize: result.originalSize.toString(),
          compressedSize: result.compressedSize.toString(),
          compressionRatio: result.compressionRatio,
        })
        
        setIsCompressing(false)
      }
      reader.readAsDataURL(result.compressedFile)
      
    } catch (error) {
      if (!mountedRef.current) return
      
      
      // If compression fails, use original image
      if (error instanceof Error && error.name === 'AbortError') {
        return // Operation was aborted, don't update state
      }
      
      setCompressedSrc(src)
      setIsCompressing(false)
      setError(error instanceof Error ? error.message : 'Compression failed')
    }
  }, [useCase, compressionOptions])

  const reset = useCallback(() => {
    setCompressedSrc(initialSrc)
    setCompressionInfo(null)
    setError(null)
    setIsCompressing(false)
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [initialSrc])

  // Auto-compress when initialSrc changes
  useEffect(() => {
    if (autoCompress && initialSrc) {
      // Only compress if the image is likely to be large
      if (initialSrc.includes('localhost') || initialSrc.includes('/static/') || initialSrc.includes('.jpg') || initialSrc.includes('.jpeg') || initialSrc.includes('.png')) {
        if (lazy) {
          // Use Intersection Observer for lazy compression
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  compressImage(initialSrc)
                  observer.disconnect()
                }
              })
            },
            { threshold: 0.1 }
          )
          
          // Create a dummy element to observe
          const dummyElement = document.createElement('div')
          observer.observe(dummyElement)
          
          return () => observer.disconnect()
        } else {
          compressImage(initialSrc)
        }
      } else {
        setCompressedSrc(initialSrc)
      }
    } else {
      setCompressedSrc(initialSrc)
    }
  }, [initialSrc, autoCompress, lazy, compressImage])

  return {
    compressedSrc,
    isCompressing,
    compressionInfo,
    error,
    compressImage,
    reset,
  }
}

// Hook for batch compression
export const useBatchImageCompression = (
  imageUrls: string[],
  options: UseImageCompressionOptions = {}
) => {
  const [results, setResults] = useState<Map<string, UseImageCompressionReturn>>(new Map())
  const [isCompressingAll, setIsCompressingAll] = useState(false)

  const compressAll = useCallback(async () => {
    setIsCompressingAll(true)
    
    try {
      const promises = imageUrls.map(async (url) => {
        const hook = useImageCompression(url, options)
        await hook.compressImage(url)
        return { url, ...hook }
      })
      
      const results = await Promise.all(promises)
      const resultsMap = new Map()
      
      results.forEach((result) => {
        resultsMap.set(result.url, result)
      })
      
      setResults(resultsMap)
    } catch (error) {
    } finally {
      setIsCompressingAll(false)
    }
  }, [imageUrls, options])

  return {
    results,
    isCompressingAll,
    compressAll,
  }
}
