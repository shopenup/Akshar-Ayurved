import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  background?: 'white' | 'gray' | 'green' | 'transparent';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  container?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';
}

const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  background = 'white',
  padding = 'lg',
  className = '',
  container = true,
  maxWidth = '7xl',
}) => {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    green: 'bg-green-50',
    transparent: 'bg-transparent',
  };

  const paddingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-20',
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
  };

  const content = (
    <>
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </>
  );

  return (
    <section className={`${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}>
      {container ? (
        <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8`}>
          {content}
        </div>
      ) : (
        content
      )}
    </section>
  );
};

export default Section;
