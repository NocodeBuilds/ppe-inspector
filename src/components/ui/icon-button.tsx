
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  className?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const IconButton = ({
  icon,
  onClick,
  className,
  label,
  variant = 'primary',
  size = 'md',
}: IconButtonProps) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-success text-primary-foreground',
    danger: 'bg-destructive text-destructive-foreground',
    warning: 'bg-warning text-primary-foreground',
    info: 'bg-info text-primary-foreground',
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon}
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
};

export default IconButton;
