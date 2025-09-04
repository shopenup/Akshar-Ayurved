import React from 'react';

interface ProductFilterProps {
  categories?: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export default function ProductFilter({
  categories = [],
  selectedCategory,
  onCategoryChange,
  className = ""
}: ProductFilterProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories?.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === category
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category === 'all' ? 'All Categories' : category}
        </button>
      ))}
    </div>
  );
}
