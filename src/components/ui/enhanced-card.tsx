
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
    <CardContent className="p-4 flex items-start gap-4">
      {icon && (
        <div className={cn(
          "flex-shrink-0 p-3 rounded-full", 
          iconBgColor,
          "border-2",
          iconBorderColor,
          "shadow-md"
        )}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </CardContent>
  );

  const baseCardClasses = cn(
    "transition-all duration-200 ease-in-out",
    "hover:shadow-md",
    "border-2",
    cardBorderColor,
    className
  );

  if (to) {
    return (
      <Link to={to}>
        <Card className={cn(baseCardClasses, "cursor-pointer hover:-translate-y-1")} {...props}>
          {cardContent}
        </Card>
      </Link>
    );
  }

  if (onClick) {
    return (
      <Card 
        className={cn(baseCardClasses, "cursor-pointer hover:-translate-y-1")} 
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
