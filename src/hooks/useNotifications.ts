
import { useNotificationQueries } from './useNotificationQueries';
import { useNotificationMutations, NotificationType } from './useNotificationMutations';
import { useNotificationSync } from './useNotificationSync';

export type { NotificationType };

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: Date;
  read: boolean;
  user_id: string;
}

export const useNotifications = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    fetchNotifications 
  } = useNotificationQueries();
  
  const { 
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    showNotification
  } = useNotificationMutations(fetchNotifications);
  
  const { 
    syncStatus, 
    hasPendingActions 
  } = useNotificationSync(fetchNotifications);
  
  return {
    // Data
    notifications,
    unreadCount,
    isLoading,
    syncStatus,
    hasPendingActions,
    
    // Actions
    showNotification,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications: fetchNotifications
  };
};
