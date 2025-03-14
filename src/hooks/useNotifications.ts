
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

interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Subscribe to notifications channel when user is authenticated
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

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
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          // Initial fetch after successful subscription
          fetchNotifications();
        }
      });

    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching notifications for user:', user.id);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      console.log('Notifications fetched:', data?.length || 0);
      
      if (data) {
        const typedData = data as unknown as NotificationRecord[];
        
        setNotifications(typedData.map(n => ({
          id: n.id,
          title: n.title || '',
          message: n.message || '',
          type: (n.type as NotificationType) || 'info',
          read: n.read || false,
          createdAt: new Date(n.created_at || Date.now())
        })));
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setIsLoading(false);
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
        console.log('Storing notification:', { title, type });
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title,
            message: options?.description || '',
            type,
            read: false
          });

        if (error) {
          console.error('Error storing notification:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error in showNotification:', error);
      }
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      console.log('Marking notification as read:', id);
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }

      // Update local state to reflect the change
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      console.log('Marking all notifications as read');
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }

      // Update local state to reflect the change
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    
    try {
      console.log('Deleting notification:', id);
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }

      // Update local state to reflect the change
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error in deleteNotification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    showNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications
  };
};
