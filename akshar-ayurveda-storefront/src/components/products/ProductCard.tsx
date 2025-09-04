import React from 'react';
import Image from 'next/image';
import { Card, Badge, Button } from '../ui';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    tags?: string[];
    rating?: number;
    reviewCount?: number;
    inStock?: boolean;
  };
  onAddToCart?: (productId: string) => void;
  onAddToFavorites?: (productId: string) => void;
  onProductClick?: (productId: string) => void;
  showActions?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToFavorites,

  showActions = true,
  className = '',
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product.id);
  };

  const handleAddToFavorites = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToFavorites?.(product.id);
  };

  const handleProductClick = () => {
    // Navigate to single product page
    window.location.href = `/products/${product.id}`;
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card 
      className={`overflow-hidden ${className}`}
      hover={true}
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative w-full h-48">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <Badge 
            variant="danger" 
            size="sm" 
            className="absolute top-2 left-2"
          >
            -{discountPercentage}%
          </Badge>
        )}
        
        {/* Stock Status */}
        {product.inStock === false && (
          <Badge 
            variant="warning" 
            size="sm" 
            className="absolute top-2 right-2"
          >
            Out of Stock
          </Badge>
        )}
        
        {/* Favorite Button */}
        {showActions && (
          <button
            onClick={handleAddToFavorites}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <Badge variant="secondary" size="sm" className="mb-2">
          {product.category}
        </Badge>
        
        {/* Product Name */}
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="info" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {product.reviewCount && (
              <span className="text-sm text-gray-500 ml-1">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-600">
            {product.originalPrice !== undefined ? `₹${product.originalPrice.toFixed(2)}` : ''}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart as any}
              disabled={product.inStock === false}
              fullWidth
            >
              {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
