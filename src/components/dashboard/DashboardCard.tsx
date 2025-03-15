
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
        'block glass-card rounded-lg transition-all duration-300',
        'border border-border/40 shadow-sm dark:border-border/60',
        'hover:border-primary/40 hover:shadow-md dark:hover:border-primary/30',
        'hover:translate-y-[-2px] focus:outline-none focus:ring-1 focus:ring-ring',
        'bg-background/80 backdrop-blur-sm',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center text-center p-3 sm:p-4">
        <div className={cn(
          'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3',
          'shadow-sm transition-transform duration-300 hover:scale-110',
          iconBgColor
        )}>
          {icon}
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
    </Link>
  );
};

export default DashboardCard;
