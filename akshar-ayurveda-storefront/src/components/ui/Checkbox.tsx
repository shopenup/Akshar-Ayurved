import React from 'react';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'modern' | 'minimal';
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  label,
  name,
  disabled = false,
  required = false,
  className = '',
  size = 'md',
  variant = 'modern',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'modern':
        return `relative ${sizeClasses[size]} appearance-none border-2 rounded-md transition-all duration-200 ${
          checked 
            ? 'bg-[#cd8973] border-[#cd8973] shadow-sm' 
            : 'bg-white border-gray-300 hover:border-[#cd8973]/50'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'
        } focus:outline-none focus:ring-2 focus:ring-[#cd8973]/20 focus:ring-offset-1`;
      case 'minimal':
        return `relative ${sizeClasses[size]} appearance-none border-2 rounded-full transition-all duration-200 ${
          checked 
            ? 'bg-[#cd8973] border-[#cd8973]' 
            : 'bg-white border-gray-300 hover:border-[#cd8973]/50'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'
        } focus:outline-none focus:ring-2 focus:ring-[#cd8973]/20 focus:ring-offset-1`;
      default:
        return `relative ${sizeClasses[size]} appearance-none border-2 rounded transition-all duration-200 ${
          checked 
            ? 'bg-[#cd8973] border-[#cd8973]' 
            : 'bg-white border-gray-300 hover:border-[#cd8973]/50'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'
        } focus:outline-none focus:ring-2 focus:ring-[#cd8973]/20 focus:ring-offset-1`;
    }
  };

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={getVariantClasses()}
        />
        {checked && (
          <svg 
            className="absolute inset-0 w-full h-full text-white pointer-events-none flex items-center justify-center" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </div>
      {label && (
        <label className={`${labelSizeClasses[size]} text-gray-700 leading-tight ${disabled ? 'opacity-50' : 'cursor-pointer'} select-none`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
    </div>
  );
};

export default Checkbox;

// Enhanced UI Components for React Aria Checkbox
export const UiCheckbox: React.FC<React.PropsWithChildren<{ 
  isSelected?: boolean;
  isDisabled?: boolean;
  className?: string;
  onPress?: () => void;
  variant?: 'default' | 'modern' | 'minimal' | 'card';
}>> = ({ 
  children, 
  className = '',
  onPress,
  variant = 'modern'
}) => {
  const baseClasses = "flex items-center gap-3 transition-all duration-200";
  const cardClasses = variant === 'card' 
    ? "p-4 border-2 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200" 
    : "";
  
  return (
    <div 
      className={`${baseClasses} ${cardClasses} ${className}`}
      onClick={onPress}
    >
      {children}
    </div>
  );
};

export const UiCheckboxBox: React.FC<{ 
  className?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  variant?: 'default' | 'modern' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}> = ({ 
  className = '',
  isSelected = false,
  isDisabled = false,
  variant = 'modern',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'modern':
        return `relative ${sizeClasses[size]} appearance-none border-2 rounded-md transition-all duration-200 ${
          isSelected 
            ? 'bg-[#cd8973] border-[#cd8973] shadow-sm' 
            : 'bg-white border-gray-300 hover:border-[#cd8973]/50'
        } ${
          isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'
        } focus:outline-none focus:ring-2 focus:ring-[#cd8973]/20 focus:ring-offset-1`;
      case 'minimal':
        return `relative ${sizeClasses[size]} appearance-none border-2 rounded-full transition-all duration-200 ${
          isSelected 
            ? 'bg-[#cd8973] border-[#cd8973]' 
            : 'bg-white border-gray-300 hover:border-[#cd8973]/50'
        } ${
          isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'
        } focus:outline-none focus:ring-2 focus:ring-[#cd8973]/20 focus:ring-offset-1`;
      default:
        return `relative ${sizeClasses[size]} appearance-none border-2 rounded transition-all duration-200 ${
          isSelected 
            ? 'bg-[#cd8973] border-[#cd8973]' 
            : 'bg-white border-gray-300 hover:border-[#cd8973]/50'
        } ${
          isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'
        } focus:outline-none focus:ring-2 focus:ring-[#cd8973]/20 focus:ring-offset-1`;
    }
  };

  return (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        checked={isSelected}
        disabled={isDisabled}
        className={`checkbox-circle ${getVariantClasses()}`}
        readOnly
      />
      {isSelected && (
        <svg 
          className="absolute inset-0 w-full h-full text-white pointer-events-none flex items-center justify-center" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          style={{
            color: '#CD8973',
          }}
        >
          <path 
            fillRule="evenodd" 
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
            clipRule="evenodd" 
          />
        </svg>
      )}
    </div>
  );
};

export const UiCheckboxIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
  <svg className={`${className} text-white`} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export const UiCheckboxLabel: React.FC<React.PropsWithChildren<{ 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}>> = ({ 
  children, 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <label className={`${sizeClasses[size]} text-gray-700 leading-tight cursor-pointer select-none ${className}`}>
      {children}
    </label>
  );
};

// New Card-style checkbox for payment methods
export const UiCheckboxCard: React.FC<{
  isSelected?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({
  isSelected = false,
  isDisabled = false,
  onPress,
  className = '',
  children
}) => (
  <div 
    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
      isSelected 
        ? 'border-[#cd8973] bg-[#cd8973]/5 shadow-md' 
        : 'border-gray-200 hover:border-[#cd8973]/30 hover:shadow-sm'
    } ${
      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
    } ${className}`}
    onClick={onPress}
  >
    <div className="flex items-center gap-3">
      <UiCheckboxBox 
        isSelected={isSelected} 
        isDisabled={isDisabled}
        variant="modern"
        size="md"
      />
      <div className="flex-1">
        {children}
      </div>
    </div>
  </div>
);
