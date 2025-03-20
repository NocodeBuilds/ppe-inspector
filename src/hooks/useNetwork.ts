
import { useState, useEffect } from 'react';

interface NetworkState {
  isOnline: boolean;
  offlineSince: Date | null;
}

export const useNetwork = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: navigator.onLine,
    offlineSince: navigator.onLine ? null : new Date()
  });

  useEffect(() => {
    const handleOnline = () => {
      setNetworkState({
        isOnline: true,
        offlineSince: null
      });
    };

    const handleOffline = () => {
      setNetworkState({
        isOnline: false,
        offlineSince: new Date()
      });
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
