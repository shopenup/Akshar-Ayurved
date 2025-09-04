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

  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className={`${sizeClasses[size]} text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      />
      {label && (
        <label className={`ml-2 ${labelSizeClasses[size]} text-gray-700 ${disabled ? 'opacity-50' : ''}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
    </div>
  );
};

export default Checkbox;

// UI Components for React Aria Checkbox
export const UiCheckbox: React.FC<React.PropsWithChildren<{ 
  isSelected?: boolean;
  isDisabled?: boolean;
  className?: string;
  onPress?: () => void;
}>> = ({ 
  children, 
  isSelected = false,
  isDisabled = false,
  className = '',
  onPress
}) => (
  <div 
    className={`flex items-center gap-3 ${className}`}
    onClick={onPress}
  >
    {children}
  </div>
);

export const UiCheckboxBox: React.FC<{ 
  className?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
}> = ({ 
  className = '',
  isSelected = false,
  isDisabled = false
}) => (
  <input
    type="checkbox"
    checked={isSelected}
    disabled={isDisabled}
    className={`w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 ${
      isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    } ${className}`}
    readOnly
  />
);

export const UiCheckboxIcon: React.FC = () => (
  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export const UiCheckboxLabel: React.FC<React.PropsWithChildren<{ 
  className?: string;
}>> = ({ 
  children, 
  className = '' 
}) => (
  <label className={`ml-2 text-base text-gray-700 ${className}`}>
    {children}
  </label>
);
