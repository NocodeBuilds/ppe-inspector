
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
}

const DashboardCard = ({
  to,
  icon,
  title,
  description,
  iconBgColor = 'bg-primary',
  className,
}: DashboardCardProps) => {
  return (
    <Link
      to={to}
      className={cn(
        'block glass-card rounded-lg p-6 transition-all duration-300 hover:shadow-xl',
        'hover:translate-y-[-2px] hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className={cn(
          'w-16 h-16 rounded-lg flex items-center justify-center mb-4',
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
