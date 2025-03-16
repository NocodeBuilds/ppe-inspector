
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
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
        'block rounded-lg transition-all duration-200',
        'border border-border/40 shadow-sm',
        'hover:border-primary/40 focus:outline-none focus:ring-1 focus:ring-ring',
        'bg-background/80 backdrop-blur-sm',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center text-center p-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center mr-3',
          iconBgColor
        )}>
          {icon}
        </div>
        <div className="text-left">
          <h3 className="text-base font-medium leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-tight">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default DashboardCard;
