
import React from 'react';

interface LogoIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
}

const LogoIcon: React.FC<LogoIconProps> = ({
  size = 'md',
  withText = true,
  className = ''
}) => {
  // Size mappings for consistent sizing
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  const textSizeMap = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };
  
  const logoSizeMap = {
    sm: 'w-16 sm:w-20',
    md: 'w-20 sm:w-24',
    lg: 'w-24 sm:w-28',
    xl: 'w-28 sm:w-32'
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="transition-transform duration-300 hover:scale-105">
        <img 
          src="/lovable-uploads/logo.png" 
          alt="TESTR Logo"
          className={`h-auto ${logoSizeMap[size]}`}
        />
      </div>
      {withText && 
        <span className={`${textSizeMap[size]} font-bold`}>
          <span className="text-primary">PPE</span> Inspector
        </span>
      }
    </div>
  );
};

export default LogoIcon;
