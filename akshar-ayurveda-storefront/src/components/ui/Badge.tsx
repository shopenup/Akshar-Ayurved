import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
}) => {
  const variantClasses = {
    primary: 'bg-green-100 text-green-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  const clickableClass = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
  
  const classes = `inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${clickableClass} ${className}`;
  
  return (
    <span className={classes} onClick={onClick}>
      {children}
    </span>
  );
};

export default Badge;
