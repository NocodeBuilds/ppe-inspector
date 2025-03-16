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
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
    '2xl': 'h-32 w-32'
  };
  const textSizeMap = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl'
  };
  return <div className={`flex flex-col items-center ${className}`}>
      <div className={`${animateOnHover ? 'transition-transform duration-300 hover:scale-105' : ''} 
        rounded-full p-1 shadow-lg`}>
        <img src="/lovable-uploads/logo.png" alt="PPE Inspector Logo" className={`${sizeMap[size]} object-contain drop-shadow-md`} />
      </div>
      {withText && <div className="flex flex-col items-center mt-2">
          <span className="text-lg">
            <span className="text-primary">PPE</span> Inspector
          </span>
          
        </div>}
    </div>;
};
export default LogoIcon;