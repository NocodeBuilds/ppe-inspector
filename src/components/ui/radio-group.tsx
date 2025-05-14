import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// Radio item with label, optional description and error
interface RadioItemWithLabelProps extends React.ComponentPropsWithoutRef<typeof RadioGroupItem> {
  label: string;
  description?: string;
}

const RadioItemWithLabel = React.forwardRef<
  React.ElementRef<typeof RadioGroupItem>,
  RadioItemWithLabelProps
>(({ className, label, description, ...props }, ref) => {
  return (
    <div className="flex items-start space-x-2">
      <RadioGroupItem ref={ref} className={className} {...props} />
      <div className="grid gap-1">
        <label
          htmlFor={props.id || props.value?.toString()}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
        {description && (
          <p className="text-body-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
});
RadioItemWithLabel.displayName = "RadioItemWithLabel";

// Radio group with field wrapper including label and error handling
interface RadioGroupFieldProps extends React.ComponentPropsWithoutRef<typeof RadioGroup> {
  label?: string;
  helperText?: string;
  error?: string;
}

const RadioGroupField = React.forwardRef<
  React.ElementRef<typeof RadioGroup>,
  RadioGroupFieldProps
>(({ className, label, helperText, error, children, ...props }, ref) => {
  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium leading-none">
          {label}
        </label>
      )}
      <RadioGroup ref={ref} className={className} {...props}>
        {children}
      </RadioGroup>
      {(helperText || error) && (
        <p className={cn(
          "text-sm",
          error ? "text-destructive" : "text-muted-foreground"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});
RadioGroupField.displayName = "RadioGroupField";

export { RadioGroup, RadioGroupItem, RadioItemWithLabel, RadioGroupField };
