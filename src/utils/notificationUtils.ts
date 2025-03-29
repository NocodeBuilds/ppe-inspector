
import { toast } from '@/hooks/use-toast';
import { NotificationType } from '@/hooks/useNotificationMutations';
import { ToastActionElement } from '@/components/ui/use-toast-primitive';

/**
 * Show a toast notification with consistent styling
 */
export function showToast(
  title: string, 
  message?: string, 
  type: NotificationType = 'info',
  options?: { 
    duration?: number;
    action?: ToastActionElement;
    important?: boolean;
  }
) {
  return toast({
    title,
    description: message,
    variant: type === 'error' ? 'destructive' : 
             type === 'success' ? 'success' :
             type === 'warning' ? 'warning' : undefined,
    duration: options?.duration || (options?.important ? 10000 : 5000),
    action: options?.action,
  });
}

/**
 * Show an error toast with consistent styling
 */
export function showError(title: string, message?: string, options?: { duration?: number }) {
  return showToast(title, message, 'error', { ...options, important: true });
}

/**
 * Show a success toast with consistent styling
 */
export function showSuccess(title: string, message?: string) {
  return showToast(title, message, 'success');
}

/**
 * Show a warning toast with consistent styling
 */
export function showWarning(title: string, message?: string, options?: { duration?: number }) {
  return showToast(title, message, 'warning', { ...options, important: true });
}

/**
 * Show an info toast with consistent styling
 */
export function showInfo(title: string, message?: string) {
  return showToast(title, message, 'info');
}

/**
 * Helper for showing connection status notifications
 */
export function showConnectionStatus(online: boolean) {
  if (online) {
    showSuccess('Connection Restored', 'You are back online');
  } else {
    showWarning('Offline Mode', 'Changes will be synced when you reconnect', { duration: 7000 });
  }
}

/**
 * Helper for showing API error notifications
 */
export function showApiError(error: any) {
  const message = error?.message || error?.error_description || 'An unexpected error occurred';
  showError('API Error', message);
}

/**
 * Helper for showing validation error notifications
 */
export function showValidationError(error: any) {
  let message = 'Please check your input and try again';
  
  if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
  }
  
  showError('Validation Error', message);
}
