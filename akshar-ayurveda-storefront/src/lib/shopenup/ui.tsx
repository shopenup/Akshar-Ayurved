import React from 'react';
import { getIconComponent } from '../../utils/icons';

// Enhanced UI components that integrate with Shopenup
export interface ShopenupUIComponents {
  Button: React.ComponentType<ButtonProps>;
  Input: React.ComponentType<InputProps>;
  Modal: React.ComponentType<ModalProps>;
  Card: React.ComponentType<CardProps>;
  Badge: React.ComponentType<BadgeProps>;
  Spinner: React.ComponentType<SpinnerProps>;
  Alert: React.ComponentType<AlertProps>;
  Tabs: React.ComponentType<TabsProps>;
  Accordion: React.ComponentType<AccordionProps>;
  Carousel: React.ComponentType<CarouselProps>;
  Select: React.ComponentType<SelectProps>;
  Checkbox: React.ComponentType<CheckboxProps>;
  Radio: React.ComponentType<RadioProps>;
  Textarea: React.ComponentType<TextareaProps>;
  Tooltip: React.ComponentType<TooltipProps>;
  Progress: React.ComponentType<ProgressProps>;
  Skeleton: React.ComponentType<SkeletonProps>;
  Breadcrumb: React.ComponentType<BreadcrumbProps>;
  Pagination: React.ComponentType<PaginationProps>;
  Dropdown: React.ComponentType<DropdownProps>;
  Toast: React.ComponentType<ToastProps>;
  Drawer: React.ComponentType<DrawerProps>;
  Table: React.ComponentType<TableProps>;
  Form: React.ComponentType<FormProps>;
  Field: React.ComponentType<FieldProps>;
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
  className?: string;
}

// Placeholder interfaces for other components
export interface ModalProps { children: React.ReactNode; }
export interface TabsProps { children: React.ReactNode; }
export interface AccordionProps { children: React.ReactNode; }
export interface CarouselProps { children: React.ReactNode; }
export interface SelectProps { children: React.ReactNode; }
export interface CheckboxProps { children: React.ReactNode; }
export interface RadioProps { children: React.ReactNode; }
export interface TextareaProps { children: React.ReactNode; }
export interface TooltipProps { children: React.ReactNode; }
export interface ProgressProps { children: React.ReactNode; }
export interface SkeletonProps { children: React.ReactNode; }
export interface BreadcrumbProps { children: React.ReactNode; }
export interface PaginationProps { children: React.ReactNode; }
export interface DropdownProps { children: React.ReactNode; }
export interface ToastProps { children: React.ReactNode; }
export interface DrawerProps { children: React.ReactNode; }
export interface TableProps { children: React.ReactNode; }
export interface FormProps { children: React.ReactNode; }
export interface FieldProps { children: React.ReactNode; }

// Shopenup UI theme configuration
export const shopenupTheme = {
  colors: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  },
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['Menlo', 'Monaco', 'monospace'],
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  }
};

// Enhanced Button component with Shopenup integration
export const ShopenupButton: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants: Record<string, string> = {
    primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-green-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };
  
  const IconComponent = icon ? getIconComponent(icon) : null;
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && IconComponent && iconPosition === 'left' && (
        <IconComponent className="mr-2 h-4 w-4" />
      )}
      {children}
      {!loading && IconComponent && iconPosition === 'right' && (
        <IconComponent className="ml-2 h-4 w-4" />
      )}
    </button>
  );
};

