import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, ...props }, ref) => {
    const id = props.id || React.useId();
    
    return (
      <div className="space-y-1.5">
        {label && (
          <label 
            htmlFor={id}
            className="form-label block"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          id={id}
          {...props}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            helperText ? `${id}-helper` : error ? `${id}-error` : undefined
          }
        />
        {helperText && !error && (
          <p id={`${id}-helper`} className="form-helper">
            {helperText}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className="form-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
