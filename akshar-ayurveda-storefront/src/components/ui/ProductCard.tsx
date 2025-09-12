import React from 'react';
import Image from 'next/image';
import { Button, Badge } from './index';

interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
}

interface ProductVariant {
  id: string;
  title: string;
  prices?: Array<{
    amount: number;
    currency_code: string;
  }>;
}

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  images: ProductImage[] | null;
  thumbnail?: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  variants?: ProductVariant[];
  tags?: string[];
  type?: {
    value: string;
    label: string;
  };
  categories?: {
    id: string;
    name: string;
  }[];
}

interface ProductCardProps {
  product: Product;
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  showAddToCart?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  onAddToCart,
  showAddToCart = true,
  className = '',
}) => {
  console.log('product', product);
  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product.id);
    }
  };

  // Temporarily disable status check - all products are in stock
  const isInStock = true;
  const hasDiscount = product.original_price && product.price && product.original_price > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative">
        <Image
          src={
            product.thumbnail
              ? typeof product.thumbnail === 'string'
                ? product.thumbnail
                : (product.thumbnail as ProductImage).url || '/placeholder-product.jpg'
              : product.images && product.images[0]
                ? typeof product.images[0] === 'string'
                  ? product.images[0]
                  : (product.images[0] as ProductImage).url || '/placeholder-product.jpg'
                : '/placeholder-product.jpg'
          }
          alt={product.title}
          width={300}
          height={192}
          className="w-full h-48 object-contain rounded-t-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.jpg';
          }}
        />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <Badge 
            variant="danger" 
            size="sm" 
            className="absolute top-2 left-2"
          >
            -{discountPercentage}%
          </Badge>
        )}
        
        {/* Stock Status */}
        {!isInStock && (
          <Badge 
            variant="warning" 
            size="sm" 
            className="absolute top-2 right-2"
          >
            Out of Stock
          </Badge>
        )}

        {/* New Badge */}
        {isInStock && product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
          <Badge 
            variant="success" 
            size="sm" 
            className="absolute top-2 right-2"
          >
            New
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Badge variant="secondary" size="sm" className="mb-2">
          {product.categories && product.categories.length > 0
            ? product.categories[0].name
            : 'General'}
        </Badge>
        
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-green-600">
            ₹{(product.price || 0).toFixed(2)}
          </span>
          {product.original_price && (
            <span className="text-sm text-gray-500 line-through">
              ₹{(product.original_price || 0).toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        {showAddToCart && (
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e?.stopPropagation(); // Prevent card navigation
              if (onAddToCart) {
                onAddToCart(product.id);
              }
            }}
            disabled={!isInStock}
            fullWidth
          >
            {!isInStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
