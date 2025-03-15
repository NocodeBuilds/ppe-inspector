
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
  return <div className={`flex items-center gap-2 ${className}`}>
      <div>
        <img 
          src="/lovable-uploads/logo.png" 
          alt="TESTR Logo"
          className={`h-auto ${size === 'sm' ? 'w-20' : size === 'md' ? 'w-24' : size === 'lg' ? 'w-28' : 'w-32'}`}
        />
      </div>
      {withText && <span className={`${textSizeMap[size]} font-bold`}>
          <span className="text-primary">PPE</span> Inspector
        </span>}
    </div>;
};
export default LogoIcon;
