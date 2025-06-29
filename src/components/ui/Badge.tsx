import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center font-medium rounded-full transition-all duration-200";
    
    const variants = {
      default: "bg-gray-700 text-gray-300 border border-gray-600",
      success: "bg-green-900 bg-opacity-20 text-green-400 border border-green-500",
      warning: "bg-yellow-900 bg-opacity-20 text-yellow-400 border border-yellow-500",
      error: "bg-red-900 bg-opacity-20 text-red-400 border border-red-500",
      info: "bg-blue-900 bg-opacity-20 text-blue-400 border border-blue-500",
      primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
      secondary: "bg-gray-600 text-white"
    };

    const sizes = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1 text-sm",
      lg: "px-4 py-2 text-base"
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge }; 