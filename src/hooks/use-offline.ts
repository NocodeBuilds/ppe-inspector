import { useState, useEffect, useCallback } from 'react';
import {
  isOnline,
  isServiceWorkerSupported,
  getStoredInspections,
  syncPendingInspections,
  storeInspection,
  StoredInspection
} from '@/utils/offlineSyncUtils';

interface UseOfflineHook {
  online: boolean;
  offlineSupported: boolean;
  pendingInspections: StoredInspection[];
  syncInspections: () => Promise<void>;
  saveInspectionOffline: (equipmentId: string, data: any) => Promise<string>;
  pendingCount: number;
  syncing: boolean;
}

export function useOffline(): UseOfflineHook {
  const [online, setOnline] = useState(isOnline());
  const [offlineSupported, setOfflineSupported] = useState(false);
  const [pendingInspections, setPendingInspections] = useState<StoredInspection[]>([]);
  const [syncing, setSyncing] = useState(false);
  
  // Check for pending inspections
  const updatePendingInspections = useCallback(() => {
    const inspections = getStoredInspections();
    setPendingInspections(inspections);
  }, []);
  
  // Sync inspections
  const syncInspections = useCallback(async () => {
    if (!online || syncing) return;
    
    setSyncing(true);
    try {
      await syncPendingInspections();
      updatePendingInspections();
    } catch (error) {
      console.error('Error syncing inspections:', error);
    } finally {
      setSyncing(false);
    }
  }, [online, syncing, updatePendingInspections]);
  
  // Save inspection data offline
  const saveInspectionOffline = useCallback(async (equipmentId: string, data: any): Promise<string> => {
    const id = storeInspection(equipmentId, data);
    updatePendingInspections();
    return id;
  }, [updatePendingInspections]);
  
  // Set up event listeners and check capabilities
  useEffect(() => {
    // Check for service worker support
    setOfflineSupported(isServiceWorkerSupported());
    
    // Update online status
    const handleOnline = () => {
      setOnline(true);
      // Automatically attempt to sync when coming back online
      setTimeout(() => {
        syncInspections();
      }, 2000); // Wait a bit for connection to stabilize
    };
    
    const handleOffline = () => {
      setOnline(false);
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check for pending inspections
    updatePendingInspections();
    
    // Periodic check for pending inspections 
    const interval = setInterval(updatePendingInspections, 30000);
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncInspections, updatePendingInspections]);
  
  return {
    online,
    offlineSupported,
    pendingInspections,
    syncInspections,
    saveInspectionOffline,
    pendingCount: pendingInspections.length,
    syncing
  };
}

export default useOffline;
