import React, { useState, useEffect, useMemo } from "react";
import Button from "@components/ui/Button";
import Badge from "@components/ui/Badge";

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
  className = "",
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Initialize selectedOptions based on selectedVariant or defaults
  useEffect(() => {
    if (!variants.length || !options.length) return;

    const initialOptions: Record<string, string> = {};

    if (selectedVariant && selectedVariant.options) {
      selectedVariant.options.forEach((opt) => {
        if (opt.option_id && opt.value) {
          initialOptions[opt.option_id] = opt.value;
        }
      });
    } else if (variants.length === 1 && variants[0].options) {
      variants[0].options.forEach((opt) => {
        if (opt.option_id && opt.value) {
          initialOptions[opt.option_id] = opt.value;
        }
      });
    } else {
      // Pick the first value of each option as default
      options.forEach((opt) => {
        if (opt.values && opt.values.length > 0) {
          initialOptions[opt.id] = opt.values[0].value;
        }
      });
    }

    setSelectedOptions(initialOptions);
  }, [variants, options, selectedVariant]);

  // Find matching variant based on selectedOptions
  const matchingVariant = useMemo(() => {
    if (!variants.length || !Object.keys(selectedOptions).length) return null;

    return variants.find((variant) => {
      if (!variant.options) return false;
      const map = variant.options.reduce<Record<string, string>>((acc, opt) => {
        if (opt.option_id && opt.value) acc[opt.option_id] = opt.value;
        return acc;
      }, {});
      return Object.keys(selectedOptions).every(
        (key) => map[key] === selectedOptions[key]
      );
    }) || null;
  }, [variants, selectedOptions]);

  // Notify parent when variant changes
  // useEffect(() => {
  //   onVariantChange(matchingVariant);

  //   if (matchingVariant && onImageChange) {
  //     onImageChange(0); // Reset to first image for variant
  //   }
  // }, [matchingVariant, onVariantChange, onImageChange]);
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

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }));
  };

  const isColorOption = (title: string) => {
    return ["color", "colour", "shade", "hue"].some((k) =>
      title.toLowerCase().includes(k)
    );
  };

  const getColorCode = (value: string) => {
    const map: Record<string, string> = {
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
    return map[value.toLowerCase()] || "#6b7280";
  };

  const getAvailableValues = (optionId: string) => {
    if (!variants.length) return [];
    const avail = variants.filter((variant) => {
      if (!variant.options) return false;
      return Object.keys(selectedOptions).every((key) => {
        if (key === optionId) return true;
        const vOpt = variant.options?.find((o) => o.option_id === key);
        return vOpt?.value === selectedOptions[key];
      });
    });

    const setValues = new Set<string>();
    avail.forEach((v) => {
      const o = v.options?.find((o) => o.option_id === optionId);
      if (o?.value) setValues.add(o.value);
    });

    return Array.from(setValues);
  };

  if (!variants.length || !options.length) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {options.map((option) => {
        const availableValues = getAvailableValues(option.id);
        const isDisabled = availableValues.length === 0;

        return (
          <div key={option.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900">
                {option.title}{" "}
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
              {availableValues.map((value) => {
                const isSelected = selectedOptions[option.id] === value;
                const isColor = isColorOption(option.title);

                if (isColor) {
                  return (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(option.id, value)}
                      disabled={isDisabled}
                      className={`relative w-12 h-12 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-green-600 ring-2 ring-green-200"
                          : "border-gray-300 hover:border-green-300"
                      } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      style={{ backgroundColor: getColorCode(value) }}
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
                    </button>
                  );
                } else {
                  return (
                    <Button
                      key={value}
                      variant={isSelected ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handleOptionChange(option.id, value)}
                      disabled={isDisabled}
                      
                      className={`min-w-[60px] h-10 px-3 text-sm font-medium transition-all  ${
                        isSelected
                          ? "bg-green-600 text-white border-green-600 border-gray-500"
                          : "border !border-gray-500 bg-white  !text-gray-700 hover:!bg-transparent"
                      }`}
                    >
                      {value}
                    </Button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}

      {matchingVariant && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Selected Variant</p>
              <p className="text-xs text-green-700">
                SKU: {matchingVariant.sku || "N/A"}
              </p>
            </div>
            {matchingVariant.calculated_price && (
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  ₹{matchingVariant.calculated_price.calculated_amount}
                </p>
                {matchingVariant.calculated_price.original_amount &&
                  matchingVariant.calculated_price.original_amount >
                    matchingVariant.calculated_price.calculated_amount && (
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
