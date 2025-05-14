import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "success" | "warning" | "danger";
    showValue?: boolean;
    formatValue?: (value: number) => string;
  }
>(
  (
    {
      className,
      value,
      indicatorClassName,
      size = "md",
      variant = "default",
      showValue = false,
      formatValue = (value) => `${value}%`,
      ...props
    },
    ref
  ) => {
    // Map size to height classes
    const sizeClasses = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    };

    // Map variant to color classes
    const variantClasses = {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-destructive",
    };

    return (
      <div className="flex items-center gap-2">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-secondary",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full w-full flex-1 transition-all",
              variantClasses[variant],
              indicatorClassName
            )}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          />
        </ProgressPrimitive.Root>
        {showValue && value !== null && (
          <span className="text-body-sm text-muted-foreground min-w-[2.5rem] text-right font-medium">
            {formatValue(value)}
          </span>
        )}
      </div>
    );
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
