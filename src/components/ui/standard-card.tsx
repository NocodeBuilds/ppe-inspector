
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export interface StandardCardProps {
  children?: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const StandardCard: React.FC<StandardCardProps> = ({
  children,
  title,
  description,
  footer,
  className = '',
  icon
}) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      {(title || description || icon) && (
        <CardHeader className="pb-3">
          {title && (
            <div className="flex items-center gap-2">
              {icon && <div className="text-muted-foreground">{icon}</div>}
              <CardTitle>{title}</CardTitle>
            </div>
          )}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
      {children && <CardContent className="pt-2">{children}</CardContent>}
      
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};

export default StandardCard;
