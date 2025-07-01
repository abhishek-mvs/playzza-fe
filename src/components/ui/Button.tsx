import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    icon, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
    
    const variants = {
      primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-blue-500",
      secondary: "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-gray-500",
      outline: "border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-blue-500",
      ghost: "text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 transform hover:-translate-y-0.5 focus:ring-gray-500",
      danger: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-red-500",
      success: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-green-500"
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
      xl: "px-10 py-5 text-xl"
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
        )}
        {icon && !loading && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 