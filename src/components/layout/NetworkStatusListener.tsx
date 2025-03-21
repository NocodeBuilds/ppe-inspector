
import React, { useEffect } from 'react';
import { useNetwork } from '@/hooks/useNetwork';

const NetworkStatusListener: React.FC = () => {
  const { setOnline, setWasOffline } = useNetwork();

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network status: online');
      setOnline(true);
    };

    const handleOffline = () => {
      console.log('Network status: offline');
      setOnline(false);
      setWasOffline(true);
    };

    // Initial status check
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      setOnline(navigator.onLine);
      if (!navigator.onLine) {
        setWasOffline(true);
      }
    }

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline, setWasOffline]);

  // This component doesn't render anything visually
  return null;
};

export default NetworkStatusListener;
