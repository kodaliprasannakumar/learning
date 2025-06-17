import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white' | 'custom';
  message?: string;
  fullScreen?: boolean;
  className?: string;
  customColor?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  custom: '',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  message,
  fullScreen = false,
  className = '',
  customColor,
}) => {
  const spinnerClasses = `
    ${sizeClasses[size]}
    ${variant !== 'custom' ? colorClasses[variant] : ''}
    animate-spin
    ${className}
  `;

  const spinnerStyle = variant === 'custom' && customColor 
    ? { color: customColor }
    : undefined;

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="relative"
      >
        <Loader2 
          className={spinnerClasses}
          style={spinnerStyle}
        />
      </motion.div>
      
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`
            text-sm font-medium
            ${variant === 'white' ? 'text-white' : 'text-gray-600'}
          `}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

// Preset loading components for common use cases
export const GameLoadingSpinner = () => (
  <LoadingSpinner 
    size="lg" 
    variant="primary" 
    message="Loading game..." 
  />
);

export const ButtonLoadingSpinner = () => (
  <LoadingSpinner 
    size="sm" 
    variant="white" 
  />
);

export const PageLoadingSpinner = () => (
  <LoadingSpinner 
    size="xl" 
    variant="primary" 
    message="Loading..." 
    fullScreen 
  />
); 