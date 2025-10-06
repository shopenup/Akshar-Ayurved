import React, { useState, useEffect, useMemo } from 'react';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';

interface ProductVariant {
  id: string;
  sku?: string;
  calculated_price?: {
    calculated_amount: number;
    original_amount?: number;
    currency_code: string;
  };
  options?: Array<{
    option_id: string;
    value: string;
  }>;
  prices?: Array<{
    amount?: number;
    original_amount?: number;
  }>;
}

interface ProductOption {
  id: string;
  title: string;
  values?: Array<{
    value: string;
  }>;
}

interface ProductVariantSelectorProps {
  variants?: ProductVariant[];
  options?: ProductOption[];
  selectedVariant?: ProductVariant | null;
  onVariantChange: (variant: ProductVariant | null) => void;
  onImageChange?: (imageIndex: number) => void;
  className?: string;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants = [],
  options = [],
  selectedVariant,
  onVariantChange,
  onImageChange,
  className = ''
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Initialize selected options when component mounts or variants change
  useEffect(() => {
    if (variants.length > 0 && options.length > 0) {
      const initialOptions: Record<string, string> = {};
      
      // If there's only one variant, preselect its options
      if (variants.length === 1) {
        const variant = variants[0];
        if (variant.options) {
          variant.options.forEach(option => {
            if (option.option_id && option.value) {
              initialOptions[option.option_id] = option.value;
            }
          });
        }
      } else {
        // For multiple variants, try to find single-value options
        options.forEach(option => {
          if (option.values && option.values.length === 1) {
            initialOptions[option.id] = option.values[0].value;
          }
        });
      }
      
      setSelectedOptions(initialOptions);
    }
  }, [variants, options]);

  // Find the variant that matches the selected options
  const matchingVariant = useMemo(() => {
    if (!variants.length || !Object.keys(selectedOptions).length) {
      return null;
    }

    return variants.find(variant => {
      if (!variant.options) return false;
      
      const variantOptionsMap = variant.options.reduce((acc, opt) => {
        if (opt.option_id && opt.value) {
          acc[opt.option_id] = opt.value;
        }
        return acc;
      }, {} as Record<string, string>);

      return Object.keys(selectedOptions).every(optionId => 
        variantOptionsMap[optionId] === selectedOptions[optionId]
      );
    }) || null;
  }, [variants, selectedOptions]);

  // Update parent component when variant changes
  useEffect(() => {
    onVariantChange(matchingVariant);
    
    // If variant has specific images, switch to first image
    if (matchingVariant && onImageChange) {
      // You can add logic here to determine which image to show for this variant
      // For now, we'll just reset to the first image
      onImageChange(0);
    }
  }, [matchingVariant, onVariantChange, onImageChange]);

  // Handle option selection
  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  // Check if an option is a color option
  const isColorOption = (optionTitle: string) => {
    const colorKeywords = ['color', 'colour', 'shade', 'hue'];
    return colorKeywords.some(keyword => 
      optionTitle.toLowerCase().includes(keyword)
    );
  };

  // Get color code for a color value
  const getColorCode = (colorValue: string) => {
    const colorMap: Record<string, string> = {
      'red': '#ef4444',
      'blue': '#3b82f6',
      'green': '#22c55e',
      'yellow': '#eab308',
      'purple': '#a855f7',
      'pink': '#ec4899',
      'orange': '#f97316',
      'black': '#000000',
      'white': '#ffffff',
      'gray': '#6b7280',
      'grey': '#6b7280',
      'brown': '#a3a3a3',
      'navy': '#1e3a8a',
      'maroon': '#991b1b',
      'teal': '#0d9488',
      'indigo': '#4f46e5',
      'cyan': '#06b6d4',
      'lime': '#84cc16',
      'amber': '#f59e0b',
      'emerald': '#10b981',
      'rose': '#f43f5e',
      'violet': '#8b5cf6',
      'fuchsia': '#d946ef',
      'sky': '#0ea5e9',
      'slate': '#64748b',
      'zinc': '#71717a',
      'neutral': '#737373',
      'stone': '#78716c',
    };
    
    return colorMap[colorValue.toLowerCase()] || '#6b7280';
  };

