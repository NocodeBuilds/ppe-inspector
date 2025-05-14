import { useState, useEffect } from 'react';

/**
 * Custom hook to track the user's online/offline status
 * @returns {boolean} Current online status
 */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Handler to update state when online
    const handleOnline = () => setIsOnline(true);
    
    // Handler to update state when offline
    const handleOffline = () => setIsOnline(false);

    // Add event listeners for online/offline status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
