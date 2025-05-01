
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { format } from 'date-fns';

interface ItemCardProps {
  title: string;
  subtitle?: string;
  status?: string;
  date?: string | Date;
  dateLabel?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ItemCard({
  title,
  subtitle,
  status,
  date,
  dateLabel = 'Date',
  icon,
  actions,
  className,
  onClick,
}: ItemCardProps) {
  const formattedDate = date ? format(new Date(date), 'MMM d, yyyy') : null;
  
  const cardContent = (
    <div className={cn(
      "h-[100px] rounded-lg p-3 transition-all duration-200 border-2 flex items-center gap-3",
      status ? getStatusBorderColor(status) : 'border-primary/30',
      onClick ? 'cursor-pointer hover:shadow' : '',
      className
    )}>
      {icon && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0 overflow-hidden">
        <h3 className="h4 truncate">{title}</h3>
        {subtitle && <p className="text-caption truncate">{subtitle}</p>}
        {(status || date) && (
          <div className="flex items-center gap-3 text-body-sm">
            {status && <StatusBadge status={status} />}
            {formattedDate && <span className="text-muted-foreground">{dateLabel}: {formattedDate}</span>}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex-shrink-0 flex gap-1.5">
          {actions}
        </div>
      )}
    </div>
  );
  
  if (onClick) {
    return (
      <div onClick={onClick}>
        {cardContent}
      </div>
    );
  }
  
  return cardContent;
}

// Helper function to get border color based on status
function getStatusBorderColor(status: string): string {
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'pass' || statusLower === 'active' || statusLower === 'approved') {
    return 'border-success/50';
  } else if (statusLower === 'fail' || statusLower === 'expired' || statusLower === 'flagged') {
    return 'border-destructive/50';
  } else if (statusLower === 'pending' || statusLower === 'warning' || statusLower === 'review') {
    return 'border-warning/50';
  }
  
  return 'border-primary/30';
}
