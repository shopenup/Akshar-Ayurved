import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      default:
        return 'rounded';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse';
      default:
        return '';
    }
  };

  const getDefaultDimensions = () => {
    switch (variant) {
      case 'circular':
        return { width: '40px', height: '40px' };
      case 'text':
        return { width: '100%', height: '1em' };
      default:
        return { width: '100%', height: '200px' };
    }
  };

  const defaultDims = getDefaultDimensions();
  const finalWidth = width || defaultDims.width;
  const finalHeight = height || defaultDims.height;

  return (
    <div
      className={`bg-gray-200 ${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={{
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
      }}
    />
  );
};

// Compound components for common skeleton patterns
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
  animation = 'pulse',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton
        key={index}
        variant="text"
        width={index === lines - 1 ? '60%' : '100%'}
        animation={animation}
      />
    ))}
  </div>
);

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 'md',
  className = '',
  animation = 'pulse',
}) => {
  const sizeMap = {
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '64px',
  };

  return (
    <Skeleton
      variant="circular"
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={className}
      animation={animation}
    />
  );
};

interface SkeletonCardProps {
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  animation = 'pulse',
}) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonAvatar size="lg" animation={animation} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" height="1.2em" animation={animation} />
        <Skeleton variant="text" width="40%" height="1em" animation={animation} />
      </div>
    </div>
    <SkeletonText lines={3} animation={animation} />
  </div>
);

export default Skeleton;
