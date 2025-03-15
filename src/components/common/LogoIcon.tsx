
import React from 'react';

interface LogoIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  withText?: boolean;
  className?: string;
  animateOnHover?: boolean;
}

const LogoIcon: React.FC<LogoIconProps> = ({
  size = 'md',
  withText = false,
  className = '',
  animateOnHover = true
}) => {
  // Size mappings for consistent sizing
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-20 w-20'
  };
  
  const textSizeMap = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl'
  };
  
  const logoSizeMap = {
    sm: 'w-18 sm:w-22',
    md: 'w-22 sm:w-26',
    lg: 'w-26 sm:w-30',
    xl: 'w-30 sm:w-38',
    '2xl': 'w-38 sm:w-46'
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${animateOnHover ? 'transition-transform duration-300 hover:scale-105' : ''}`}>
        <img 
          src="/lovable-uploads/logo.png" 
          alt="PPE Inspector Logo"
          className={`h-auto ${logoSizeMap[size]}`}
        />
      </div>
      {withText && 
        <span className={`${textSizeMap[size]} font-bold font-sans`}>
          <span className="text-primary">PPE</span> Inspector
        </span>
      }
    </div>
  );
};

export default LogoIcon;
