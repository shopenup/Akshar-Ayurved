import React from 'react';
import Image from 'next/image';
import CompressedImage from '@components/CompressedImageClient';
import { convertToLocale } from '@lib/util/money';

interface CartTableProps {
  items: any[];
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onRemoveItem: (lineId: string) => void;
  isUpdating: boolean;
}

export default function CartTable({ items, onUpdateQuantity, onRemoveItem, isUpdating }: CartTableProps) {
  // Compute totals
  const totals = items.reduce(
    (acc, item) => {
      const price = item.variant?.calculated_price?.calculated_amount || 0
      const qty = item.quantity || 0
      return {
        qty: acc.qty + qty,
        amount: acc.amount + price * qty,
        currency: item.variant?.calculated_price?.currency_code || acc.currency || 'INR',
      }
    },
    { qty: 0, amount: 0, currency: 'INR' as string }
  )

  return (
    <div className="rounded-[10px] text-center">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="bg-[#CD8973] text-white text-center py-3 px-2 rounded-tl-[10px] w-[60px] min-w-[60px]">S.No.</th>
              <th className="bg-[#CD8973] text-white text-center py-3 px-2 w-[120px] min-w-[120px]">Product Image</th>
              <th className="bg-[#CD8973] text-white text-center py-3 px-2 w-[200px] min-w-[200px]">Product Name</th>
              <th className="bg-[#CD8973] text-white text-center py-3 px-2 w-[100px] min-w-[100px]">Unit Price</th>
              <th className="bg-[#CD8973] text-white text-center py-3 px-2 w-[100px] min-w-[100px]">Quantity</th>
              <th className="bg-[#CD8973] text-white text-center py-3 px-2 w-[100px] min-w-[100px]">Total</th>
              <th className="bg-[#CD8973] text-white text-center py-3 px-2 rounded-tr-[10px] w-[80px] min-w-[80px]">Remove</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const product = item.variant?.product || null;
              const price = item.variant?.calculated_price?.calculated_amount || 0;
              const originalPrice = item.variant?.calculated_price?.original_amount || 0;
              const currencyCode = item.variant?.calculated_price?.currency_code || 'INR';
              const image = product?.thumbnail || '';
              const productName = product?.title || 'Product';

              return (
                <tr key={item.id}>
                  <td className="text-center border border-[#F0F0F0] py-3 px-2 text-[16px] font-medium text-[#797979] align-middle min-w-[60px]">
                    {index + 1}
                  </td>
                  <td className="text-center border border-[#F0F0F0] py-3 px-2 align-top min-w-[120px]">
                    <div className="w-[60px] h-[60px] mx-auto relative overflow-hidden rounded-[5px]">
                      {image ? (
                        <CompressedImage
                          src={image}
                          alt={productName}
                          fill
                          useCase="card"
                          className="object-cover w-full h-full"
                          sizes="60px"
                          width={60}
                          height={60}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-center border border-[#F0F0F0] py-3 px-2 align-middle min-w-[200px]">
                    <h2 className="text-[16px] font-medium text-[#222222] break-words">
                      {productName}
                    </h2>
                  </td>
                  <td className="text-center border border-[#F0F0F0] py-3 px-2 text-[16px] font-medium text-[#797979] align-middle min-w-[100px]">
                    {convertToLocale({ amount: price, currency_code: currencyCode })}
                  </td>
                  <td className="text-center border border-[#F0F0F0] py-3 px-2 min-w-[100px]">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center border border-[#FFEBE4] rounded-[5px] overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isUpdating || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#f7f2ee] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <div className="w-12 h-8 flex items-center justify-center bg-white border-l border-r border-[#FFEBE4]">
                          <span className="text-[16px] font-medium text-[#797979]">
                            {item.quantity}
                          </span>
                        </div>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#f7f2ee] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="text-center border border-[#F0F0F0] py-3 px-2 text-[16px] font-medium text-[#797979] align-middle min-w-[100px]">
                    {convertToLocale({ 
                      amount: price * item.quantity, 
                      currency_code: currencyCode 
                    })}
                  </td>
                  <td className="text-center border border-[#F0F0F0] py-3 px-2 min-w-[80px]">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      disabled={isUpdating}
                      className="hover:opacity-70 disabled:opacity-50"
                    >
                      <Image 
                        src="/assets/images/delete.png" 
                        alt="delete" 
                        width={20} 
                        height={20}
                        className="object-cover"
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
            {/* Totals row at the end */}
            <tr>
              <td colSpan={4} className="text-right border border-[#F0F0F0] py-3 px-2 text-[16px] font-semibold text-[#222222] bg-[#f7f2ee] min-w-[60px]">
                Totals
              </td>
              <td className="text-center border border-[#F0F0F0] py-3 px-2 text-[16px] font-semibold text-[#222222] bg-[#f7f2ee] min-w-[100px]">
                {totals.qty}
              </td>
              <td className="text-center border border-[#F0F0F0] py-3 px-2 text-[16px] font-semibold text-[#222222] bg-[#f7f2ee] min-w-[100px]">
                {convertToLocale({ amount: totals.amount, currency_code: totals.currency })}
              </td>
              <td className="text-center border border-[#F0F0F0] py-3 px-2 bg-[#f7f2ee] min-w-[80px]">
                {/* empty for remove column spacing */}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
