import React from 'react';

interface TextareaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  name,
  id,
  rows = 4,
  maxLength,
  className = '',
  fullWidth = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '';
  
  const textareaClasses = `block ${widthClass} ${sizeClasses[size]} border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 resize-vertical ${errorClass} ${disabledClass} ${className}`;
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={textareaClasses}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {maxLength && (
        <p className="mt-1 text-xs text-gray-500">
          {value?.length || 0} / {maxLength} characters
        </p>
      )}
    </div>
  );
};

export default Textarea;
