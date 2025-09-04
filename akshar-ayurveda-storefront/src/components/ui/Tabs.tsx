import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onTabChange?: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  variant = 'default',
  size = 'md',
  className = '',
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const getTabButtonClasses = (isActive: boolean, isDisabled: boolean) => {
    const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2';
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
      default: {
        active: 'bg-green-600 text-white border-green-600',
        inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
      },
      pills: {
        active: 'bg-green-600 text-white rounded-full',
        inactive: 'bg-white text-gray-700 hover:bg-gray-50 rounded-full',
        disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed rounded-full',
      },
      underline: {
        active: 'text-green-600 border-b-2 border-green-600',
        inactive: 'text-gray-700 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300',
        disabled: 'text-gray-400 border-b-2 border-transparent cursor-not-allowed',
      },
    };

    const stateClasses = isDisabled 
      ? variantClasses[variant].disabled 
      : isActive 
        ? variantClasses[variant].active 
        : variantClasses[variant].inactive;

    return `${baseClasses} ${sizeClasses[size]} ${stateClasses}`;
  };

  const getTabListClasses = () => {
    const baseClasses = 'flex';
    
    const variantClasses = {
      default: 'border-b border-gray-200',
      pills: 'space-x-2',
      underline: 'border-b border-gray-200',
    };

    return `${baseClasses} ${variantClasses[variant]} ${className}`;
  };

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className={getTabListClasses()}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            className={getTabButtonClasses(activeTab === tab.id, tab.disabled || false)}
            disabled={tab.disabled}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4" role="tabpanel">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;
