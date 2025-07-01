import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'glass';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, variant = 'default', ...props }, ref) => {
    const baseClasses = "w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      default: "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500",
      glass: "glass border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{icon}</span>
            </div>
          )}
          <input
            className={cn(
              baseClasses,
              variants[variant],
              icon && "pl-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 