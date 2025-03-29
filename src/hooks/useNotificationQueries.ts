
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Notification } from './useNotifications';

export interface UseNotificationQueriesReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationQueries = (): UseNotificationQueriesReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
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
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Map the database fields to our client-side model
      const formattedNotifications = data.map(item => ({
        id: item.id,
        title: item.title,
        message: item.message,
        type: item.type as 'info' | 'warning' | 'success' | 'error',
        createdAt: new Date(item.created_at),
        read: item.read || false,
        user_id: item.user_id,
        category: item.category || 'general',
        importance: item.importance || 'medium',
        created_at: item.created_at
      })) as Notification[];
      
      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Set up subscription to real-time changes
  useEffect(() => {
    fetchNotifications();
    
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
  
  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications
  };
};
