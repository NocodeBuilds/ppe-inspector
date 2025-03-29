
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useNetwork } from './useNetwork';
import { useOfflineSync } from './useOfflineSync';
import { supabase } from '@/integrations/supabase/client';
import { requestNotificationPermission } from '@/utils/pwaUtils';

export const useNotificationSync = (refreshNotifications: () => Promise<void>) => {
  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const { pendingActions, processPendingActions } = useOfflineSync();
  
  // Process any pending notification actions when coming back online
  useEffect(() => {
    if (isOnline && user && pendingActions.length > 0) {
      const notificationActions = pendingActions.filter(action => 
        ['add_notification', 'update_notification', 'mark_all_read', 
         'delete_notification', 'delete_all_notifications'].includes(action.type)
      );
      
      if (notificationActions.length > 0) {
        processPendingActions(notificationActions)
          .then(() => refreshNotifications())
          .catch(error => console.error('Error processing pending notification actions:', error));
      }
    }
  }, [isOnline, user, pendingActions, processPendingActions, refreshNotifications]);
  
  // Request notification permissions
  useEffect(() => {
    if (user) {
      requestNotificationPermission()
        .then(granted => {
          console.log(`Notification permission ${granted ? 'granted' : 'denied'}`);
        })
        .catch(error => {
          console.error('Error requesting notification permission:', error);
        });
    }
  }, [user]);
  
  return {
    syncStatus: isOnline ? 'online' : 'offline',
    hasPendingActions: pendingActions.some(action => 
      ['add_notification', 'update_notification', 'mark_all_read', 
       'delete_notification', 'delete_all_notifications'].includes(action.type)
    )
  };
};
