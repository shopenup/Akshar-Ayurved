import React from 'react';
import { convertToLocale } from '@lib/util/money';
import { HttpTypes } from '@shopenup/types';

interface OrderItemsTaxTableProps {
  order: HttpTypes.StoreOrder;
  className?: string;
  showDetailedBreakdown?: boolean;
}

export const OrderItemsTaxTable: React.FC<OrderItemsTaxTableProps> = ({
  order,
  className = "",
  showDetailedBreakdown = true
}) => {
  if (!order.items || order.items.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">After Discount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item, index) => {
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

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {item.thumbnail || item.variant?.product?.thumbnail ? (
                            <img 
                              className="h-10 w-10 rounded-lg object-cover border"
                              src={item.thumbnail || item.variant?.product?.thumbnail || ''}
                              alt={item.title}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-400 text-xs font-medium">IMG</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          {item.variant_title && (
                            <div className="text-xs text-gray-500">{item.variant_title}</div>
                          )}
                          {item.variant_sku && (
                            <div className="text-xs text-gray-400">SKU: {item.variant_sku}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {convertToLocale({ 
                        amount: item.unit_price || 0, 
                        currency_code: order.currency_code 
                      })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {convertToLocale({ 
                        amount: subtotal, 
                        currency_code: order.currency_code 
                      })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      {discount > 0 ? (
                        <span className="text-green-600 font-medium">
                          -{convertToLocale({ 
                            amount: discount, 
                            currency_code: order.currency_code 
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {convertToLocale({ 
                        amount: discountedAmount, 
                        currency_code: order.currency_code 
                      })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex flex-col items-end">
                        <span className="text-gray-900 font-medium">
                          {convertToLocale({ 
                            amount: taxTotal, 
                            currency_code: order.currency_code 
                          })}
                        </span>
                        <span className="text-xs text-gray-500">({formattedPercentage})</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                      {convertToLocale({ 
                        amount: item.total || 0, 
                        currency_code: order.currency_code 
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              {/* Items Summary */}
              <tr>
                <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900">
                  Items Subtotal
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {convertToLocale({ 
                    amount: order.original_item_subtotal || order.subtotal || 0, 
                    currency_code: order.currency_code 
                  })}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                  -{convertToLocale({ 
                    amount: (order as any).discount_subtotal || 0, 
                    currency_code: order.currency_code 
                  })}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {convertToLocale({ 
                    amount: (order.original_item_subtotal || order.subtotal || 0) - ((order as any).discount_subtotal || 0), 
                    currency_code: order.currency_code 
                  })}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {convertToLocale({ 
                    amount: order.item_tax_total || 0, 
                    currency_code: order.currency_code 
                  })}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {convertToLocale({ 
                    amount: (order.original_item_subtotal || order.subtotal || 0) - ((order as any).discount_subtotal || 0) + (order.item_tax_total || 0), 
                    currency_code: order.currency_code 
                  })}
                </td>
              </tr>
              
              {/* Shipping Row */}
              <tr>
                <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900">
                  Shipping
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {convertToLocale({ 
                    amount: order.shipping_subtotal || 0, 
                    currency_code: order.currency_code 
                  })}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-400">
                  -
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {convertToLocale({ 
                    amount: order.shipping_subtotal || 0, 
                    currency_code: order.currency_code 
                  })}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {convertToLocale({ 
                    amount: order.shipping_tax_total || 0, 
                    currency_code: order.currency_code 
                  })}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {convertToLocale({ 
                    amount: (order.shipping_subtotal || 0) + (order.shipping_tax_total || 0), 
                    currency_code: order.currency_code 
                  })}
                </td>
              </tr>
              
              {/* Total Row */}
              <tr className="bg-green-50 border-t-2 border-green-200">
                <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900">
                  Order Total
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  {convertToLocale({ 
                    amount: (order.original_item_subtotal || order.subtotal || 0) + (order.shipping_subtotal || 0), 
                    currency_code: order.currency_code 
                  })}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                  -{convertToLocale({ 
                    amount: (order as any).discount_subtotal || 0, 
                    currency_code: order.currency_code 
                  })}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  {convertToLocale({ 
                    amount: ((order.original_item_subtotal || order.subtotal || 0) + (order.shipping_subtotal || 0)) - ((order as any).discount_subtotal || 0), 
                    currency_code: order.currency_code 
                  })}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  {convertToLocale({ 
                    amount: (order.item_tax_total || 0) + (order.shipping_tax_total || 0), 
                    currency_code: order.currency_code 
                  })}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-green-600 text-lg">
                  {convertToLocale({ 
                    amount: order.total || 0, 
                    currency_code: order.currency_code 
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Detailed Tax Breakdown - Collapsible */}
        {showDetailedBreakdown && (
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="px-4 py-3">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center justify-between">
                  <span>View Detailed Tax Breakdown</span>
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 space-y-4">
                  {/* Items Tax Breakdown */}
                  {order.items.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg border p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">{item.title}</h5>
                      
                      {/* Tax Lines */}
                      {item.tax_lines && item.tax_lines.length > 0 && (
                        <div className="mb-3">
                          <h6 className="text-xs font-medium text-gray-700 mb-2">Tax Breakdown:</h6>
                          <div className="space-y-1">
                            {item.tax_lines.map((taxLine, taxIndex) => {
                              const taxRate = taxLine.rate || 0;
                              const taxAmount = taxLine.total || 0;
                              const formattedTaxAmount = convertToLocale({ 
                                amount: taxAmount, 
                                currency_code: order.currency_code 
                              });

                              return (
                                <div key={taxIndex} className="flex justify-between items-center text-xs bg-gray-50 rounded px-2 py-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-600">{taxLine.description || taxLine.code}:</span>
                                    <span className="text-gray-500 bg-white px-1.5 py-0.5 rounded text-xs">
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
                          <h6 className="text-xs font-medium text-gray-700 mb-2">Discount Details:</h6>
                          <div className="space-y-1">
                            {item.adjustments.map((adjustment, adjIndex) => {
                              const adjustmentAmount = adjustment.amount || 0;
                              const formattedAdjustmentAmount = convertToLocale({ 
                                amount: adjustmentAmount, 
                                currency_code: order.currency_code 
                              });

                              return (
                                <div key={adjIndex} className="flex justify-between items-center text-xs bg-green-50 border border-green-200 rounded px-2 py-1">
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
                  ))}

                  {/* Shipping Tax Breakdown */}
                  {order.shipping_methods && order.shipping_methods.length > 0 && order.shipping_methods[0].tax_lines && order.shipping_methods[0].tax_lines.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Shipping Tax Breakdown</h5>
                      <div className="space-y-1">
                        {order.shipping_methods[0].tax_lines.map((taxLine, taxIndex) => {
                          const taxRate = taxLine.rate || 0;
                          const taxAmount = taxLine.total || 0;
                          const formattedTaxAmount = convertToLocale({ 
                            amount: taxAmount, 
                            currency_code: order.currency_code 
                          });

                          return (
                            <div key={taxIndex} className="flex justify-between items-center text-xs bg-gray-50 rounded px-2 py-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600">{taxLine.description || taxLine.code}:</span>
                                <span className="text-gray-500 bg-white px-1.5 py-0.5 rounded text-xs">
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
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
