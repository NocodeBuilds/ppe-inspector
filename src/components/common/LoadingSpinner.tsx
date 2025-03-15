
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
  className?: string;
  transparent?: boolean;
}

/**
 * Loading spinner component with consistent styling
 * 
 * @param size - Size of the spinner (xs, sm, md, lg)
 * @param fullScreen - Whether to display as a full screen overlay
 * @param text - Optional text to display below the spinner
 * @param className - Additional CSS classes
 * @param transparent - Whether to use a transparent background (default: false)
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullScreen = false,
  text,
  className = '',
  transparent = false
}) => {
  // Size mappings for consistent sizing
  const sizeMap = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };
  
  const spinnerElement = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-t-transparent border-primary ${sizeMap[size]}`}></div>
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${transparent ? 'bg-transparent' : 'bg-background/80 backdrop-blur-sm'}`}>
        {spinnerElement}
      </div>
    );
  }
  
  return (
    <div className="flex justify-center py-4">
      {spinnerElement}
    </div>
  );
};

export default LoadingSpinner;
