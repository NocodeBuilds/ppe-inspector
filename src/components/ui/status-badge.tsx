
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusLower = status?.toLowerCase() || '';
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "secondary";
  
  // Determine variant based on status
  if (statusLower === 'pass' || statusLower === 'active' || statusLower === 'approved') {
    variant = 'success';
  } else if (statusLower === 'fail' || statusLower === 'expired' || statusLower === 'flagged') {
    variant = 'destructive';
  } else if (statusLower === 'pending' || statusLower === 'warning' || statusLower === 'review') {
    variant = 'warning';
  }
  
  return (
    <Badge 
      variant={variant} 
      className={cn("capitalize", className)}
    >
      {status || 'N/A'}
    </Badge>
  );
}
