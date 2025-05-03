
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationType } from '@/types/ppe';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Define the variants for toast notifications
export type NotificationVariant = 'default' | 'destructive' | 'success' | 'warning';

// Map NotificationType to NotificationVariant for consistent usage
const mapTypeToVariant = (type: NotificationType): NotificationVariant => {
  switch (type) {
    case 'success': return 'success';
    case 'error': return 'destructive';
    case 'warning': return 'warning';
    case 'info': return 'default';
    default: return 'default';
  }
};

// Define options for notifications
interface NotificationOptions {
  description?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotifications = data.map((notification): Notification => ({
        id: notification.id,
        user_id: notification.user_id,
        title: notification.title,
        message: notification.message || '',
        type: notification.type as NotificationType || 'info',
        read: notification.read || false,
        created_at: notification.created_at,
        createdAt: notification.created_at
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      // Use the appropriate variant for UI consistency
      toast({
        title: 'Error',
        description: `Failed to load notifications: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Show a toast notification
  const showToastNotification = useCallback((
    title: string,
    type: NotificationType = 'info',
    options: NotificationOptions = {}
  ) => {
    // Map notification type to variant for UI consistency
    const variant = mapTypeToVariant(type);
    
    toast({
      title,
      description: options.description,
      variant
    });
  }, [toast]);

  // Add a notification to the database
  const addDatabaseNotification = useCallback(async (
    title: string,
    message: string,
    type: NotificationType = 'info'
  ) => {
    if (!user) return;

    try {
      const notification = {
        user_id: user.id,
        title,
        message,
        type,
        read: false
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;

      // Refetch to update the list
      fetchNotifications();

      // Also show as toast
      showToastNotification(title, type, { description: message });

      return data;
    } catch (error: any) {
      console.error('Error adding notification:', error);
      toast({
        title: 'Error',
        description: `Failed to add notification: ${error.message}`,
        variant: 'destructive' 
      });
    }
  }, [user, fetchNotifications, showToastNotification, toast]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
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
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: `Failed to update notification: ${error.message}`,
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: `Failed to update notifications: ${error.message}`,
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
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
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: `Failed to delete notification: ${error.message}`,
        variant: 'destructive'
      });
    }
  }, [notifications, toast]);

  // Delete all notifications for the user
  const deleteAllNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error deleting all notifications:', error);
      toast({
        title: 'Error',
        description: `Failed to delete notifications: ${error.message}`,
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();

    // Set up a subscription to refresh notifications on change
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: user ? `user_id=eq.${user.id}` : undefined
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    showToastNotification,
    addDatabaseNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};