// Enhanced Input component with Shopenup integration
export const ShopenupInput: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText, 
  leftIcon, 
  rightIcon,
  className = '',
  ...props 
}) => {
  const LeftIconComponent = leftIcon ? getIconComponent(leftIcon) : null;
  const RightIconComponent = rightIcon ? getIconComponent(rightIcon) : null;
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIconComponent className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:border-green-500 focus:ring-green-500 sm:text-sm
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {RightIconComponent && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <RightIconComponent className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

// Enhanced Card component with Shopenup integration
export const ShopenupCard: React.FC<CardProps> = ({ 
  children, 
  variant = 'default', 
  padding = 'md',
  shadow = 'md',
  className = '',
  ...props 
}) => {
  const variants: Record<string, string> = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg',
    outline: 'bg-transparent border-2 border-gray-200',
  };
  
  const paddings: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const shadows: Record<string, string> = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  
  return (
    <div
      className={`
        rounded-lg ${variants[variant]} ${paddings[padding]} ${shadows[shadow]} ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Enhanced Badge component with Shopenup integration
export const ShopenupBadge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const variants: Record<string, string> = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-green-100 text-green-800',
    secondary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };
  
  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  };
  
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

// Enhanced Spinner component with Shopenup integration
export const ShopenupSpinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = '',
  ...props 
}) => {
  const sizes: Record<string, string> = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };
  
  const colors: Record<string, string> = {
    primary: 'text-green-600',
    secondary: 'text-gray-600',
    white: 'text-white',
  };
  
  return (
    <svg
      className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Enhanced Alert component with Shopenup integration
export const ShopenupAlert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'info', 
  title,
  onClose,
  className = '',
  ...props 
}) => {
  const variants: Record<string, string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };
  
  const icons: Record<string, string> = {
    info: 'InformationCircleIcon',
    success: 'CheckCircleIcon',
    warning: 'ExclamationTriangleIcon',
    error: 'XCircleIcon',
  };
  
  const IconComponent = getIconComponent(icons[variant] || 'InformationCircleIcon');
  
  return (
    <div
      className={`
        border rounded-md p-4 ${variants[variant]} ${className}
      `}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Placeholder components for other UI elements
export const ShopenupModal: React.FC<ModalProps> = ({ children }) => <div>{children}</div>;
export const ShopenupTabs: React.FC<TabsProps> = ({ children }) => <div>{children}</div>;
export const ShopenupAccordion: React.FC<AccordionProps> = ({ children }) => <div>{children}</div>;
export const ShopenupCarousel: React.FC<CarouselProps> = ({ children }) => <div>{children}</div>;
export const ShopenupSelect: React.FC<SelectProps> = ({ children }) => <div>{children}</div>;
export const ShopenupCheckbox: React.FC<CheckboxProps> = ({ children }) => <div>{children}</div>;
export const ShopenupRadio: React.FC<RadioProps> = ({ children }) => <div>{children}</div>;
export const ShopenupTextarea: React.FC<TextareaProps> = ({ children }) => <div>{children}</div>;
export const ShopenupTooltip: React.FC<TooltipProps> = ({ children }) => <div>{children}</div>;
export const ShopenupProgress: React.FC<ProgressProps> = ({ children }) => <div>{children}</div>;
export const ShopenupSkeleton: React.FC<SkeletonProps> = ({ children }) => <div>{children}</div>;
export const ShopenupBreadcrumb: React.FC<BreadcrumbProps> = ({ children }) => <div>{children}</div>;
export const ShopenupPagination: React.FC<PaginationProps> = ({ children }) => <div>{children}</div>;
export const ShopenupDropdown: React.FC<DropdownProps> = ({ children }) => <div>{children}</div>;
export const ShopenupToast: React.FC<ToastProps> = ({ children }) => <div>{children}</div>;
export const ShopenupDrawer: React.FC<DrawerProps> = ({ children }) => <div>{children}</div>;
export const ShopenupTable: React.FC<TableProps> = ({ children }) => <div>{children}</div>;
export const ShopenupForm: React.FC<FormProps> = ({ children }) => <div>{children}</div>;
export const ShopenupField: React.FC<FieldProps> = ({ children }) => <div>{children}</div>;

// Export all enhanced components
export const shopenupUIComponents: ShopenupUIComponents = {
  Button: ShopenupButton,
  Input: ShopenupInput,
  Card: ShopenupCard,
  Badge: ShopenupBadge,
  Spinner: ShopenupSpinner,
  Alert: ShopenupAlert,
  Modal: ShopenupModal,
  Tabs: ShopenupTabs,
  Accordion: ShopenupAccordion,
  Carousel: ShopenupCarousel,
  Select: ShopenupSelect,
  Checkbox: ShopenupCheckbox,
  Radio: ShopenupRadio,
  Textarea: ShopenupTextarea,
  Tooltip: ShopenupTooltip,
  Progress: ShopenupProgress,
  Skeleton: ShopenupSkeleton,
  Breadcrumb: ShopenupBreadcrumb,
  Pagination: ShopenupPagination,
  Dropdown: ShopenupDropdown,
  Toast: ShopenupToast,
  Drawer: ShopenupDrawer,
  Table: ShopenupTable,
  Form: ShopenupForm,
  Field: ShopenupField,
};

// Initialize Shopenup UI
export function initializeShopenupUI() {
  return {
    theme: shopenupTheme,
    components: shopenupUIComponents,
    icons: null,
  };
}
