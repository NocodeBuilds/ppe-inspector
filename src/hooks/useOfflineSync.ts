
import { useState, useEffect, useCallback } from 'react';
import { useNetwork } from '@/hooks/useNetwork';
import { 
  getPendingOfflineActions, 
  clearCompletedOfflineActions,
  queueOfflineAction,
  initializeDatabase
} from '@/utils/indexedDBUtils';
import { toast } from '@/hooks/use-toast';

interface OfflineSyncState {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  pendingActionsCount: number;
}

/**
 * Hook for managing offline data synchronization
 * Handles syncing when the device comes back online
 */
export const useOfflineSync = () => {
  const { isOnline, wasOffline } = useNetwork();
  const [state, setState] = useState<OfflineSyncState>({
    isSyncing: false,
    lastSyncedAt: null,
    pendingActionsCount: 0
  });

  // Initialize database on mount
  useEffect(() => {
    initializeDatabase().catch(err => {
      console.error('Failed to initialize database:', err);
    });
  }, []);

  // Function to check for pending actions
  const checkPendingActions = useCallback(async () => {
    try {
      const pendingActions = await getPendingOfflineActions();
      setState(prev => ({
        ...prev,
        pendingActionsCount: pendingActions.length
      }));
      return pendingActions;
    } catch (error) {
      console.error('Error checking pending actions:', error);
      return [];
    }
  }, []);

  // Function to sync data when online
  const syncOfflineData = useCallback(async () => {
    // Only sync if online and not already syncing
    if (!isOnline || state.isSyncing) return;
    
    // Get pending actions
    const pendingActions = await checkPendingActions();
    
    if (pendingActions.length === 0) {
      console.log('No pending actions to sync');
      return;
    }
    
    try {
      setState(prev => ({ ...prev, isSyncing: true }));
      
      // Show toast for user
      if (pendingActions.length > 0) {
        toast({
          title: 'Syncing Data',
          description: `Syncing ${pendingActions.length} offline ${pendingActions.length === 1 ? 'action' : 'actions'}...`,
          variant: 'default'
        });
      }
      
      // In a real implementation, we would process each action here
      console.log(`Processing ${pendingActions.length} offline actions`);
      
      // For demo purposes, just mark them as completed after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear completed actions
      await clearCompletedOfflineActions();
      
      // Update state with new sync time
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
        pendingActionsCount: 0
      }));
      
      toast({
        title: 'Sync Complete',
        description: `Successfully synced ${pendingActions.length} offline ${pendingActions.length === 1 ? 'action' : 'actions'}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error syncing offline data:', error);
      
      toast({
        title: 'Sync Failed',
        description: 'There was an error syncing your offline data. Will try again later.',
        variant: 'destructive'
      });
      
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [isOnline, state.isSyncing, checkPendingActions]);

  // Queue an offline action for later synchronization
  const queueAction = useCallback(async (
    actionType: string,
    data: any,
    metadata?: any
  ) => {
    try {
      await queueOfflineAction({
        type: actionType,
        data,
        metadata,
        status: 'pending'
      });
      
      // Update the pending actions count
      checkPendingActions();
      
      return true;
    } catch (error) {
      console.error('Error queueing offline action:', error);
      return false;
    }
  }, [checkPendingActions]);

  // Check for pending actions on mount
  useEffect(() => {
    checkPendingActions();
  }, [checkPendingActions]);

  // Listen for online/offline changes
  useEffect(() => {
    // If we were offline and are now online, sync data
    if (isOnline && wasOffline) {
      syncOfflineData();
    }
  }, [isOnline, wasOffline, syncOfflineData]);

  // Listen for service worker messages
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const { data } = event;
      
      // Handle sync complete messages from service worker
      if (data?.type === 'SYNC_COMPLETE' || data?.type === 'REPORT_SYNC_COMPLETE') {
        console.log('Received sync completion from service worker:', data.message);
        
        // Refresh pending actions count
        checkPendingActions();
        
        // Update last synced time
        setState(prev => ({
          ...prev,
          lastSyncedAt: new Date()
        }));
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
    
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [checkPendingActions]);

  return {
    ...state,
    syncOfflineData,
    queueAction,
    checkPendingActions,
    isOnline
  };
};

export default useOfflineSync;
