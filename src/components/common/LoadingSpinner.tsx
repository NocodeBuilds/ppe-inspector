
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
  className?: string;
  transparent?: boolean;
  color?: 'primary' | 'secondary' | 'white';
}

/**
 * Modern loading spinner component with enhanced animations
 * 
 * @param size - Size of the spinner (xs, sm, md, lg)
 * @param fullScreen - Whether to display as a full screen overlay
 * @param text - Optional text to display below the spinner
 * @param className - Additional CSS classes
 * @param transparent - Whether to use a transparent background (default: false)
 * @param color - Color theme for the spinner
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullScreen = false,
  text,
  className = '',
  transparent = false,
  color = 'primary'
}) => {
  // Size mappings
  const sizeMap = {
    xs: 'h-5 w-5',
    sm: 'h-7 w-7',
    md: 'h-10 w-10',
    lg: 'h-14 w-14'
  };
  
  // Color mappings
  const colorMap = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white'
  };
  
  const spinnerElement = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Main spinner */}
        <div 
          className={`rounded-full border-[3px] ${colorMap[color]} opacity-30 ${sizeMap[size]}`}
        ></div>
        
        {/* Spinning part */}
        <div 
          className={`rounded-full border-[3px] border-t-transparent ${colorMap[color]} animate-spin absolute left-0 top-0 ${sizeMap[size]}`}
        ></div>
        
        {/* Inner glow effect - subtle pulse animation */}
        <div 
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-${color}/10 animate-pulse-glow ${size === 'xs' ? 'h-2 w-2' : size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-5 w-5' : 'h-8 w-8'}`}
        ></div>
      </div>
      
      {text && <p className="mt-3 text-sm font-medium text-muted-foreground">{text}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div 
        className={`fixed inset-0 flex items-center justify-center z-50 ${
          transparent ? 'bg-transparent' : 'bg-background/80 backdrop-blur-sm'
        }`}
      >
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
