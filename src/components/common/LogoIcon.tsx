
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
  // Size mappings for consistent sizing - increased for better visibility
  const sizeMap = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-18 w-18',
    xl: 'h-24 w-24',
    '2xl': 'h-28 w-28'
  };

  const textSizeMap = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${animateOnHover ? 'transition-transform duration-300 hover:scale-105' : ''} 
        rounded-full p-1 shadow-lg`}>
        <img 
          src="/lovable-uploads/logo.png" 
          alt="PPE Inspector Logo" 
          className={`${sizeMap[size]} object-contain drop-shadow-lg`} 
        />
      </div>
      {withText && (
        <span className={`${textSizeMap[size]} font-bold font-sans drop-shadow-sm tracking-tight`}>
          <span className="text-primary">PPE</span> Inspector
        </span>
      )}
    </div>
  );
};

export default LogoIcon;
