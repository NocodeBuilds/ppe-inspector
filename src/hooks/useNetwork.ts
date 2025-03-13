
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean; // Tracks if user was recently offline
  lastOnline: Date | null;
  lastOffline: Date | null;
}

/**
 * Hook to track network status changes and handle online/offline events
 */
export const useNetwork = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [lastOnline, setLastOnline] = useState<Date | null>(isOnline ? new Date() : null);
  const [lastOffline, setLastOffline] = useState<Date | null>(isOnline ? null : new Date());

  useEffect(() => {
    // Handler for when network comes online
    const handleOnline = () => {
      console.log("Network is online");
      setIsOnline(true);
      setLastOnline(new Date());
      
      // If was previously offline, show reconnection toast
      if (!isOnline) {
        setWasOffline(true);
        toast({
          title: "Back Online",
          description: "Your connection has been restored. Syncing data...",
          variant: "default",
        });
        
        // Request sync when back online
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready
            .then(registration => {
              // Trigger both inspection and report syncs
              registration.sync.register('sync-inspections');
              registration.sync.register('sync-offline-reports');
            })
            .catch(err => {
              console.error('Failed to register sync:', err);
            });
        }
        
        // Reset wasOffline flag after a delay
        setTimeout(() => {
          setWasOffline(false);
        }, 10000);
      }
    };

    // Handler for when network goes offline
    const handleOffline = () => {
      console.log("Network is offline");
      setIsOnline(false);
      setLastOffline(new Date());
      
      toast({
        title: "You're Offline",
        description: "Don't worry, you can continue working. Changes will sync when you're back online.",
        variant: "warning",
      });
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return { isOnline, wasOffline, lastOnline, lastOffline };
};

/**
 * Helper component to listen for network changes at the app level
 */
export const NetworkStatusListener: React.FC = () => {
  useNetwork();
  return null;
};

export default useNetwork;
