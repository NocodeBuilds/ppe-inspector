
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

type NotificationType = 'warning' | 'info' | 'success' | 'error';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
}

interface NotificationOptions {
  description?: string;
  duration?: number;
  action?: React.ReactNode;
}

/**
 * Hook for managing and displaying notifications
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // For demo purposes, add some sample notifications
  useEffect(() => {
    if (user) {
      // These would normally come from a backend API
      setNotifications([
        {
          id: '1',
          title: 'PPE Expiring Soon',
          message: 'Full Body Harness #FB123 will expire in 7 days',
          type: 'warning',
          read: false,
          createdAt: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          id: '2',
          title: 'Inspection Due',
          message: 'Safety Helmet #123 needs inspection',
          type: 'info',
          read: false,
          createdAt: new Date(Date.now() - 172800000) // 2 days ago
        }
      ]);
    } else {
      setNotifications([]);
    }
  }, [user]);

  /**
   * Show a notification
   */
  const showNotification = (
    title: string, 
    type: NotificationType = 'info',
    options?: NotificationOptions
  ) => {
    // Show toast
    toast({
      title,
      description: options?.description,
      variant: type === 'error' ? 'destructive' : 'default',
      duration: options?.duration || 5000,
      action: options?.action,
    });
    
    // Also add to notifications list if user is logged in
    if (user) {
      const newNotification: Notification = {
        id: Date.now().toString(),
        title,
        message: options?.description || '',
        type,
        read: false,
        createdAt: new Date()
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  /**
   * Mark a notification as read
   */
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  /**
   * Delete a notification
   */
  const deleteNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  /**
   * Clear all notifications
   */
  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    unreadCount,
    showNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };
};
