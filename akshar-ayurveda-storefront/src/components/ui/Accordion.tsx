import React, { useState } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  variant?: 'default' | 'bordered' | 'separated';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onItemToggle?: (itemId: string, isOpen: boolean) => void;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
  variant = 'default',
  size = 'md',
  className = '',
  onItemToggle,
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (itemId: string) => {
    const isCurrentlyOpen = openItems.includes(itemId);
    
    if (allowMultiple) {
      const newOpenItems = isCurrentlyOpen
        ? openItems.filter(id => id !== itemId)
        : [...openItems, itemId];
      setOpenItems(newOpenItems);
    } else {
      setOpenItems(isCurrentlyOpen ? [] : [itemId]);
    }
    
    onItemToggle?.(itemId, !isCurrentlyOpen);
  };

  const getItemClasses = (isOpen: boolean, isDisabled: boolean) => {
    const baseClasses = 'transition-all duration-200';
    
    const variantClasses = {
      default: 'border border-gray-200 rounded-lg',
      bordered: 'border border-gray-200 rounded-lg',
      separated: 'border-b border-gray-200 last:border-b-0',
    };

    const stateClasses = isDisabled 
      ? 'opacity-50 cursor-not-allowed' 
      : isOpen 
        ? 'shadow-md' 
        : 'hover:shadow-sm';

    return `${baseClasses} ${variantClasses[variant]} ${stateClasses}`;
  };

  const getHeaderClasses = (isOpen: boolean, isDisabled: boolean) => {
    const baseClasses = 'w-full flex items-center justify-between p-4 text-left font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2';
    
    const sizeClasses = {
      sm: 'p-3 text-sm',
      md: 'p-4 text-base',
      lg: 'p-6 text-lg',
    };

    const stateClasses = isDisabled 
      ? 'text-gray-400 cursor-not-allowed' 
      : isOpen 
        ? 'text-green-600 bg-green-50' 
        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50';

    return `${baseClasses} ${sizeClasses[size]} ${stateClasses}`;
  };

  const getContentClasses = () => {
    const sizeClasses = {
      sm: 'px-3 pb-3',
      md: 'px-4 pb-4',
      lg: 'px-6 pb-6',
    };

    return `${sizeClasses[size]} text-gray-600`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        
        return (
          <div key={item.id} className={getItemClasses(isOpen, item.disabled || false)}>
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              className={getHeaderClasses(isOpen, item.disabled || false)}
              disabled={item.disabled}
              aria-expanded={isOpen}
            >
              <span>{item.title}</span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isOpen && (
              <div className={getContentClasses()}>
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
