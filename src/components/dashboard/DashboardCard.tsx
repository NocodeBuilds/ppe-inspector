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
        isMobile ? 'p-1' : '',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center p-3 sm:p-4">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center mr-3 shrink-0',
          iconBgColor
        )}>
          {icon}
        </div>
        <div className="text-left">
          <h3 className="h4">{title}</h3>
          <p className="text-caption">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default DashboardCard;
