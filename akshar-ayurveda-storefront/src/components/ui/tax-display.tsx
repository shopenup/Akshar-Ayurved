import React from 'react';
import { convertToLocale } from '@lib/util/money';

interface TaxDisplayProps {
  taxAmount: number;
  subtotal: number;
  discount?: number;
  currencyCode: string;
  className?: string;
  showPercentage?: boolean;
  label?: string;
  taxLines?: any[];
}

// Helper function to calculate tax percentage from tax lines
const calculateTaxPercentageFromTaxLines = (taxLines: any[]): number => {
  if (!taxLines || taxLines.length === 0) return 0;
  
  // Sum up all the tax rates from tax lines
  const totalRate = taxLines.reduce((sum, taxLine) => {
    return sum + (taxLine.rate || 0);
  }, 0);
  
  return totalRate;
};

export const TaxDisplay: React.FC<TaxDisplayProps> = ({
  taxAmount,
  subtotal,
  discount = 0,
  currencyCode,
  className = "",
  showPercentage = true,
  label = "Tax",
  taxLines
}) => {
  
  // Calculate tax percentage from actual tax lines if available, otherwise fallback to calculation
  let taxPercentage = 0;
  
  if (taxLines && taxLines.length > 0) {
    // Use actual tax rates from tax lines
    taxPercentage = calculateTaxPercentageFromTaxLines(taxLines);
  } else {
    // Fallback to calculated percentage
    taxPercentage = subtotal > 0 ? ((taxAmount / subtotal) * 100) : 0;
  }
  
  // Format the percentage
  const formattedPercentage = taxPercentage > 0 ? `${taxPercentage.toFixed(1)}%` : "0%";
  
  // Format the amount
  const formattedAmount = convertToLocale({ 
    amount: taxAmount, 
    currency_code: currencyCode 
  });

  return (
    <div className={`flex justify-between text-sm ${className}`}>
      <div className="flex items-center">
        <span className="text-gray-600">{label}:</span>
        {showPercentage && taxPercentage > 0 && (
          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {formattedPercentage}
          </span>
        )}
      </div>
      <span className="font-semibold">{formattedAmount}</span>
    </div>
  );
};

// Enhanced version with breakdown
interface TaxBreakdownProps {
  itemTaxTotal: number;
  shippingTaxTotal: number;
  subtotal: number;
  discount?: number;
  currencyCode: string;
  className?: string;
  showBreakdown?: boolean;
  taxLines?: any[];
}

export const TaxBreakdown: React.FC<TaxBreakdownProps> = ({
  itemTaxTotal,
  shippingTaxTotal,
  subtotal,
  discount = 0,
  currencyCode,
  className = "",
  showBreakdown = true,
  taxLines
}) => {
  const totalTax = itemTaxTotal + shippingTaxTotal;
  
  // Calculate tax percentage from actual tax lines if available, otherwise fallback to calculation
  let taxPercentage = 0;
  
  if (taxLines && taxLines.length > 0) {
    // Use actual tax rates from tax lines
    taxPercentage = calculateTaxPercentageFromTaxLines(taxLines);
  } else {
    // Fallback to calculated percentage
    taxPercentage = subtotal > 0 ? ((totalTax / subtotal) * 100) : 0;
  }
  
  const formattedPercentage = taxPercentage > 0 ? `${taxPercentage.toFixed(1)}%` : "0%";
  
  const formattedTotalTax = convertToLocale({ 
    amount: totalTax, 
    currency_code: currencyCode 
  });

  const formattedItemTax = convertToLocale({ 
    amount: itemTaxTotal, 
    currency_code: currencyCode 
  });

  const formattedShippingTax = convertToLocale({ 
    amount: shippingTaxTotal, 
    currency_code: currencyCode 
  });

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Total Tax Line */}
      <div className="flex justify-between text-sm">
        <div className="flex items-center">
          <span className="text-gray-600">Tax:</span>
          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {formattedPercentage}
          </span>
        </div>
        <span className="font-semibold">{formattedTotalTax}</span>
      </div>

      {/* Breakdown (if enabled and there are multiple tax components) */}
      {showBreakdown && (itemTaxTotal > 0 || shippingTaxTotal > 0) && (
        <div className="ml-4 space-y-1 text-xs text-gray-500">
          {itemTaxTotal > 0 && (
            <div className="flex justify-between">
              <span>Item Tax:</span>
              <span>{formattedItemTax}</span>
            </div>
          )}
          {shippingTaxTotal > 0 && (
            <div className="flex justify-between">
              <span>Shipping Tax:</span>
              <span>{formattedShippingTax}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Simple tax badge component
interface TaxBadgeProps {
  taxAmount: number;
  subtotal: number;
  discount?: number;
  currencyCode: string;
  className?: string;
}

export const TaxBadge: React.FC<TaxBadgeProps> = ({
  taxAmount,
  subtotal,
  discount = 0,
  currencyCode,
  className = ""
}) => {
  const taxPercentage = subtotal > 0 ? ((taxAmount / subtotal) * 100) : 0;
  const formattedPercentage = taxPercentage > 0 ? `${taxPercentage.toFixed(1)}%` : "0%";
  
  return (
    <div className={`inline-flex items-center ${className}`}>
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        {formattedPercentage} Tax
      </span>
    </div>
  );
};
