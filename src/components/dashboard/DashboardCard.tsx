
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
  onClick?: () => void; // Add the onClick property to the interface
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
  // If onClick is provided, we'll use it with the Link component
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault(); // Prevent the default navigation
      onClick();
    }
  };

  return (
    <Link
      to={to}
      className={cn(
        'block glass-card rounded-lg p-6 transition-all duration-300 hover:shadow-xl',
        'hover:translate-y-[-2px] hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
      onClick={handleClick}
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
