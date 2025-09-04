import React from 'react';
import ProductCard from './ProductCard';

interface Product {
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
}

interface ProductGridProps {
  products: Product[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  onAddToCart?: (productId: string) => void;
  onAddToFavorites?: (productId: string) => void;
  onProductClick?: (productId: string) => void;
  showActions?: boolean;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  columns = 4,
  onAddToCart,
  onAddToFavorites,
  onProductClick,
  showActions = true,
  className = '',
  loading = false,
  emptyMessage = 'No products found',
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600">
          Try adjusting your search criteria or browse our categories.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToFavorites={onAddToFavorites}
          onProductClick={onProductClick}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
