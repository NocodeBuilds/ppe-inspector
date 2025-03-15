
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  className?: string;
  onClick?: () => void;
}

const DashboardCard = ({
  to,
  icon,
  title,
  description,
  iconBgColor = 'bg-primary',
  className,
  onClick,
}: DashboardCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link
      to={to}
      className={cn(
        'block glass-card rounded-lg transition-all duration-200',
        'border border-border/40 shadow-sm dark:border-border/60',
        'hover:border-primary/40 hover:shadow-md dark:hover:border-primary/30',
        'hover:translate-y-[-1px] focus:outline-none focus:ring-1 focus:ring-ring',
        'bg-background/80 backdrop-blur-sm',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center text-center p-2 sm:p-2.5">
        <div className={cn(
          'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1.5 sm:mb-2',
          'shadow-sm transition-transform duration-200 hover:scale-105',
          iconBgColor
        )}>
          {icon}
        </div>
        <h3 className="text-sm sm:text-base font-semibold leading-tight">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{description}</p>
      </div>
    </Link>
  );
};

export default DashboardCard;
