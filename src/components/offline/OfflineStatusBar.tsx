import React, { useEffect, useState } from 'react';
import { WifiOff, CloudOff, Cloud, RefreshCw, Check } from 'lucide-react';
import { 
  getStoredInspections, 
  isOnline, 
  syncPendingInspections 
} from '@/utils/offlineSyncUtils';
import { Button } from '@/components/ui/button';

export const OfflineStatusBar = () => {
  const [online, setOnline] = useState(isOnline);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  
  // Update the pending inspections count
  const updatePendingCount = () => {
    const storedInspections = getStoredInspections();
    const pending = storedInspections.filter(i => i.status === 'pending' || i.status === 'failed').length;
    setPendingCount(pending);
  };
  
  // Handle manual sync button click
  const handleSync = async () => {
    if (!online || syncing) return;
    
    setSyncing(true);
    try {
      await syncPendingInspections();
    } catch (error) {
      console.error('Error syncing inspections:', error);
    } finally {
      setSyncing(false);
      updatePendingCount();
    }
  };
  
  // Event listeners for online/offline status
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check pending inspections on mount
    updatePendingCount();
    
    // Set up interval to check pending count
    const interval = setInterval(updatePendingCount, 10000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);
  
  // If no pending inspections and online, don't show the bar
  if (pendingCount === 0 && online) {
    return null;
  }
  
  return (
    <div className={`fixed bottom-16 left-0 right-0 z-30 p-2 flex justify-center pointer-events-none`}>
      <div className={`
        rounded-full px-4 py-2 shadow-md flex items-center gap-2 
        pointer-events-auto max-w-md w-full justify-between
        ${online ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'}
      `}>
        <div className="flex items-center gap-2 text-sm">
          {online ? (
            <Cloud className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          
          <span className="font-medium">
            {online ? 'Online' : 'Offline Mode'}
          </span>
          
          {pendingCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="mx-1">•</span>
              <CloudOff className="h-3 w-3" />
              <span>{pendingCount} pending</span>
            </div>
          )}
        </div>
        
        {online && pendingCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="h-7 rounded-full text-xs bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
          >
            {syncing ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Sync Now
              </>
            )}
          </Button>
        )}
        
        {online && pendingCount === 0 && (
          <span className="text-xs flex items-center">
            <Check className="h-3 w-3 mr-1" />
            All synced
          </span>
        )}
      </div>
    </div>
  );
};

export default OfflineStatusBar;
