
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
        'block rounded-xl transition-all duration-300',
        'border border-border/30 shadow-sm dark:border-border/40',
        'hover:border-primary/30 hover:shadow-md dark:hover:border-primary/20',
        'bg-card/40 backdrop-blur-sm',
        'overflow-hidden',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center text-center p-5 h-full">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center mb-3',
          'shadow-sm transition-transform duration-300 hover:scale-110',
          iconBgColor
        )}>
          {icon}
        </div>
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </Link>
  );
};

export default DashboardCard;
