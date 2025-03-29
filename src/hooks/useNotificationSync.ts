
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useNetwork } from './useNetwork';
import { useOfflineSync } from './useOfflineSync';
import { supabase } from '@/integrations/supabase/client';
import { requestNotificationPermission } from '@/utils/pwaUtils';

export const useNotificationSync = (refreshNotifications: () => Promise<void>) => {
  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const offlineSync = useOfflineSync();
  const [hasPendingActions, setHasPendingActions] = useState(false);
  
  // Check for pending notification actions
  useEffect(() => {
    const checkPendingActions = async () => {
      if (user) {
        const pendingActions = await offlineSync.checkPendingActions();
        const hasNotificationActions = pendingActions.some(action => 
          ['add_notification', 'update_notification', 'mark_all_read', 
          'delete_notification', 'delete_all_notifications'].includes(action.type)
        );
        setHasPendingActions(hasNotificationActions);
      }
    };
    
    checkPendingActions();
  }, [user, offlineSync]);
  
  // Process any pending notification actions when coming back online
  useEffect(() => {
    if (isOnline && user && hasPendingActions) {
      const syncOfflineNotifications = async () => {
        await offlineSync.syncOfflineData();
        await refreshNotifications();
      };
      
      syncOfflineNotifications().catch(error => 
        console.error('Error processing pending notification actions:', error)
      );
    }
  }, [isOnline, user, hasPendingActions, offlineSync, refreshNotifications]);
  
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
    hasPendingActions
  };
};
