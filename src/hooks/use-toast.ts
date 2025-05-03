
import * as React from "react"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastProps,
} from "@/components/ui/toast"
import {
  useToast as usePrimitiveToast,
  type ToastActionElement,
  type ToasterToast as PrimitiveToasterToast,
} from "@/components/ui/use-toast-primitive"

export type NotificationVariant = "default" | "destructive" | "success" | "warning" | "error";

export interface NotificationOptions {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: NotificationVariant
}

// Re-export the hooks and toast function
export { useToast, toast } from "@/components/ui/use-toast-primitive"
