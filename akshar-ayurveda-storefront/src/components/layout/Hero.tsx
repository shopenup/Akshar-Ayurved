import React from 'react';
import { Button } from '../ui';

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  textColor?: 'white' | 'dark';
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  }[];
  className?: string;
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  backgroundImage,
  backgroundGradient = 'bg-gradient-to-br from-green-600 to-green-700',
  textColor = 'white',
  actions = [],
  className = '',
}) => {
  const textColorClasses = {
    white: 'text-white',
    dark: 'text-gray-900',
  };

  const backgroundStyle = backgroundImage 
    ? { backgroundImage: `url(${backgroundImage})` }
    : {};

  return (
    <section 
      className={`relative py-20 ${backgroundGradient} ${className}`}
      style={backgroundStyle}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${textColorClasses[textColor]}`}>
            {title}
          </h1>
          
          {subtitle && (
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${textColorClasses[textColor]} opacity-90`}>
              {subtitle}
            </p>
          )}
          
          {actions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'primary'}
                  size="lg"
                  onClick={action.onClick}
                  className={textColor === 'white' && action.variant === 'outline' ? 'border-white text-white hover:bg-white hover:text-green-600' : ''}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
