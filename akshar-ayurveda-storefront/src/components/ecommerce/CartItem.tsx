import React from 'react';
import Image from 'next/image';
import { Button, Badge } from '../ui';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    quantity: number;
    maxQuantity?: number;
    inStock?: boolean;
  };
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist?: (id: string) => void;
  className?: string;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist,
  className = '',
}) => {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && (!item.maxQuantity || newQuantity <= item.maxQuantity)) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const discountPercentage = item.originalPrice 
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  return (
    <div className={`flex items-center gap-4 p-4 bg-white rounded-lg border ${className}`}>
      {/* Product Image */}
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover rounded-md"
          sizes="80px"
        />
        {discountPercentage > 0 && (
          <Badge 
            variant="danger" 
            size="sm" 
            className="absolute -top-1 -right-1"
          >
            -{discountPercentage}%
          </Badge>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
        
        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold text-green-600">
            ₹{item.price.toFixed(2)}
          </span>
          {item.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{item.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {item.inStock === false && (
          <Badge variant="warning" size="sm" className="mt-1">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="w-8 h-8 p-0"
        >
          -
        </Button>
        
        <span className="w-12 text-center font-medium">{item.quantity}</span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
          className="w-8 h-8 p-0"
        >
          +
        </Button>
      </div>

      {/* Total Price */}
      <div className="text-right min-w-0">
        <div className="font-bold text-lg text-gray-900">
          ₹{(item.price * item.quantity).toFixed(2)}
        </div>
        {item.originalPrice && (
          <div className="text-sm text-gray-500 line-through">
            ₹{(item.originalPrice * item.quantity).toFixed(2)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Remove
        </Button>
        
        {onMoveToWishlist && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMoveToWishlist(item.id)}
            className="text-gray-600 hover:text-gray-700"
          >
            Move to Wishlist
          </Button>
        )}
      </div>
    </div>
  );
};

export default CartItem;
