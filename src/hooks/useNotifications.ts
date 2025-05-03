
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Notification, NotificationVariant, NotificationType } from '@/types/ppe';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Map between our notification types and toast variants
  const variantMap: Record<NotificationType, NotificationVariant> = {
    'success': 'success',
    'error': 'destructive',
    'warning': 'warning',
    'info': 'default'
  };

  // Load notifications from the database
  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert to our notification type with getters
      const typedNotifications = data.map(notification => ({
        ...notification,
        createdAt: notification.created_at
      })) as Notification[];
      
      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Load notifications on mount and when user changes
  useEffect(() => {
    loadNotifications();
    
    // Set up subscription for real-time updates if user is logged in
    if (user) {
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          payload => {
            const newNotification = payload.new as Notification;
            
            // Update notifications state
            setNotifications(current => [newNotification, ...current]);
            setUnreadCount(count => count + 1);
            
            // Show a toast for the new notification
            const variant: NotificationVariant = variantMap[newNotification.type as NotificationType] || 'default';
            
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant
            });
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user, loadNotifications, toast]);

  // Show a toast notification
  const showToastNotification = useCallback((
    title: string, 
    type: NotificationType = 'info',
    options?: { description?: string }
  ) => {
    const variant: NotificationVariant = variantMap[type] || 'default';
    
    toast({
      title,
      description: options?.description,
      variant
    });
  }, [toast]);
  
  // Add a notification to the database
  const addDatabaseNotification = useCallback(async (
    title: string,
    message: string,
    type: NotificationType = 'info'
  ) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title,
          message,
          type,
          read: false
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding notification:', error);
      return null;
    }
  }, [user]);
  
  // Mark a notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(current => 
        current.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(count => Math.max(0, count - 1));
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(current => 
        current.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }, [user]);
  
  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(current => current.filter(n => n.id !== id));
      setUnreadCount(count => 
        count - (notifications.find(n => n.id === id && !n.read) ? 1 : 0)
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }, [notifications]);
  
  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
  }, [user]);

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
}