  // Get available values for an option based on current selections
  const getAvailableValues = (optionId: string) => {
    if (!variants.length) return [];

    const availableVariants = variants.filter(variant => {
      if (!variant.options) return false;
      
      return Object.keys(selectedOptions).every(selectedOptionId => {
        if (selectedOptionId === optionId) return true; // Skip the current option being checked
        
        const variantOption = variant.options?.find(opt => opt.option_id === selectedOptionId);
        return variantOption?.value === selectedOptions[selectedOptionId];
      });
    });

    const values = new Set<string>();
    availableVariants.forEach(variant => {
      const option = variant.options?.find(opt => opt.option_id === optionId);
      if (option?.value) {
        values.add(option.value);
      }
    });

    return Array.from(values);
  };

  // Don't render if no variants or options
  if (!variants.length || !options.length) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {options.map(option => {
        const availableValues = getAvailableValues(option.id);
        const isDisabled = availableValues.length === 0;
        
        return (
          <div key={option.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900">
                {option.title}
                {selectedOptions[option.id] && (
                  <span className="text-gray-500 ml-2">
                    ({selectedOptions[option.id]})
                  </span>
                )}
              </label>
              {isDisabled && (
                <Badge variant="secondary" size="sm">
                  Not Available
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {availableValues.map(value => {
                const isSelected = selectedOptions[option.id] === value;
                const isOutOfStock = false; // You can add stock checking logic here
                const isColor = isColorOption(option.title);
                
                if (isColor) {
                  // Render color boxes for color options
                  const colorCode = getColorCode(value);
                  return (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(option.id, value)}
                      disabled={isDisabled || isOutOfStock}
                      className={`
                        relative w-12 h-12 rounded-lg border-2 transition-all duration-200
                        ${isSelected 
                          ? 'border-[#cc8972] ring-2 ring-[#cc8972]/20' 
                          : 'border-gray-300 hover:border-[#cc8972]/50'
                        }
                        ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      style={{ backgroundColor: colorCode }}
                      title={value}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg 
                            className="w-6 h-6 text-white drop-shadow-lg" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-0.5 bg-red-500 rotate-45"></div>
                        </div>
                      )}
                    </button>
                  );
                } else {
                  // Render regular buttons for non-color options
                  return (
                    <Button
                      key={value}
                      variant={isSelected ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handleOptionChange(option.id, value)}
                      disabled={isDisabled || isOutOfStock}
                      className={`
                        min-w-[60px] h-10 px-3 text-sm font-medium transition-all
                        ${isSelected 
                          ? 'bg-[#cc8972] text-white border-[#cc8972]' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#cc8972]/50'
                        }
                        ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {value}
                      {isOutOfStock && (
                        <span className="ml-1 text-xs">(Out of Stock)</span>
                      )}
                    </Button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}
      
      {/* Selected Variant Info */}
      {matchingVariant && (
        <div className="bg-[#f8f5f2] border border-[#cc8972] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#cc8972]">Selected Variant</p>
              <p className="text-xs text-[#cc8972]/80">
                SKU: {matchingVariant.sku || 'N/A'}
              </p>
            </div>
            {matchingVariant.calculated_price && (
              <div className="text-right">
                <p className="text-lg font-bold text-[#cc8972]">
                  ₹{matchingVariant.calculated_price.calculated_amount}
                </p>
                {matchingVariant.calculated_price.original_amount && 
                 matchingVariant.calculated_price.original_amount > matchingVariant.calculated_price.calculated_amount && (
                  <p className="text-sm text-gray-500 line-through">
                    ₹{matchingVariant.calculated_price.original_amount}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
