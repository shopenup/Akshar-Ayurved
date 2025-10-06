import React from 'react';
import { convertToLocale } from '@lib/util/money';
import { HttpTypes } from '@shopenup/types';

interface ProductTaxBreakdownProps {
  item: HttpTypes.StoreOrderLineItem;
  currencyCode: string;
  className?: string;
  showDetailedBreakdown?: boolean;
}

export const ProductTaxBreakdown: React.FC<ProductTaxBreakdownProps> = ({
  item,
  currencyCode,
  className = "",
  showDetailedBreakdown = true
}) => {
  // Calculate tax percentage
  const subtotal = item.subtotal || 0;
  // Calculate discount from adjustments array
  const discount = item.adjustments?.reduce((sum, adj) => sum + (adj.amount || 0), 0) || 0;
  const discountedAmount = subtotal - discount;
  const taxTotal = item.tax_total || 0;
  
  // Calculate tax percentage from actual tax lines if available, otherwise fallback to calculation
  let taxPercentage = 0;
  
  if (item.tax_lines && item.tax_lines.length > 0) {
    // Use actual tax rates from tax lines
    taxPercentage = item.tax_lines.reduce((sum, taxLine) => sum + (taxLine.rate || 0), 0);
  } else {
    // Fallback to calculated percentage
    taxPercentage = subtotal > 0 ? ((taxTotal / subtotal) * 100) : 0;
  }
  
  const formattedPercentage = taxPercentage > 0 ? `${taxPercentage.toFixed(1)}%` : "0%";
  
  const formattedTaxTotal = convertToLocale({ 
    amount: taxTotal, 
    currency_code: currencyCode 
  });

  const formattedSubtotal = convertToLocale({ 
    amount: subtotal, 
    currency_code: currencyCode 
  });

  const formattedDiscount = convertToLocale({ 
    amount: discount, 
    currency_code: currencyCode 
  });

  const formattedDiscountedAmount = convertToLocale({ 
    amount: discountedAmount, 
    currency_code: currencyCode 
  });

  return (
    <div className={`${className}`}>
      {/* Compact Table Layout */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">After Discount</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax ({formattedPercentage})</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-medium">T</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                  {formattedSubtotal}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-right text-sm">
                  {discount > 0 ? (
                    <span className="text-green-600 font-medium">-{formattedDiscount}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {formattedDiscountedAmount}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                  {formattedTaxTotal}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-bold text-green-600">
                  {convertToLocale({ 
                    amount: item.total || 0, 
                    currency_code: currencyCode 
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Detailed Tax Breakdown - Collapsible */}
        {showDetailedBreakdown && ((item.tax_lines?.length || 0) > 0 || (item.adjustments?.length || 0) > 0) && (
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="px-3 py-2">
              <details className="group">
                <summary className="cursor-pointer text-xs font-medium text-gray-600 hover:text-gray-800 flex items-center justify-between">
                  <span>View Tax & Discount Details</span>
                  <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-3 space-y-3">
                  {/* Tax Lines */}
                  {item.tax_lines && item.tax_lines.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Tax Breakdown:</h5>
                      <div className="space-y-1">
                        {item.tax_lines.map((taxLine, index) => {
                          const taxRate = taxLine.rate || 0;
                          const taxAmount = taxLine.total || 0;
                          const formattedTaxAmount = convertToLocale({ 
                            amount: taxAmount, 
                            currency_code: currencyCode 
                          });

                          return (
                            <div key={index} className="flex justify-between items-center text-xs bg-white rounded px-2 py-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600">{taxLine.description || taxLine.code}:</span>
                                <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                                  {taxRate.toFixed(1)}%
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">{formattedTaxAmount}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Discount Details */}
                  {item.adjustments && item.adjustments.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Discount Details:</h5>
                      <div className="space-y-1">
                        {item.adjustments.map((adjustment, index) => {
                          const adjustmentAmount = adjustment.amount || 0;
                          const formattedAdjustmentAmount = convertToLocale({ 
                            amount: adjustmentAmount, 
                            currency_code: currencyCode 
                          });

                          return (
                            <div key={index} className="flex justify-between items-center text-xs bg-green-50 border border-green-200 rounded px-2 py-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-green-700">
                                  {adjustment.description || adjustment.code || 'Discount'}:
                                </span>
                              </div>
                              <span className="font-medium text-green-800">-{formattedAdjustmentAmount}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Summary component for order-level tax display
interface OrderTaxSummaryProps {
  order: HttpTypes.StoreOrder;
  className?: string;
}

export const OrderTaxSummary: React.FC<OrderTaxSummaryProps> = ({
  order,
  className = ""
}) => {
  const itemTaxTotal = order.item_tax_total || 0;
  const shippingTaxTotal = order.shipping_tax_total || 0;
  const totalTax = itemTaxTotal + shippingTaxTotal;
  
  const subtotal = order.original_item_subtotal || order.subtotal || 0;
  const discount = (order as any).discount_subtotal || 0;
  const discountedAmount = subtotal - discount;
  
  // Collect all tax lines from all order items to calculate real tax percentage
  const allTaxLines = order.items && Array.isArray(order.items)
    ? order.items.flatMap(item => item.tax_lines || [])
    : [];

  // Group tax lines by code to avoid duplicates and sum rates
  const uniqueTaxLines = allTaxLines.reduce((acc, taxLine) => {
    const code = taxLine.code || taxLine.description || 'unknown';
    if (!acc[code]) {
      acc[code] = {
        ...taxLine,
        rate: taxLine.rate || 0
      };
    }
    return acc;
  }, {} as Record<string, any>);

  // Convert to array for tax percentage calculation
  const taxLinesArray = Object.values(uniqueTaxLines);
  
  // Calculate tax percentage from actual tax lines if available, otherwise fallback to calculation
  let taxPercentage = 0;
  
  if (taxLinesArray.length > 0) {
    // Use actual tax rates from tax lines
    taxPercentage = taxLinesArray.reduce((sum, taxLine) => sum + (taxLine.rate || 0), 0);
  } else {
    // Fallback to calculated percentage
    taxPercentage = subtotal > 0 ? ((totalTax / subtotal) * 100) : 0;
  }
  
  const formattedPercentage = taxPercentage > 0 ? `${taxPercentage.toFixed(1)}%` : "0%";
  
  const formattedTotalTax = convertToLocale({ 
    amount: totalTax, 
    currency_code: order.currency_code 
  });

  const formattedItemTax = convertToLocale({ 
    amount: itemTaxTotal, 
    currency_code: order.currency_code 
  });

  const formattedShippingTax = convertToLocale({ 
    amount: shippingTaxTotal, 
    currency_code: order.currency_code 
  });

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Total Tax Summary */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-semibold">Total Tax:</span>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {formattedPercentage}
            </span>
          </div>
          <span className="font-bold text-lg text-blue-800">{formattedTotalTax}</span>
        </div>
      </div>

      {/* Tax Breakdown */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Tax Breakdown:</h4>
        <div className="space-y-2">
          {itemTaxTotal > 0 && (
            <div className="flex justify-between items-center text-sm bg-white border rounded-lg p-2">
              <span className="text-gray-600">Item Tax:</span>
              <span className="font-medium text-gray-900">{formattedItemTax}</span>
            </div>
          )}
          {shippingTaxTotal > 0 && (
            <div className="flex justify-between items-center text-sm bg-white border rounded-lg p-2">
              <span className="text-gray-600">Shipping Tax:</span>
              <span className="font-medium text-gray-900">{formattedShippingTax}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
