
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ToastActionElement } from '@/components/ui/toast';
import { supabase } from '@/integrations/supabase/client';

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
  action?: ToastActionElement;
}

// Define a workaround type for the notifications table
// This allows us to use the table name without TypeScript errors
type GenericTable = {
  id: string;
  user_id?: string;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  created_at?: string;
  [key: string]: any;
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Subscribe to notifications channel when user is authenticated
  useEffect(() => {
    if (!user) return;

    // Set up realtime subscription for notifications
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification change received:', payload);
          
          // Refresh notifications after any change
          fetchNotifications();
        }
      )
      .subscribe();

    // Initial fetch
    fetchNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Use 'from' with a type assertion to work around TypeScript limitations
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type assertion for the returned data
      const notificationData = data as unknown as GenericTable[];
      
      setNotifications(notificationData.map(n => ({
        id: n.id,
        title: n.title || '',
        message: n.message || '',
        type: (n.type as NotificationType) || 'info',
        read: n.read || false,
        createdAt: new Date(n.created_at || Date.now())
      })));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const showNotification = async (
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

    // Store notification in database if user is logged in
    if (user) {
      try {
        // Use type assertion for the table name
        const { error } = await supabase
          .from('notifications' as any)
          .insert({
            user_id: user.id,
            title,
            message: options?.description || '',
            type,
            read: false
          } as any);

        if (error) throw error;
      } catch (error) {
        console.error('Error storing notification:', error);
      }
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Use type assertion for the table name
      const { error } = await supabase
        .from('notifications' as any)
        .update({ read: true } as any)
        .eq('id', id);

      if (error) throw error;

      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      // Use type assertion for the table name
      const { error } = await supabase
        .from('notifications' as any)
        .update({ read: true } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // Use type assertion for the table name
      const { error } = await supabase
        .from('notifications' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    showNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
