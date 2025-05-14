import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

// Type definitions
export interface StoredInspection {
  id: string;
  data: any;
  timestamp: number;
  equipmentId: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
}

// Constants
const STORAGE_KEY_PREFIX = 'ppe_inspection_';
const MAX_RETRY_ATTEMPTS = 3;

// Helper to check if browser is online
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Helper to check if service workers are supported
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

// Helper to wait for service worker to be ready
export const waitForServiceWorkerReady = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isServiceWorkerSupported()) {
    return null;
  }
  
  try {
    return await navigator.serviceWorker.ready;
  } catch (err) {
    console.error('Error waiting for service worker to be ready', err);
    return null;
  }
};

// Get all stored inspections
export const getStoredInspections = (): StoredInspection[] => {
  const stored: StoredInspection[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          stored.push(JSON.parse(value));
        }
      } catch (err) {
        console.error(`Error parsing stored inspection: ${key}`, err);
      }
    }
  }
  
  // Sort by timestamp (newest first)
  return stored.sort((a, b) => b.timestamp - a.timestamp);
};

// Get a specific stored inspection
export const getStoredInspection = (id: string): StoredInspection | null => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error(`Error getting stored inspection: ${id}`, err);
    return null;
  }
};

// Store an inspection for offline sync
export const storeInspection = (equipmentId: string, data: any): string => {
  try {
    const id = uuidv4();
    const inspection: StoredInspection = {
      id,
      data,
      equipmentId,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0
    };
    
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, JSON.stringify(inspection));
    requestBackgroundSync();
    
    return id;
  } catch (err) {
    console.error('Error storing inspection', err);
    toast({
      title: 'Storage Error',
      description: 'Failed to store inspection data for offline use. Your data may be lost.',
      variant: 'destructive',
    });
    throw err;
  }
};

// Update the status of a stored inspection
export const updateInspectionStatus = (
  id: string, 
  status: StoredInspection['status'], 
  incrementRetry = false
): void => {
  try {
    const inspection = getStoredInspection(id);
    if (!inspection) return;
    
    inspection.status = status;
    
    if (incrementRetry) {
      inspection.retryCount += 1;
    }
    
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, JSON.stringify(inspection));
  } catch (err) {
    console.error(`Error updating inspection status: ${id}`, err);
  }
};

// Delete a stored inspection
export const removeStoredInspection = (id: string): void => {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
};

// Request background sync from the service worker
export const requestBackgroundSync = async (): Promise<void> => {
  if (!isServiceWorkerSupported()) {
    console.warn('Service Worker not supported, cannot request background sync');
    return;
  }
  
  try {
    const registration = await waitForServiceWorkerReady();
    if (!registration) return;
    
    if ('sync' in registration) {
      await registration.sync.register('sync-inspections');
      console.log('Background sync registered');
    } else {
      console.warn('Background sync not supported');
      // Fallback to immediate sync attempt if supported
      syncPendingInspections();
    }
  } catch (err) {
    console.error('Error registering for background sync', err);
    // Fallback to immediate sync attempt
    syncPendingInspections();
  }
};

// Manually sync pending inspections
export const syncPendingInspections = async (): Promise<void> => {
  if (!isOnline()) {
    toast({
      title: 'Offline Mode',
      description: 'You are currently offline. Inspections will sync when connection is restored.',
      variant: 'warning',
    });
    return;
  }
  
  const pendingInspections = getStoredInspections().filter(
    i => i.status === 'pending' || (i.status === 'failed' && i.retryCount < MAX_RETRY_ATTEMPTS)
  );
  
  if (pendingInspections.length === 0) {
    return;
  }
  
  let successCount = 0;
  let failedCount = 0;
  
  // Show toast for sync start
  const syncingToast = toast({
    title: 'Syncing Inspections',
    description: `Syncing ${pendingInspections.length} pending inspection(s)...`,
    variant: 'info',
  });
  
  for (const inspection of pendingInspections) {
    updateInspectionStatus(inspection.id, 'syncing');
    
    try {
      // In a real app, this would be an API call to your backend
      await syncInspectionToServer(inspection);
      
      // Mark as synced and remove from local storage
      updateInspectionStatus(inspection.id, 'synced');
      removeStoredInspection(inspection.id);
      successCount++;
    } catch (err) {
      console.error(`Error syncing inspection: ${inspection.id}`, err);
      updateInspectionStatus(inspection.id, 'failed', true);
      failedCount++;
    }
  }
  
  // Show final status toast
  toast({
    title: 'Sync Complete',
    description: `Successfully synced ${successCount} inspection(s)${
      failedCount > 0 ? `, ${failedCount} failed` : ''
    }`,
    variant: successCount > 0 ? 'success' : 'destructive',
  });
};

// Simulate syncing an inspection to the server
// In a real app, this would be replaced with an actual API call
const syncInspectionToServer = async (inspection: StoredInspection): Promise<void> => {
  // Simulate network latency and potential failure
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate random failure (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Simulated network error');
  }
  
  // Simulate successful sync
  console.log(`Inspection synced successfully: ${inspection.id}`);
};

// Listen for online/offline events and trigger sync as needed
export const initializeOfflineSync = (): void => {
  if (typeof window === 'undefined') return;
  
  // Initialize sync when coming online
  window.addEventListener('online', () => {
    console.log('Device is online, attempting to sync inspections');
    syncPendingInspections();
  });
  
  // Notify when going offline
  window.addEventListener('offline', () => {
    console.log('Device is offline, inspections will be stored locally');
    toast({
      title: 'Offline Mode',
      description: 'You are now working offline. Your inspections will be saved locally and synced when connection is restored.',
      variant: 'warning',
    });
  });
  
  // Initial sync attempt on load
  if (isOnline()) {
    setTimeout(() => {
      syncPendingInspections();
    }, 3000); // Delay to avoid overwhelming the app on initial load
  }
};
