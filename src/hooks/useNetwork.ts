import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean; // Tracks if user was recently offline
  lastOnline: Date | null;
  lastOffline: Date | null;
}

export const useNetwork = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [lastOnline, setLastOnline] = useState<Date | null>(isOnline ? new Date() : null);
  const [lastOffline, setLastOffline] = useState<Date | null>(isOnline ? null : new Date());

  useEffect(() => {
    const handleOnline = () => {
      console.log("Network is online");
      setIsOnline(true);
      setLastOnline(new Date());

      if (!isOnline) {
        setWasOffline(true);
        toast({
          title: "Back Online",
          description: "Your connection has been restored. Syncing data...",
          variant: "default",
        });

        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready
            .then(registration => {
              if ('sync' in registration) {
                // @ts-ignore
                registration.sync.register('sync-inspections');
                // @ts-ignore
                registration.sync.register('sync-offline-reports');
              }
            })
            .catch(err => {
              console.error('Failed to register sync:', err);
            });
        }

        setTimeout(() => {
          setWasOffline(false);
        }, 10000);
      }
    };

    const handleOffline = () => {
      console.log("Network is offline");
      setIsOnline(false);
      setLastOffline(new Date());

      toast({
        title: "You're Offline",
        description: "Don't worry, you can continue working. Changes will sync when you're back online.",
        variant: "default",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return { isOnline, wasOffline, lastOnline, lastOffline };
};

export const NetworkStatusListener: React.FC = () => {
  useNetwork();
  return null;
};

export default useNetwork;