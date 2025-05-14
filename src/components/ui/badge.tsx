import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: 
          "border-transparent bg-success/10 text-success border-success/20",
        warning: 
          "border-transparent bg-warning/10 text-warning border-warning/20",
        info: 
          "border-transparent bg-primary/10 text-primary border-primary/20",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

// Status badge for inspection statuses
type StatusType = 'pending' | 'inProgress' | 'passed' | 'failed' | 'needsRepair' | 'scheduled';

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: StatusType;
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  // Map status to appropriate variant
  const statusVariantMap: Record<StatusType, BadgeProps['variant']> = {
    pending: 'secondary',
    inProgress: 'info',
    passed: 'success',
    failed: 'destructive',
    needsRepair: 'warning',
    scheduled: 'outline',
  };

  // Map status to human-readable label
  const statusLabelMap: Record<StatusType, string> = {
    pending: 'Pending',
    inProgress: 'In Progress',
    passed: 'Passed',
    failed: 'Failed',
    needsRepair: 'Needs Repair',
    scheduled: 'Scheduled',
  };

  return (
    <Badge
      variant={statusVariantMap[status]}
      className={className}
      {...props}
    >
      {props.children || statusLabelMap[status]}
    </Badge>
  );
}

export { Badge, StatusBadge, badgeVariants };
