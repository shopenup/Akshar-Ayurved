import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom' | 'inside';
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  labelPosition = 'top',
  animated = false,
  striped = false,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-600';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'md':
        return 'h-4';
      case 'lg':
        return 'h-6';
      default:
        return 'h-4';
    }
  };

  const getLabelClasses = () => {
    const baseClasses = 'text-sm font-medium';
    
    switch (variant) {
      case 'success':
        return `${baseClasses} text-green-600`;
      case 'warning':
        return `${baseClasses} text-yellow-600`;
      case 'danger':
        return `${baseClasses} text-red-600`;
      default:
        return `${baseClasses} text-blue-600`;
    }
  };

  const getProgressBarClasses = () => {
    const baseClasses = getVariantClasses();
    const animationClasses = animated ? 'animate-pulse' : '';
    const stripedClasses = striped ? 'bg-gradient-to-r from-transparent via-white to-transparent bg-[length:20px_100%] animate-pulse' : '';
    
    return `${baseClasses} ${animationClasses} ${stripedClasses} transition-all duration-300 ease-out`;
  };

  const renderLabel = () => {
    if (!showLabel) return null;

    const labelContent = `${Math.round(percentage)}%`;

    if (labelPosition === 'inside' && size !== 'sm') {
      return (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
          {labelContent}
        </span>
      );
    }

    return (
      <div className={`${labelPosition === 'top' ? 'mb-2' : 'mt-2'} ${getLabelClasses()}`}>
        {labelContent}
      </div>
    );
  };

  return (
    <div className={className}>
      {labelPosition === 'top' && renderLabel()}
      
      <div className={`relative bg-gray-200 rounded-full overflow-hidden ${getSizeClasses()}`}>
        <div
          className={`h-full rounded-full ${getProgressBarClasses()}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {labelPosition === 'inside' && size !== 'sm' && renderLabel()}
        </div>
      </div>
      
      {labelPosition === 'bottom' && renderLabel()}
    </div>
  );
};

export default Progress;
