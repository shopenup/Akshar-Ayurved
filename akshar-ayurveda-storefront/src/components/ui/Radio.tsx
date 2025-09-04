import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

const Radio: React.FC<RadioProps> = ({
  options,
  value,
  onChange,
  name,
  label,
  disabled = false,
  required = false,
  className = '',
  direction = 'vertical',
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

  const directionClasses = {
    horizontal: 'flex-row flex-wrap',
    vertical: 'flex-col',
  };

  const handleChange = (optionValue: string) => {
    if (!disabled) {
      onChange?.(optionValue);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className={`block ${labelSizeClasses[size]} font-medium text-gray-700 mb-2`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={`flex ${directionClasses[direction]} gap-3`}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => handleChange(option.value)}
              disabled={disabled || option.disabled}
              required={required}
              className={`${sizeClasses[size]} text-green-600 border-gray-300 focus:ring-green-500 focus:ring-2 ${
                disabled || option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            />
            <label className={`ml-2 ${labelSizeClasses[size]} text-gray-700 ${disabled || option.disabled ? 'opacity-50' : ''}`}>
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

// RadioGroup component that accepts children
interface RadioGroupProps {
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export const UiRadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  children,
  className = '',
  'aria-label': ariaLabel,
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`} role="radiogroup" aria-label={ariaLabel}>
      {children}
    </div>
  );
};

// UI Components for React Aria Radio
export const UiRadio: React.FC<React.PropsWithChildren<{ 
  value?: string;
  className?: string;
  onPress?: () => void;
  variant?: string;
}>> = ({ 
  children, 
  value,
  className = '',
  onPress,
  variant
}) => (
  <div 
    className={`flex items-center gap-3 ${className} ${variant === 'outline' ? 'border border-gray-200 rounded-lg p-4 hover:border-gray-300 cursor-pointer transition-all duration-200' : ''}`}
    onClick={onPress}
  >
    {children}
  </div>
);

export const UiRadioBox: React.FC<{ 
  className?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}> = ({ 
  className = '',
  isSelected = false,
  isDisabled = false,
  value,
  onChange
}) => (
  <input
    type="radio"
    value={value}
    checked={isSelected}
    disabled={isDisabled}
    onChange={() => onChange?.(value || '')}
    className={`w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-2 ${
      isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    } ${className}`}
  />
);

export const UiRadioLabel: React.FC<React.PropsWithChildren<{ 
  className?: string;
}>> = ({ 
  children, 
  className = '' 
}) => (
  <label className={`ml-2 text-base text-gray-700 ${className}`}>
    {children}
  </label>
);

export default Radio;
