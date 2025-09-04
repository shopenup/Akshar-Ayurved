import React from 'react';
import { Card, Button } from '../ui';

interface CartSummaryProps {
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total: number;
  itemCount: number;
  onCheckout: () => void;
  onContinueShopping: () => void;
  loading?: boolean;
  className?: string;
  showShipping?: boolean;
  showTax?: boolean;
  currency?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  total,
  itemCount,
  onCheckout,
  onContinueShopping,
  loading = false,
  className = '',
  showShipping = true,
  showTax = true,
  currency = '₹',
}) => {
  const formatPrice = (price: number) => `${currency}${price.toFixed(2)}`;

  return (
    <Card className={className}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
        
        {/* Summary Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items ({itemCount})</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          
          {showShipping && shipping > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">{formatPrice(shipping)}</span>
            </div>
          )}
          
          {showTax && tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>
          )}
          
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span className="font-medium">-{formatPrice(discount)}</span>
            </div>
          )}
          
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            onClick={onCheckout}
            disabled={loading || itemCount === 0}
            fullWidth
          >
            {loading ? 'Processing...' : `Proceed to Checkout (${itemCount} items)`}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={onContinueShopping}
            fullWidth
          >
            Continue Shopping
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Free shipping on orders over ₹999</p>
            <p>• 30-day return policy</p>
            <p>• Secure checkout</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CartSummary;
