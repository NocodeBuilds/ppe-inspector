
import { toast } from '@/hooks/use-toast';
import { ToastActionElement } from '@/components/ui/toast';

type NotificationVariant = 'default' | 'error' | 'warning' | 'info' | 'success';

interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: ToastActionElement; // This needs to be of type ToastActionElement
}

const mapVariantToToastVariant = (variant: NotificationVariant): 'default' | 'destructive' => {
  switch (variant) {
    case 'error':
    case 'warning':
      return 'destructive';
    case 'success':
    case 'info':
    case 'default':
    default:
      return 'default';
  }
};

/**
 * Custom hook for consistent toast notifications across the application
 */
export const useNotifications = () => {
  /**
   * Show a notification toast
   * @param message - The message to display (or title if description is provided)
   * @param variant - The variant/severity of the notification
   * @param options - Additional options for the toast
   */
  const showNotification = (
    message: string,
    variant: NotificationVariant = 'default',
    options?: NotificationOptions
  ) => {
    const toastVariant = mapVariantToToastVariant(variant);
    
    toast({
      title: options?.title || message,
      description: options?.description,
      variant: toastVariant,
      duration: options?.duration || 5000,
      action: options?.action,
    });
  };

  /**
   * Show a success notification
   */
  const showSuccess = (message: string, options?: NotificationOptions) => {
    showNotification(message, 'success', options);
  };

  /**
   * Show an error notification
   */
  const showError = (message: string, options?: NotificationOptions) => {
    showNotification(message, 'error', options);
  };

  /**
   * Show a warning notification
   */
  const showWarning = (message: string, options?: NotificationOptions) => {
    showNotification(message, 'warning', options);
  };

  /**
   * Show an info notification
   */
  const showInfo = (message: string, options?: NotificationOptions) => {
    showNotification(message, 'info', options);
  };

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
