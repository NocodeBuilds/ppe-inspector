
import React from 'react';
import { useLocation } from 'react-router-dom';

interface LogoIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  animateOnHover?: boolean;
  withText?: boolean;
  tagline?: string;
}

const LogoIcon: React.FC<LogoIconProps> = ({
  size = 'lg',
  className = '',
  animateOnHover = true,
  withText,
  tagline = 'PPE Inspect'
}) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';
  const isTopNav = location.pathname.startsWith('/topnav');

  // Width-only size mappings to preserve image aspect ratio
  const sizeMap = {
    sm: 'w-16 sm:w-20',
    md: 'w-24 sm:w-28',
    lg: 'w-32 sm:w-40',
    xl: 'w-40 sm:w-48',
    '2xl': 'w-48 sm:w-56'
  };

  // Text size mappings that are appropriately smaller than the logo
  const textSizeMap = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
    '2xl': 'text-xl sm:text-2xl'
  };

  // Determine if we should show text
  const shouldShowText = withText !== undefined ? withText : isLoginPage || isTopNav;

  return (
    <div className={`flex ${isLoginPage ? 'flex-col' : 'flex-row'} items-center justify-center ${className}`}>
      <div className={`${animateOnHover ? 'transition-transform duration-300 hover:scale-105' : ''}`}>
        <img 
          src="/lovable-uploads/logo.png" 
          alt="PPE Inspector Logo" 
          className={`${sizeMap[size]} object-scale-down max-h-full`} 
        />
      </div>
      {shouldShowText && (
        <div className={`${isLoginPage ? 'mt-4' : 'ml-3'} text-center`}>
          <span className={`${textSizeMap[size]} text-muted-foreground`}>
            {tagline}
          </span>
        </div>
      )}
    </div>
  );
};

export default LogoIcon;
