import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
  onClick,
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    none: '',
  };
  
  const hoverClass = hover ? 'hover:shadow-xl transition-shadow cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';
  
  const classes = `bg-white rounded-lg ${paddingClasses[padding]} ${shadowClasses[shadow]} ${hoverClass} ${clickableClass} ${className}`;
  
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
