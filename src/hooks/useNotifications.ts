
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase, Notification } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

type NotificationVariant = 'success' | 'error' | 'warning' | 'info';

type NotificationOptions = {
  description?: string;
  duration?: number; // in milliseconds
};

/**
 * Hook to manage notifications
 * Provides methods for displaying UI notifications and managing database notifications
 */
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from database
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setNotifications(data as Notification[]);
          setUnreadCount(data.filter(n => !n.read).length);
        }
      } catch (error: any) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to notification changes
    const channel = supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Refresh notifications when there's a change
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Display UI toast notification
  const showNotification = (
    title: string, 
    variant: NotificationVariant = 'info',
    options?: NotificationOptions
  ) => {
    toast({
      title,
      description: options?.description,
      variant: variant === 'info' ? 'default' : variant,
      duration: options?.duration || 5000
    });
  };

  // Add notification to database
  const addDatabaseNotification = async (
    title: string,
    message: string,
    type: NotificationVariant = 'info'
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: user.id,
        title,
        message,
        type,
        read: false
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to add notification:', error);
      showNotification('Failed to save notification', 'error');
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    showNotification,
    addDatabaseNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}
