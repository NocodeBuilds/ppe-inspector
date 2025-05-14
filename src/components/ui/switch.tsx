import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    size?: "sm" | "md" | "lg";
  }
>(({ className, size = "md", ...props }, ref) => {
  // Size mappings
  const sizeClasses = {
    sm: "h-[20px] w-[36px] data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
    md: "h-[24px] w-[44px] data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
    lg: "h-[28px] w-[52px] data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
  };

  const thumbSizeClasses = {
    sm: "h-[16px] w-[16px] data-[state=checked]:translate-x-[16px]",
    md: "h-[20px] w-[20px] data-[state=checked]:translate-x-[20px]",
    lg: "h-[24px] w-[24px] data-[state=checked]:translate-x-[24px]",
  };

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
          thumbSizeClasses[size]
        )}
      />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

interface SwitchFieldProps extends React.ComponentPropsWithoutRef<typeof Switch> {
  label?: string;
  description?: string;
  helperText?: string;
  reverse?: boolean;
}

const SwitchField = React.forwardRef<
  React.ElementRef<typeof Switch>,
  SwitchFieldProps
>(({ className, label, description, helperText, reverse = false, ...props }, ref) => {
  const switchComponent = (
    <Switch ref={ref} className={className} {...props} />
  );

  const textComponent = (
    <div className="space-y-1 leading-none">
      {label && (
        <label
          htmlFor={props.id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      {description && (
        <p className="text-body-sm text-muted-foreground">
          {description}
        </p>
      )}
      {helperText && (
        <p className="text-body-sm text-muted-foreground mt-2">
          {helperText}
        </p>
      )}
    </div>
  );

  return (
    <div className={cn(
      "flex items-center justify-between space-x-2",
      reverse && "flex-row-reverse"
    )}>
      {reverse ? switchComponent : textComponent}
      {reverse ? textComponent : switchComponent}
    </div>
  );
});
SwitchField.displayName = "SwitchField";

export { Switch, SwitchField };
