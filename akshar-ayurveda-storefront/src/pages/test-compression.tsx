import React from 'react'
import CompressedImage from '@components/CompressedImageClient';  

const TestCompressionPage: React.FC = () => {
  const testImages = [
    'http://localhost:9000/static/1756982815040-d%20cure%20syrup.jpg',
    'http://localhost:9000/static/1756981865262-(106).JPG',
    'http://localhost:9000/static/1756981865265-D%20CURE%20POWDER%202.JPG',
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Image Compression Test</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Open browser developer tools (F12)</li>
          <li>Go to Console tab to see compression logs</li>
          <li>Go to Network tab and <strong>disable cache</strong></li>
          <li>Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)</li>
          <li>Look for compression statistics overlay on images</li>
          <li>Check console for &quot;Starting compression&quot; and &quot;Compression completed&quot; logs</li>
        </ol>
      </div>

      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">✅ Updated Components:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>ProductCard (components/products/ProductCard.tsx)</li>
          <li>ProductCard UI (components/ui/ProductCard.tsx)</li>
          <li>Product Page (pages/products/[id].tsx)</li>
          <li>Cart Page (pages/cart.tsx)</li>
          <li>CartItem (components/ecommerce/CartItem.tsx)</li>
          <li>CompressedImage component with cache-busting</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testImages.map((src, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Test Image {index + 1}</h3>
            
            <div className="space-y-4">
              {/* Original Image */}
              <div>
                <h4 className="text-sm font-medium mb-2">Original:</h4>
                <CompressedImage
                  src={src}
                  alt={`Original ${index + 1}`}
                  width={300}
                  height={128}
                  useCase="card"
                  lazy={false}
                  className="w-full h-32 object-cover border rounded"
                />
              </div>

              {/* Compressed Image */}
              <div>
                <h4 className="text-sm font-medium mb-2">Compressed:</h4>
                <CompressedImage
                  src={src}
                  alt={`Compressed ${index + 1}`}
                  width={300}
                  height={128}
                  useCase="card"
                  showCompressionInfo={true}
                  lazy={false}
                  className="w-full h-32 object-cover border rounded"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Troubleshooting:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>If images show &quot;Compressing...&quot; and don&apos;t change, check console for errors</li>
          <li>If compression info doesn&apos;t show, make sure showCompressionInfo=true</li>
          <li>If images are still large, check if they&apos;re being served from cache</li>
          <li>Try hard refresh (Ctrl+Shift+R) to clear cache</li>
        </ul>
      </div>
    </div>
  )
}

export default TestCompressionPage
