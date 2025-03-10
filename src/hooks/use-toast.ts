
import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

import {
  useToast as useToastOriginal,
  toast as toastOriginal,
} from "@/components/ui/use-toast-primitive"

export const useToast = useToastOriginal
export const toast = toastOriginal

export type { Toast, ToastActionElement, ToastProps }
