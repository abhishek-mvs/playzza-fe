import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  color?: 'white' | 'blue' | 'purple' | 'green';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'white',
  text,
  className
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    white: 'border-white',
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    green: 'border-green-500'
  };

  const renderSpinner = () => (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-t-transparent',
        sizes[size],
        colors[color]
      )}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      <div className={cn('w-2 h-2 bg-current rounded-full animate-bounce', colors[color])} style={{ animationDelay: '0ms' }} />
      <div className={cn('w-2 h-2 bg-current rounded-full animate-bounce', colors[color])} style={{ animationDelay: '150ms' }} />
      <div className={cn('w-2 h-2 bg-current rounded-full animate-bounce', colors[color])} style={{ animationDelay: '300ms' }} />
    </div>
  );

  const renderPulse = () => (
    <div className={cn('animate-pulse rounded-full bg-current', sizes[size], colors[color])} />
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {renderVariant()}
      {text && (
        <p className="mt-2 text-sm text-gray-400">{text}</p>
      )}
    </div>
  );
};

export default Loading; 