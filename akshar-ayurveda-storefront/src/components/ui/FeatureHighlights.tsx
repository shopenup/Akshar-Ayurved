import React from 'react';

interface Feature {
  id: string;
  icon: React.ReactNode;
  text: string;
}

interface FeatureHighlightsProps {
  features: Feature[];
  background?: 'green' | 'white' | 'gray';
  className?: string;
}

const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({
  features,
  background = 'green',
  className = '',
}) => {
  const getBackgroundClasses = () => {
    switch (background) {
      case 'green':
        return 'bg-green-800 text-white';
      case 'white':
        return 'bg-white text-gray-900 border-b border-gray-200';
      case 'gray':
        return 'bg-gray-100 text-gray-900';
      default:
        return 'bg-green-800 text-white';
    }
  };

  return (
    <section className={`py-4 ${getBackgroundClasses()} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center space-x-8">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                {feature.icon}
              </div>
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
