
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
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message || '',
        type: n.type,
        read: n.read,
        createdAt: new Date(n.created_at)
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
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title,
            message: options?.description || '',
            type,
            read: false
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error storing notification:', error);
      }
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
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
