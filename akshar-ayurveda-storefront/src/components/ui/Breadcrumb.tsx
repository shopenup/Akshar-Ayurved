import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: 'slash' | 'chevron' | 'arrow' | 'dot';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = 'chevron',
  size = 'md',
  className = '',
  onItemClick,
}) => {
  const getSeparator = () => {
    switch (separator) {
      case 'slash':
        return <span className="text-gray-400">/</span>;
      case 'chevron':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        );
      case 'arrow':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        );
      case 'dot':
        return <span className="text-gray-400">•</span>;
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        );
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const getItemClasses = (isLast: boolean, isClickable: boolean) => {
    const baseClasses = 'flex items-center';
    const sizeClasses = getSizeClasses();
    
    if (isLast) {
      return `${baseClasses} ${sizeClasses} font-medium text-gray-900`;
    }
    
    if (isClickable) {
      return `${baseClasses} ${sizeClasses} text-gray-600 hover:text-green-600 transition-colors`;
    }
    
    return `${baseClasses} ${sizeClasses} text-gray-400`;
  };

  return (
    <nav className={`flex items-center space-x-2 ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isClickable = item.href && !isLast;
        
        return (
          <React.Fragment key={index}>
            <div className={getItemClasses(isLast, isClickable)}>
              {item.icon && <span className="mr-2">{item.icon}</span>}
              
              {isClickable ? (
                <Link 
                  href={item.href!}
                  onClick={() => onItemClick?.(item, index)}
                  className="hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
                >
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </div>
            
            {!isLast && (
              <div className="flex-shrink-0">
                {getSeparator()}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
