
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
    <CardContent className="p-2 sm:p-3 flex flex-col items-center text-center h-full">
      {icon && (
        <div className={cn(
          "flex-shrink-0 p-1.5 sm:p-2 rounded-full flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2", 
          iconBgColor,
          "border",
          iconBorderColor,
          "shadow-sm transition-all duration-200"
        )}>
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-foreground text-xs sm:text-sm leading-tight">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{description}</p>}
        {children && <div className="mt-1.5 sm:mt-2">{children}</div>}
      </div>
    </CardContent>
  );

  const baseCardClasses = cn(
    "transition-all duration-200 ease-in-out",
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
          "cursor-pointer hover:-translate-y-0.5 hover:shadow focus:outline-none focus:ring-1 focus:ring-ring"
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
          "cursor-pointer hover:-translate-y-0.5 hover:shadow focus:outline-none focus:ring-1 focus:ring-ring"
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
