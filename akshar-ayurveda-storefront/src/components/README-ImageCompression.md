# Image Compression System

This system provides automatic client-side image compression for the storefront to improve performance and reduce bandwidth usage.

## Features

- **Automatic Compression**: Images are automatically compressed when rendered
- **Multiple Use Cases**: Different compression settings for thumbnails, cards, hero images, etc.
- **Lazy Loading**: Images are compressed only when they come into view
- **Fallback Support**: Graceful fallback to original images if compression fails
- **Performance Monitoring**: Optional compression statistics display
- **Memory Efficient**: Uses Web Workers for compression to avoid blocking the UI

## Components

### CompressedImage

The main component that automatically compresses images:

```tsx
import CompressedImage from '@components/CompressedImage'

<CompressedImage
  src="/static/product-image.jpg"
  alt="Product Image"
  width={400}
  height={400}
  useCase="card"
  showCompressionInfo={true}
  lazy={true}
/>
```

#### Props

- `src`: Image source URL
- `alt`: Alt text for accessibility
- `width/height`: Image dimensions
- `useCase`: Compression preset ('thumbnail', 'card', 'hero', 'gallery')
- `showCompressionInfo`: Show compression statistics overlay
- `lazy`: Enable lazy compression (default: true)
- `compressionOptions`: Custom compression options
- `fallbackSrc`: Fallback image if compression fails

### ProductImage

Pre-configured component for product images:

```tsx
import ProductImage from '@components/ProductImage'

<ProductImage
  src="/static/product.jpg"
  alt="Product Name"
  title="Product Title"
  width={300}
  height={300}
  showCompressionInfo={false}
/>
```

## Hooks

### useImageCompression

Hook for manual image compression control:

```tsx
import { useImageCompression } from '@hooks/useImageCompression'

const { compressedSrc, isCompressing, compressionInfo, error } = useImageCompression(
  imageUrl,
  {
    useCase: 'card',
    autoCompress: true,
    lazy: true
  }
)
```

### useBatchImageCompression

Hook for compressing multiple images:

```tsx
import { useBatchImageCompression } from '@hooks/useImageCompression'

const { results, isCompressingAll, compressAll } = useBatchImageCompression(
  imageUrls,
  { useCase: 'gallery' }
)
```

## Compression Settings

### Use Cases

- **thumbnail**: Small images (300px max, 0.1MB, 70% quality)
- **card**: Medium images (600px max, 0.3MB, 80% quality)
- **hero**: Large images (1920px max, 0.8MB, 85% quality)
- **gallery**: Gallery images (1200px max, 0.5MB, 80% quality)

### Custom Options

```tsx
const customOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1200,
  quality: 0.8,
  useWebWorker: true,
  fileType: 'image/jpeg'
}
```

## Usage Examples

### Replace Regular Images

```tsx
// Before
import Image from 'next/image'
<Image src="/static/image.jpg" alt="Image" width={400} height={400} />

// After
import CompressedImage from '@components/CompressedImage'
<CompressedImage src="/static/image.jpg" alt="Image" width={400} height={400} />
```

### Product Gallery

```tsx
import CompressedImage from '@components/CompressedImage'

{products.map(product => (
  <CompressedImage
    key={product.id}
    src={product.image}
    alt={product.title}
    width={300}
    height={300}
    useCase="gallery"
    lazy={true}
  />
))}
```

### Hero Section

```tsx
import CompressedImage from '@components/CompressedImage'

<CompressedImage
  src="/static/hero-banner.jpg"
  alt="Hero Banner"
  fill
  useCase="hero"
  priority={true}
  className="object-cover"
/>
```

## Performance Benefits

- **Reduced Bandwidth**: Images are compressed by 30-70% on average
- **Faster Loading**: Smaller file sizes mean faster downloads
- **Better UX**: Progressive loading with compression indicators
- **Memory Efficient**: Web Workers prevent UI blocking
- **Automatic Fallback**: Graceful degradation if compression fails

## Configuration

The system automatically detects images that need compression based on:
- Localhost URLs
- Static file paths
- Common image extensions (.jpg, .jpeg, .png)

Images from external CDNs are not compressed to avoid unnecessary processing.

## Monitoring

Enable compression info to see statistics:

```tsx
<CompressedImage
  src="/static/image.jpg"
  alt="Image"
  showCompressionInfo={true}
/>
```

This will show an overlay with:
- Original file size
- Compressed file size  
- Compression percentage saved

## Best Practices

1. **Use appropriate useCase**: Choose the right compression preset for your use case
2. **Enable lazy loading**: Use `lazy={true}` for images below the fold
3. **Set priority for above-fold images**: Use `priority={true}` for hero images
4. **Provide fallbacks**: Always provide `fallbackSrc` for important images
5. **Monitor performance**: Use `showCompressionInfo` during development to verify compression

## Browser Support

- Modern browsers with Web Workers support
- Graceful fallback to original images in unsupported browsers
- Progressive enhancement approach
