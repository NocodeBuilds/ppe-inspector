
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false,
  text
}: LoadingSpinnerProps) => {
  // Size mappings
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  const spinnerElement = (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizeMap[size]}`}></div>
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
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
