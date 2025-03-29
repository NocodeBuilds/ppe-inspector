
import * as React from "react";
import {
  useToast as usePrimitiveToast,
  toast as primitiveToast,
  type ToastActionElement,
  type ToasterToast as PrimitiveToasterToast,
} from "@/components/ui/use-toast-primitive";

export type ToastType = "default" | "destructive" | "success" | "warning" | "info";

export interface NotificationOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: ToastType;
  duration?: number;
  important?: boolean;
  onDismiss?: () => void;
}

// Enhanced toast function with improved options
export const toast = (options: NotificationOptions | string) => {
  const opts = typeof options === "string" 
    ? { title: options } 
    : options;

  return primitiveToast({
    ...opts,
    duration: opts.duration || (opts.important ? 10000 : 5000),
    className: opts.variant === 'success' 
      ? 'bg-green-500 text-white border-green-600' 
      : opts.variant === 'warning'
      ? 'bg-amber-500 text-white border-amber-600'
      : opts.variant === 'destructive'
      ? 'border-red-600'
      : undefined,
  });
};

// Enhanced useToast hook
export const useToast = () => {
  const primitive = usePrimitiveToast();
  
  return {
    ...primitive,
    toast,
  };
};

export type { ToastActionElement };
