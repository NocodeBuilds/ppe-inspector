
import React from 'react';
import { useLocation } from 'react-router-dom';

interface LogoIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  animateOnHover?: boolean;
  withText?: boolean;
}

const LogoIcon: React.FC<LogoIconProps> = ({
  size = 'md',
  className = '',
  animateOnHover = true,
  withText
}) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isTopNav = location.pathname.startsWith('/topnav');

  // Enhanced size mappings for better visibility on mobile
  const sizeMap = {
    sm: 'h-10 w-10 sm:h-12 sm:w-12',
    md: 'h-16 w-16 sm:h-24 sm:w-24',
    lg: 'h-24 w-24 sm:h-32 sm:w-32',
    xl: 'h-32 w-32 sm:h-40 sm:w-40',
    '2xl': 'h-40 w-40 sm:h-48 sm:w-48'
  };
  
  // Text size mappings that scale better on mobile
  const textSizeMap = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
    '2xl': 'text-4xl sm:text-5xl'
  };

  // Determine if we should show text
  const shouldShowText = withText !== undefined ? withText : isLoginPage || isTopNav;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${animateOnHover ? 'transition-transform duration-300 hover:scale-105' : ''}`}>
        <img 
          src="/lovable-uploads/logo.png" 
          alt="PPE Inspector Logo" 
          className={`${sizeMap[size]} object-contain drop-shadow-md`} 
        />
      </div>
      {shouldShowText && (
        <div className={`flex flex-col items-center mt-2 ${isLoginPage ? 'mt-4' : ''}`}>
          <span className={`${textSizeMap[size]} font-medium text-primary`}>
            PPE Inspector
          </span>
        </div>
      )}
    </div>
  );
};

export default LogoIcon;
