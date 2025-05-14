import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "",
        required: "after:content-['*'] after:text-destructive after:ml-0.5",
        optional: "after:content-['(optional)'] after:text-muted-foreground after:ml-1 after:text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, variant, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant }), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

// A label with optional help text, error message, and required/optional styling
interface LabelWithHelpProps extends Omit<React.ComponentPropsWithoutRef<typeof Label>, 'variant'> {
  helperText?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
}

const LabelWithHelp = React.forwardRef<
  React.ElementRef<typeof Label>,
  LabelWithHelpProps
>(({ className, helperText, error, required, optional, children, ...props }, ref) => {
  // Determine the variant based on the required/optional props
  const variant = required ? "required" : optional ? "optional" : "default";
  
  return (
    <div className="space-y-1.5">
      <Label
        ref={ref}
        variant={variant}
        className={className}
        {...props}
      >
        {children}
      </Label>
      {(helperText || error) && (
        <p className={cn(
          "text-body-sm",
          error ? "text-destructive" : "text-muted-foreground"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});
LabelWithHelp.displayName = "LabelWithHelp";

export { Label, LabelWithHelp, labelVariants };
