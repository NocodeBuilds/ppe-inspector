
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      setTimeout(() => setShowReconnectedToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    // Try to reload resources or reconnect
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowOfflineAlert(false);
  };

  if (!showOfflineAlert && !showReconnectedToast) return null;

  if (isOnline && showReconnectedToast) {
    return (
      <div className="fixed bottom-20 right-4 z-50 animate-fade-in">
        <div className="flex items-center gap-2 bg-success text-white px-4 py-2 rounded-full shadow-lg">
          <Wifi size={16} />
          <span className="text-sm">Back online</span>
        </div>
      </div>
    );
  }

  if (!isOnline && showOfflineAlert) {
    return (
      <div className="fixed top-14 inset-x-0 z-50 animate-fade-in">
        <div className="mx-auto max-w-md px-4">
          <div className="flex items-center justify-between bg-card border border-destructive/30 p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/20 p-2 rounded-full">
                <WifiOff size={18} className="text-destructive" />
              </div>
              <div>
                <h3 className="font-medium text-sm">You're offline</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Using cached data. Some features may be limited.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-2 h-7"
                onClick={handleRetry}
              >
                <RefreshCw size={14} className="mr-1" /> Retry
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-2 h-7"
                onClick={handleDismiss}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default NetworkStatus;
