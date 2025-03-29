
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOfflineSync } from './useOfflineSync';
import { toast } from './use-toast';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface UseNotificationMutationsReturn {
  addNotification: (title: string, message: string, type?: NotificationType) => Promise<any>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  showNotification: (titleOrOptions: string | { description?: string, [key: string]: any }, messageOrType?: string | NotificationType, typeOrOptions?: NotificationType | { description?: string, [key: string]: any }) => Promise<any>;
}

export const useNotificationMutations = (
  refreshNotifications: () => Promise<void>
): UseNotificationMutationsReturn => {
  const { user } = useAuth();
  const { queueAction } = useOfflineSync();
  
  const addNotification = useCallback(async (
    title: string, 
    message: string, 
    type: NotificationType = 'info'
  ) => {
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
      
      if (error) {
        // Queue for later if offline
        await queueAction('add_notification', newNotification);
        console.error('Error adding notification. Queued for later:', error);
        return null;
      }
      
      await refreshNotifications();
      return data;
    } catch (error) {
      console.error('Error adding notification:', error);
      return null;
    }
  }, [user, queueAction, refreshNotifications]);
  
  const markAsRead = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        await queueAction('update_notification', { id, read: true });
        console.error('Error marking notification as read. Queued for later:', error);
      }
      
      await refreshNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user, queueAction, refreshNotifications]);
  
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) {
        await queueAction('mark_all_read', { user_id: user.id });
        console.error('Error marking all notifications as read. Queued for later:', error);
      }
      
      await refreshNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user, queueAction, refreshNotifications]);
  
  const deleteNotification = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        await queueAction('delete_notification', { id });
        console.error('Error deleting notification. Queued for later:', error);
      }
      
      await refreshNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [user, queueAction, refreshNotifications]);
  
  const deleteAllNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        await queueAction('delete_all_notifications', { user_id: user.id });
        console.error('Error deleting all notifications. Queued for later:', error);
      }
      
      await refreshNotifications();
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  }, [user, queueAction, refreshNotifications]);

  // Unified notification system that shows both toast and adds to db
  const showNotification = useCallback((
    titleOrOptions: string | { description?: string, [key: string]: any },
    messageOrType?: string | NotificationType,
    typeOrOptions?: NotificationType | { description?: string, [key: string]: any }
  ) => {
    let title: string;
    let message: string = '';
    let type: NotificationType = 'info';
    
    // Case 1: (title, message, type)
    if (typeof titleOrOptions === 'string' && typeof messageOrType === 'string' && 
        messageOrType !== 'info' && messageOrType !== 'warning' && 
        messageOrType !== 'success' && messageOrType !== 'error') {
      title = titleOrOptions;
      message = messageOrType;
      type = (typeof typeOrOptions === 'string' ? typeOrOptions : 'info') as NotificationType;
    } 
    // Case 2: (title, type)
    else if (typeof titleOrOptions === 'string' && 
            (messageOrType === 'info' || messageOrType === 'warning' || 
             messageOrType === 'success' || messageOrType === 'error')) {
      title = titleOrOptions;
      type = messageOrType as NotificationType;
      if (typeOrOptions && typeof typeOrOptions === 'object') {
        const options = typeOrOptions as { description?: string };
        message = options.description || '';
      }
    } 
    // Case 3: Handle options object
    else {
      if (typeof titleOrOptions === 'string') {
        title = titleOrOptions;
        if (messageOrType && typeof messageOrType === 'object') {
          const options = messageOrType as { description?: string };
          message = options.description || '';
        }
      } else if (typeof titleOrOptions === 'object') {
        title = 'Notification';
        const options = titleOrOptions as { description?: string };
        message = options.description || '';
      } else {
        title = 'Notification';
      }
      
      if (typeof messageOrType === 'string' && 
         (messageOrType === 'info' || messageOrType === 'warning' || 
          messageOrType === 'success' || messageOrType === 'error')) {
        type = messageOrType;
      }
    }
    
    // Show toast notification
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : 
               type === 'success' ? 'success' :
               type === 'warning' ? 'warning' : undefined,
    });
    
    // Also add to notifications database for persistent storage
    return addNotification(title, message, type);
  }, [addNotification]);
  
  return {
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    showNotification
  };
};
