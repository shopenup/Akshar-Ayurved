import React from 'react';
import * as ReactAria from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

// UiModal component
export const UiModal: React.FC<ReactAria.DialogProps> = ({
  children,
  className,
  ...rest
}) => (
  <ReactAria.Dialog
    {...rest}
    className={twMerge("focus-visible:outline-none", className)}
  >
    {children}
  </ReactAria.Dialog>
);

// UiModalOverlay component
// Fix: Use correct type for OverlayContainerProps (not exported from react-aria-components)
// We'll use React.HTMLAttributes<HTMLDivElement> instead.
export const UiModalOverlay: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...rest
}) => (
  <div
    {...rest}
    className={twMerge("fixed inset-0 z-50 flex items-center justify-center", className)}
  >
    <div className="fixed inset-0 bg-black bg-opacity-50" />
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

// Keep the original Modal component for backward compatibility
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className = '',
}) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        
        {/* Modal panel */}
        <div className={`inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg ${className}`}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between mb-4">
              {title && (
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
