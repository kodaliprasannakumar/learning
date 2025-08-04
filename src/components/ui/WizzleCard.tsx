import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface WizzleCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export const WizzleCard: React.FC<WizzleCardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'md'
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Card className={`
        rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300
        bg-white/80 backdrop-blur-sm
        ${paddingClasses[padding]}
        ${className}
      `}>
        {children}
      </Card>
    </motion.div>
  );
};

// Header component for consistent page headers
interface WizzleHeaderProps {
  title: string;
  subtitle?: string;
  gradient?: string;
}

export const WizzleHeader: React.FC<WizzleHeaderProps> = ({ 
  title, 
  subtitle, 
  gradient = 'from-amber-600 via-orange-600 to-pink-600'
}) => {
  return (
    <div className="text-center mb-8">
      <h1 className={`text-4xl font-bold mb-4 bg-gradient-to-r ${gradient} text-transparent bg-clip-text`}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};

// Button component for consistent styling
interface WizzleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white',
  secondary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white',
  outline: 'border-2 border-amber-300 hover:bg-amber-50 text-amber-700'
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};

export const WizzleButton: React.FC<WizzleButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-xl font-semibold transition-all duration-200 transform hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// Loading spinner component
export const WizzleSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="h-12 w-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
    </div>
  );
};

// Icon wrapper for consistent icon styling
interface WizzleIconProps {
  icon: React.ElementType;
  size?: 'sm' | 'md' | 'lg';
  gradient?: string;
  className?: string;
}

const iconSizes = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

export const WizzleIcon: React.FC<WizzleIconProps> = ({ 
  icon: Icon, 
  size = 'md', 
  gradient = 'from-amber-400 to-orange-500',
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center ${iconSizes[size]} ${className}`}>
      <Icon className="h-3/4 w-3/4 text-white" />
    </div>
  );
};
