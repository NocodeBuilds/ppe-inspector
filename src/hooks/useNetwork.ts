
import { useState, useEffect } from 'react';
import React from 'react';

interface NetworkState {
  isOnline: boolean;
  offlineSince: Date | null;
  wasOffline: boolean; // Added property to track if we were previously offline
}

export const useNetwork = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: navigator.onLine,
    offlineSince: navigator.onLine ? null : new Date(),
    wasOffline: false
  });

  useEffect(() => {
    const handleOnline = () => {
      setNetworkState(prev => ({
        isOnline: true,
        offlineSince: null,
        wasOffline: !prev.isOnline // If we were offline before, set wasOffline to true
      }));
    };

    const handleOffline = () => {
      setNetworkState(prev => ({
        isOnline: false,
        offlineSince: new Date(),
        wasOffline: prev.wasOffline // Keep wasOffline state
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return networkState;
};

// NetworkStatusListener component to use in App.tsx
export const NetworkStatusListener: React.FC = () => {
  // Just use the hook to set up listeners, no UI is rendered
  useNetwork();
  
  return null;
};
