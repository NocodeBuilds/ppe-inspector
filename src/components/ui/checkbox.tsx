import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// Checkbox with label, optional error and helper text
interface CheckboxFieldProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label: string;
  description?: string;
  error?: string;
}

const CheckboxField = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxFieldProps
>(({ className, label, description, error, ...props }, ref) => (
  <div className="flex space-x-2">
    <Checkbox ref={ref} id={props.id} className={className} {...props} />
    <div className="grid gap-1.5 leading-none">
      <label
        htmlFor={props.id}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error && "text-destructive"
        )}
      >
        {label}
      </label>
      {description && (
        <p className="text-body-sm text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  </div>
));
CheckboxField.displayName = "CheckboxField";

export { Checkbox, CheckboxField };
