
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';

type NotificationType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';

interface NotificationOptions {
  description?: string;
  duration?: number;
  position?: ToastPosition;
  action?: React.ReactNode;
  // Track which notifications have been shown to prevent duplicates
  dedupeKey?: string;
}

/**
 * Custom hook for managing notifications with deduplication
 */
export const useNotifications = () => {
  const { toast } = useToast();
  
  // Use a Set to track shown notifications
  const shownNotifications = new Set<string>();
  
  /**
   * Show a notification with deduplication
   */
  const showNotification = (
    title: string,
    type: NotificationType = 'info',
    options: NotificationOptions = {}
  ) => {
    const { description, duration = 5000, dedupeKey } = options;
    
    // Create a dedupe key from title + description if not provided
    const key = dedupeKey || `${title}:${description || ''}`;
    
    // Skip if this notification was recently shown
    if (shownNotifications.has(key)) {
      return;
    }
    
    // Mark as shown
    shownNotifications.add(key);
    
    // Use UI toast for more complex notifications
    toast({
      title,
      description,
      variant: type === 'success' ? 'default' : type,
      duration,
    });
    
    // Clear from tracking after duration
    setTimeout(() => {
      shownNotifications.delete(key);
    }, duration);
  };
  
  /**
   * Show a simpler toast notification through Sonner
   */
  const showToast = (
    message: string,
    type: NotificationType = 'info',
    options: NotificationOptions = {}
  ) => {
    const { duration = 5000, dedupeKey } = options;
    
    // Create a dedupe key from message
    const key = dedupeKey || message;
    
    // Skip if this notification was recently shown
    if (shownNotifications.has(key)) {
      return;
    }
    
    // Mark as shown
    shownNotifications.add(key);
    
    // Show through Sonner
    switch (type) {
      case 'success':
        sonnerToast.success(message, { duration });
        break;
      case 'error':
        sonnerToast.error(message, { duration });
        break;
      case 'warning':
        sonnerToast.warning(message, { duration });
        break;
      case 'info':
      default:
        sonnerToast.info(message, { duration });
        break;
    }
    
    // Clear from tracking after duration
    setTimeout(() => {
      shownNotifications.delete(key);
    }, duration);
  };
  
  return {
    showNotification,
    showToast,
    success: (title: string, options?: NotificationOptions) => 
      showNotification(title, 'success', options),
    error: (title: string, options?: NotificationOptions) => 
      showNotification(title, 'error', options),
    warning: (title: string, options?: NotificationOptions) => 
      showNotification(title, 'warning', options),
    info: (title: string, options?: NotificationOptions) => 
      showNotification(title, 'info', options),
  };
};
