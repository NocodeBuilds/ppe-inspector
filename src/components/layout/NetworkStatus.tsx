
import React from 'react';
import { useNetwork } from '@/hooks/useNetwork';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SyncStatusIndicator from '@/components/ui/sync-status-indicator';

export const NetworkStatus: React.FC = () => {
  const { isOnline, wasOffline } = useNetwork();
  const { pendingActionsCount } = useOfflineSync();
  
  // Only show when offline or recently reconnected with pending actions
  if (isOnline && (!wasOffline || pendingActionsCount === 0)) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-2 bg-background border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium">Offline mode</span>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {pendingActionsCount > 0 && (
          <Badge variant="outline" className="gap-1 items-center">
            <AlertCircle className="h-3 w-3" />
            <span>
              {pendingActionsCount} {pendingActionsCount === 1 ? 'change' : 'changes'} pending
            </span>
          </Badge>
        )}
        <SyncStatusIndicator />
      </div>
    </div>
  );
};

export default NetworkStatus;
