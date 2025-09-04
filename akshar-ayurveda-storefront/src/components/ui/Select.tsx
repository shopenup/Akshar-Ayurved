import React from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  required = false,
  className = '',
  fullWidth = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '';
  
  const selectClasses = `block ${widthClass} ${sizeClasses[size]} border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${errorClass} ${disabledClass} ${className}`;
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        className={selectClasses}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// UI Components for React Aria Select
export const UiSelectButton: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-lg bg-white ${className}`}>
    {children}
  </div>
);

export const UiSelectValue: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ 
  children, 
  className = '' 
}) => (
  <span className={`flex-1 ${className}`}>
    {children}
  </span>
);

export const UiSelectIcon: React.FC = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export const UiSelectListBox: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto ${className}`}>
    {children}
  </div>
);

export const UiSelectListBoxItem: React.FC<React.PropsWithChildren<{ 
  id?: string;
  className?: string;
  onPress?: () => void;
}>> = ({ 
  children, 
  id,
  className = '',
  onPress
}) => (
  <div 
    id={id}
    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${className}`}
    onClick={onPress}
  >
    {children}
  </div>
);

export default Select;
