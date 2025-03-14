
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNetwork } from '@/hooks/useNetwork';
import { 
  getPendingOfflineActions, 
  clearCompletedOfflineActions,
  queueOfflineAction,
  getOfflineAction,
  updateOfflineAction,
  initializeDatabase
} from '@/utils/indexedDBUtils';
import { toast } from '@/hooks/use-toast';

interface OfflineSyncState {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  pendingActionsCount: number;
  lastSyncError: string | null;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds

/**
 * Hook for managing offline data synchronization
 * Handles syncing when the device comes back online
 * Includes more robust error handling and retry mechanisms
 */
export const useOfflineSync = () => {
  const { isOnline, wasOffline } = useNetwork();
  const [state, setState] = useState<OfflineSyncState>({
    isSyncing: false,
    lastSyncedAt: null,
    pendingActionsCount: 0,
    lastSyncError: null
  });
  const syncInProgress = useRef<boolean>(false);
  const retryTimeoutRef = useRef<number | null>(null);

  // Initialize database on mount
  useEffect(() => {
    initializeDatabase().catch(err => {
      console.error('Failed to initialize database:', err);
      setState(prev => ({
        ...prev,
        lastSyncError: 'Failed to initialize offline database'
      }));
    });
  }, []);

  // Function to check for pending actions
  const checkPendingActions = useCallback(async () => {
    try {
      const pendingActions = await getPendingOfflineActions();
      setState(prev => ({
        ...prev,
        pendingActionsCount: pendingActions.length,
        // Clear error if we successfully checked
        lastSyncError: pendingActions.length > 0 ? prev.lastSyncError : null
      }));
      return pendingActions;
    } catch (error) {
      console.error('Error checking pending actions:', error);
      setState(prev => ({
        ...prev,
        lastSyncError: 'Error checking pending actions'
      }));
      return [];
    }
  }, []);

  // Process a single action with retry logic
  const processAction = useCallback(async (actionId: string, attempt = 1): Promise<boolean> => {
    try {
      // Get action details
      const action = await getOfflineAction(actionId);
      if (!action) return false;
      
      console.log(`Processing offline action: ${action.type}, attempt ${attempt}`);
      
      // In a real implementation, we would process based on action type
      // For example:
      if (action.type === 'create_inspection') {
        // Process inspection creation
        // await api.createInspection(action.data);
        console.log('Processing create_inspection action:', action.data);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (action.type === 'update_ppe') {
        // Process PPE update
        // await api.updatePPE(action.data);
        console.log('Processing update_ppe action:', action.data);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Generic handling for other action types
        console.log(`Processing generic action: ${action.type}`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Mark action as completed
      await updateOfflineAction(actionId, { status: 'completed' });
      return true;
      
    } catch (error) {
      console.error(`Error processing action ${actionId}:`, error);
      
      // If we have retries left, mark for retry
      if (attempt < MAX_RETRY_ATTEMPTS) {
        await updateOfflineAction(actionId, { 
          status: 'pending',
          retryCount: attempt,
          lastError: error instanceof Error ? error.message : 'Unknown error'
        });
        return false;
      } else {
        // Max retries reached, mark as failed
        await updateOfflineAction(actionId, { 
          status: 'failed',
          lastError: error instanceof Error ? error.message : 'Unknown error' 
        });
        return false;
      }
    }
  }, []);

  // Function to sync data when online
  const syncOfflineData = useCallback(async (showToast = true) => {
    // Only sync if online and not already syncing
    if (!isOnline || syncInProgress.current) return;
    
    // Clear any existing retry timeout
    if (retryTimeoutRef.current !== null) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    // Get pending actions
    const pendingActions = await checkPendingActions();
    
    if (pendingActions.length === 0) {
      console.log('No pending actions to sync');
      setState(prev => ({
        ...prev,
        lastSyncError: null
      }));
      return;
    }
    
    // Set syncing state
    syncInProgress.current = true;
    setState(prev => ({ 
      ...prev, 
      isSyncing: true,
      lastSyncError: null
    }));
    
    // Show toast for user
    if (showToast && pendingActions.length > 0) {
      toast({
        title: 'Syncing Data',
        description: `Syncing ${pendingActions.length} offline ${pendingActions.length === 1 ? 'action' : 'actions'}...`,
        variant: 'default'
      });
    }
    
    try {
      // Process actions one by one
      let successCount = 0;
      let failureCount = 0;
      
      for (const action of pendingActions) {
        const success = await processAction(action.id);
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
        
        // Update pending count after each action
        setState(prev => ({
          ...prev,
          pendingActionsCount: pendingActions.length - successCount
        }));
      }
      
      // Clean up completed actions
      await clearCompletedOfflineActions();
      
      // Check if there are any remaining actions (failures that need retry)
      const remainingActions = await getPendingOfflineActions();
      
      if (remainingActions.length > 0) {
        // Some actions failed, schedule retry
        if (retryTimeoutRef.current === null) {
          retryTimeoutRef.current = window.setTimeout(() => {
            retryTimeoutRef.current = null;
            syncOfflineData(false); // Don't show toast on auto-retry
          }, RETRY_DELAY_MS);
        }
        
        setState(prev => ({
          ...prev,
          isSyncing: false,
          pendingActionsCount: remainingActions.length,
          lastSyncError: `${failureCount} ${failureCount === 1 ? 'action' : 'actions'} failed to sync. Will retry.`
        }));
        
        if (showToast) {
          toast({
            title: 'Sync Partially Complete',
            description: `Synced ${successCount} items. ${failureCount} ${failureCount === 1 ? 'item' : 'items'} failed and will be retried.`,
            variant: 'warning'
          });
        }
      } else {
        // All actions completed successfully
        setState(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: new Date(),
          pendingActionsCount: 0,
          lastSyncError: null
        }));
        
        if (showToast) {
          toast({
            title: 'Sync Complete',
            description: `Successfully synced ${successCount} offline ${successCount === 1 ? 'action' : 'actions'}`,
            variant: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
      
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncError: error instanceof Error ? error.message : 'Unknown sync error'
      }));
      
      if (showToast) {
        toast({
          title: 'Sync Failed',
          description: 'There was an error syncing your offline data. Will try again later.',
          variant: 'destructive'
        });
      }
      
      // Schedule retry
      if (retryTimeoutRef.current === null) {
        retryTimeoutRef.current = window.setTimeout(() => {
          retryTimeoutRef.current = null;
          syncOfflineData(false); // Don't show toast on auto-retry
        }, RETRY_DELAY_MS);
      }
    } finally {
      syncInProgress.current = false;
    }
  }, [isOnline, checkPendingActions, processAction]);

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
        status: 'pending',
        retryCount: 0,
        lastError: null
      });
      
      // Update the pending actions count
      checkPendingActions();
      
      // If we're online, try to sync immediately
      if (isOnline && !syncInProgress.current) {
        // Small delay to allow UI to update first
        setTimeout(() => syncOfflineData(false), 300);
      }
      
      return true;
    } catch (error) {
      console.error('Error queueing offline action:', error);
      setState(prev => ({
        ...prev,
        lastSyncError: 'Failed to queue offline action'
      }));
      return false;
    }
  }, [checkPendingActions, isOnline, syncOfflineData]);

  // Check for pending actions on mount
  useEffect(() => {
    checkPendingActions();
    
    // Set up periodic check for pending actions
    const intervalId = setInterval(() => {
      checkPendingActions();
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(intervalId);
      if (retryTimeoutRef.current !== null) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
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
          lastSyncedAt: new Date(),
          lastSyncError: null
        }));
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
    
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [checkPendingActions]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current !== null) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    syncOfflineData,
    queueAction,
    checkPendingActions,
    isOnline
  };
};

export default useOfflineSync;
