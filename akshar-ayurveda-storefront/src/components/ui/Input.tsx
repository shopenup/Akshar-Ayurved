import React from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  name,
  id,
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
  const errorClass = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-green-400 focus:ring-green-400';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '';
  
  const inputClasses = `block ${widthClass} ${sizeClasses[size]} border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 ${errorClass} ${disabledClass} ${className}`;
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClasses}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
