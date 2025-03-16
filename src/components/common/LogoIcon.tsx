import React from 'react';
import { useLocation } from 'react-router-dom';

interface LogoIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  animateOnHover?: boolean;
}

const LogoIcon: React.FC<LogoIconProps> = ({
  size = 'md',
  className = '',
  animateOnHover = true
}) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isTopNav = location.pathname.startsWith('/topnav');

  // Size mappings for consistent sizing - increased for better visibility
  const sizeMap = {
    sm: 'h-20 w-20',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40',
    '2xl': 'h-48 w-48'
  };
  const textSizeMap = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${animateOnHover ? 'transition-transform duration-300 hover:scale-105' : ''}`}>
        <img 
          src="/lovable-uploads/logo.png" 
          alt="PPE Inspector Logo" 
          className={`${sizeMap[size]} object-contain drop-shadow-md`} 
        />
      </div>
      {(isLoginPage || isTopNav) && (
        <div className="flex flex-col items-center mt-2">
          <span className={`${textSizeMap[size]} text-primary`}>
            PPE Inspector
          </span>
        </div>
      )}
    </div>
  );
};

export default LogoIcon;
