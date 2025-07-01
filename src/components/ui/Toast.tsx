import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const variants = {
    success: {
      bg: 'bg-gradient-to-r from-green-600 to-green-700',
      icon: '✅',
      border: 'border-green-500'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-600 to-red-700',
      icon: '❌',
      border: 'border-red-500'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-600 to-yellow-700',
      icon: '⚠️',
      border: 'border-yellow-500'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-600 to-blue-700',
      icon: 'ℹ️',
      border: 'border-blue-500'
    }
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div
      className={cn(
        'fixed z-50 max-w-sm w-full',
        positions[position]
      )}
    >
      <div
        className={cn(
          'flex items-center p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform',
          variants[type].bg,
          variants[type].border,
          isVisible 
            ? 'translate-x-0 opacity-100' 
            : 'translate-x-full opacity-0'
        )}
      >
        <span className="text-xl mr-3">{variants[type].icon}</span>
        <p className="text-white font-medium flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-3 text-white hover:text-gray-200 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Toast Container for managing multiple toasts
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right'
}) => {
  return (
    <div className="fixed z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
          position={position}
        />
      ))}
    </div>
  );
};

export default Toast; 