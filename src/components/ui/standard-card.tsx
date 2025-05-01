
import React from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StandardCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

export function StandardCard({
  title,
  description,
  headerAction,
  footer,
  children,
  className,
  contentClassName,
  headerClassName,
}: StandardCardProps) {
  return (
    <Card className={cn("backdrop-blur-sm bg-background/80 border-border/50", className)}>
      {(title || description || headerAction) && (
        <CardHeader className={cn("pb-2 flex flex-row items-start justify-between", headerClassName)}>
          <div>
            {title && <CardTitle className="text-lg">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {headerAction && (
            <div className="flex items-center space-x-2">
              {headerAction}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className={cn("pt-3", contentClassName)}>
        {children}
      </CardContent>
      {footer && <CardFooter className="border-t pt-3 px-6">{footer}</CardFooter>}
    </Card>
  );
}
