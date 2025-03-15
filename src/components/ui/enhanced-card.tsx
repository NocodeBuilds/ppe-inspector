
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconBorderColor?: string;
  to?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  cardBorderColor?: string;
}

const EnhancedCard = ({
  title,
  description,
  icon,
  iconBgColor = 'bg-primary',
  iconBorderColor = 'border-primary/20',
  to,
  onClick,
  children,
  className,
  cardBorderColor = 'border-border',
  ...props
}: EnhancedCardProps) => {
  const cardContent = (
    <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center h-full">
      {icon && (
        <div className={cn(
          "flex-shrink-0 p-2 sm:p-3 rounded-full flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3", 
          iconBgColor,
          "border",
          iconBorderColor,
          "shadow-sm transition-all duration-300 hover:scale-110"
        )}>
          {icon}
        </div>
      )}
      <div>
        <h3 className="card-title">{title}</h3>
        {description && <p className="card-description">{description}</p>}
        {children && <div className="mt-2 sm:mt-3">{children}</div>}
      </div>
    </CardContent>
  );

  const baseCardClasses = cn(
    "transition-all duration-300 ease-in-out",
    "hover:shadow-sm h-full",
    "border",
    cardBorderColor,
    "backdrop-blur-sm bg-background/80",
    className
  );

  if (to) {
    return (
      <Link to={to} className="block h-full">
        <Card className={cn(
          baseCardClasses, 
          "cursor-pointer hover:-translate-y-1 hover:shadow focus:outline-none focus:ring-1 focus:ring-ring"
        )} {...props}>
          {cardContent}
        </Card>
      </Link>
    );
  }

  if (onClick) {
    return (
      <Card 
        className={cn(
          baseCardClasses, 
          "cursor-pointer hover:-translate-y-1 hover:shadow focus:outline-none focus:ring-1 focus:ring-ring"
        )} 
        onClick={onClick} 
        {...props}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <Card className={baseCardClasses} {...props}>
      {cardContent}
    </Card>
  );
};

export default EnhancedCard;
