
import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

import {
  useToast as useToastOriginal,
  toast as toastOriginal,
} from "@/components/ui/use-toast-primitive"

type ToastOptions = Omit<ToastProps, "title" | "description"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Track last toast to prevent duplicates
const recentToasts = new Map<string, number>();

// Custom toast function that prevents duplicate toasts
const deduplicatedToast = (props: ToastOptions) => {
  // Create a key from toast content
  const toastKey = `${props.title}-${props.description}`;
  const now = Date.now();
  
  // Check if we've shown this toast recently (within 2 seconds)
  if (recentToasts.has(toastKey)) {
    const lastShown = recentToasts.get(toastKey) || 0;
    if (now - lastShown < 2000) {
      // Skip showing duplicate toast
      return;
    }
  }
  
  // Remember this toast was shown
  recentToasts.set(toastKey, now);
  
  // Clean up old toast records (older than 10 seconds)
  for (const [key, timestamp] of recentToasts.entries()) {
    if (now - timestamp > 10000) {
      recentToasts.delete(key);
    }
  }
  
  // Show the toast
  return toastOriginal(props);
};

export const useToast = useToastOriginal;
export const toast = deduplicatedToast;

export type { Toast, ToastActionElement, ToastProps, ToastOptions };
