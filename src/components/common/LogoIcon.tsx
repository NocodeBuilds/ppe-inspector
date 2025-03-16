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

  // Enhanced size mappings for better visibility on mobile
  const sizeMap = {
    sm: 'h-8 w-8 sm:h-10 sm:w-10',
    md: 'h-14 w-14 sm:h-20 sm:w-20',
    lg: 'h-20 w-20 sm:h-28 sm:w-28',
    xl: 'h-24 w-24 sm:h-32 sm:w-32',
    '2xl': 'h-32 w-32 sm:h-40 sm:w-40'
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
  return <div className={`flex ${isLoginPage ? 'flex-col' : 'flex-row'} items-center ${className}`}>
      <div className={`${animateOnHover ? 'transition-transform duration-300 hover:scale-105' : ''}`}>
        <img src="/lovable-uploads/logo.png" alt="PPE Inspector Logo" className={`${sizeMap[size]} object-contain`} />
      </div>
      {shouldShowText && <div className={`${isLoginPage ? 'mt-2' : 'ml-2'}`}>
          <span className="">
            {tagline}
          </span>
        </div>}
    </div>;
};
export default LogoIcon;