import React from 'react';
import Link from 'next/link';
import { convertToLocale } from '@lib/util/money';

interface CartTotalsProps {
  subtotal: number;
  discountTotal?: number;
  shippingTotal?: number;
  taxTotal?: number;
  total: number;
  currencyCode?: string;
  onCheckout: () => void;
  isCheckoutDisabled?: boolean;
}

export default function CartTotals({ 
  subtotal, 
  discountTotal = 0, 
  shippingTotal = 0, 
  taxTotal = 0, 
  total, 
  currencyCode = 'INR',
  onCheckout,
  isCheckoutDisabled = false
}: CartTotalsProps) {
  return (
    <div className="p-[20px] bg-white shadow-[3px_4px_29.6px_0px_rgba(0,0,0,0.06)] rounded-[10px] max-w-[400px] w-full mx-auto mt-5">
      <div className="bg-[#CD8973] rounded-t-[10px] -m-[20px] mb-0">
        <h2 className="text-[18px] font-bold text-white py-[12px] px-[10px] text-center rounded-t-[10px]">
          Cart Totals
        </h2>
      </div>
      
      <div className="mt-[20px]">
        <table className="w-full">
          <tbody>
            <tr className="border-b border-[#F0F0F0]">
              <th className="text-left py-2 px-3 text-[16px] font-medium text-[#222222] border border-[#F0F0F0]">
                Subtotal
              </th>
              <td className="text-right py-2 px-3 text-[16px] font-medium text-[#CD8973] border border-[#F0F0F0]">
                <span className="amount">
                  {convertToLocale({ amount: subtotal, currency_code: currencyCode })}
                </span>
              </td>
            </tr>
            
            {discountTotal > 0 && (
              <tr className="border-b border-[#F0F0F0]">
                <th className="text-left py-2 px-3 text-[16px] font-medium text-[#222222] border border-[#F0F0F0]">
                  Discount
                </th>
                <td className="text-right py-2 px-3 text-[16px] font-medium text-green-600 border border-[#F0F0F0]">
                  -{convertToLocale({ amount: discountTotal, currency_code: currencyCode })}
                </td>
              </tr>
            )}
            
            <tr className="border-b border-[#F0F0F0]">
              <th className="text-left py-2 px-3 text-[16px] font-medium text-[#222222] border border-[#F0F0F0]">
                Shipping
              </th>
              <td className="text-right py-2 px-3 text-[16px] font-medium border border-[#F0F0F0]">
                {shippingTotal > 0 ? (
                  convertToLocale({ amount: shippingTotal, currency_code: currencyCode })
                ) : (
                  <span className="text-green-600">Free</span>
                )}
              </td>
            </tr>
            
            {taxTotal > 0 && (
              <tr className="border-b border-[#F0F0F0]">
                <th className="text-left py-2 px-3 text-[16px] font-medium text-[#222222] border border-[#F0F0F0]">
                  Taxes
                </th>
                <td className="text-right py-2 px-3 text-[16px] font-medium border border-[#F0F0F0]">
                  {convertToLocale({ amount: taxTotal, currency_code: currencyCode })}
                </td>
              </tr>
            )}
            
            <tr>
              <th className="text-left py-2 px-3 text-[16px] font-bold text-[#222222] border border-[#F0F0F0]">
                Total
              </th>
              <td className="text-right py-2 px-3 text-[16px] font-bold text-[#222222] border border-[#F0F0F0]">
                <span className="amount">
                  {convertToLocale({ amount: total, currency_code: currencyCode })}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div className="mt-4">
          <button
            onClick={onCheckout}
            disabled={isCheckoutDisabled}
            className="ayur-btn w-full min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
