import React, { useState } from 'react';

interface CouponCodeProps {
  onApplyCoupon?: (code: string) => void;
  isApplying?: boolean;
}

export default function CouponCode({ onApplyCoupon, isApplying = false }: CouponCodeProps) {
  const [couponCode, setCouponCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim() && onApplyCoupon) {
      onApplyCoupon(couponCode.trim());
    }
  };

  return (
    <div className="p-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            className="w-full py-2 px-3 border border-[#FFEBE4] rounded-[10px] text-[14px] text-[#797979] outline-none focus:border-[#CD8973] bg-[#f7f2ee]"
            placeholder="Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={isApplying}
          />
        </div>
        <button
          type="submit"
          disabled={isApplying || !couponCode.trim()}
          className="ayur-btn text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply Coupon
        </button>
      </form>
    </div>
  );
}
