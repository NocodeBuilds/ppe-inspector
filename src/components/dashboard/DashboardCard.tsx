
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
        'block glass-card rounded-lg p-6 transition-all duration-300',
        'border border-border/40 shadow-sm dark:border-border/60',
        'hover:border-primary/40 hover:shadow-lg dark:hover:border-primary/30',
        'hover:translate-y-[-2px] hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className={cn(
          'w-16 h-16 rounded-lg flex items-center justify-center mb-4',
          'shadow-sm',
          iconBgColor
        )}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
};

export default DashboardCard;
