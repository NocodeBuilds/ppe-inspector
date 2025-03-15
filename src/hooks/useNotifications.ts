
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useOfflineSync } from './useOfflineSync';

type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: Date;
  read: boolean;
  user_id: string;
}

export interface NotificationOptions {
  description?: string;
  [key: string]: any;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { queueAction } = useOfflineSync();
  
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      // Convert the data to our Notification type with parsed dates
      const formattedNotifications = data.map(item => ({
        ...item,
        createdAt: new Date(item.created_at),
        read: item.read || false,
        type: item.type || 'info'
      })) as Notification[];
      
      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    fetchNotifications();
    
    // Set up a real-time subscription
    if (user) {
      const subscription = supabase
        .channel('notifications_changes')
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
            fetchNotifications();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user, fetchNotifications]);
  
  const addNotification = async (title: string, message: string, type: NotificationType = 'info') => {
    if (!user) return null;
    
    try {
      const newNotification = {
        title,
        message,
        type,
        user_id: user.id,
        created_at: new Date().toISOString(),
        read: false
      };
      
      const { data, error } = await supabase
        .from('notifications')
        .insert(newNotification)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error adding notification:', error);
      return null;
    }
  };
  
  // Updated to handle both parameter styles
  const showNotification = (
    titleOrOptions: string | NotificationOptions,
    messageOrType: string | NotificationType = 'info',
    typeOrOptions?: NotificationType | NotificationOptions
  ) => {
    // Case 1: Called with (title, message, type)
    if (typeof titleOrOptions === 'string' && typeof messageOrType === 'string') {
      const title = titleOrOptions;
      const message = messageOrType;
      const type = (typeof typeOrOptions === 'string' ? typeOrOptions : 'info') as NotificationType;
      
      // Show a toast notification
      toast({
        title,
        description: message,
        variant: type === 'error' ? 'destructive' : 
                 type === 'success' ? 'success' :
                 type === 'warning' ? 'warning' : undefined,
      });
      
      // Also add it to the database
      return addNotification(title, message, type);
    }
    // Case 2: Called with (title, type, options)
    else if (typeof titleOrOptions === 'string' && 
             (messageOrType === 'info' || messageOrType === 'warning' || 
              messageOrType === 'success' || messageOrType === 'error')) {
      const title = titleOrOptions;
      const type = messageOrType;
      const options = typeOrOptions as NotificationOptions || {};
      const message = options.description || '';
      
      // Show a toast notification
      toast({
        title,
        description: message,
        variant: type === 'error' ? 'destructive' : 
                 type === 'success' ? 'success' :
                 type === 'warning' ? 'warning' : undefined,
      });
      
      // Also add it to the database
      return addNotification(title, message, type);
    }
    // Case 3: Called with (title, options)
    else {
      const title = typeof titleOrOptions === 'string' ? titleOrOptions : 'Notification';
      const options = typeof titleOrOptions === 'string' ? (messageOrType as NotificationOptions) : (titleOrOptions as NotificationOptions);
      const message = options.description || '';
      const type = ((typeof messageOrType === 'string' && 
                    (messageOrType === 'info' || messageOrType === 'warning' || 
                     messageOrType === 'success' || messageOrType === 'error')) 
                   ? messageOrType : 'info') as NotificationType;
      
      // Show a toast notification
      toast({
        title,
        description: message,
        variant: type === 'error' ? 'destructive' : 
                 type === 'success' ? 'success' :
                 type === 'warning' ? 'warning' : undefined,
      });
      
      // Also add it to the database
      return addNotification(title, message, type);
    }
  };
  
  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      // Optimistically update the UI
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update in the database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        // If there's an error, queue for sync when online
        await queueAction('update_notification', { id, read: true });
        console.error('Error marking notification as read. Queued for later:', error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      // Optimistically update the UI
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      
      // Update in the database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) {
        // If there's an error, queue for sync when online
        await queueAction('mark_all_read', { user_id: user.id });
        console.error('Error marking all notifications as read. Queued for later:', error);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const deleteNotification = async (id: string) => {
    if (!user) return;
    
    try {
      // Optimistically update the UI
      const notificationToDelete = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Delete from the database
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        // If there's an error, queue for sync when online
        await queueAction('delete_notification', { id });
        console.error('Error deleting notification. Queued for later:', error);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  const deleteAllNotifications = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      // Optimistically update the UI
      setNotifications([]);
      setUnreadCount(0);
      
      // Delete from the database
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        // If there's an error, queue for sync when online
        await queueAction('delete_all_notifications', { user_id: user.id });
        console.error('Error deleting all notifications. Queued for later:', error);
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };
  
  return {
    notifications,
    unreadCount,
    isLoading,
    showNotification,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};
