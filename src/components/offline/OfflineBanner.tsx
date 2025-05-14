import React from 'react';
import { WifiOff, CloudOff, InfoIcon } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface OfflineBannerProps {
  showAlways?: boolean;
  className?: string;
}

export const OfflineBanner = ({ showAlways = false, className = '' }: OfflineBannerProps) => {
  const { online, offlineSupported, pendingCount, syncInspections, syncing } = useOffline();
  
  // If we're online and there are no pending inspections, and we're not forcing display, hide the banner
  if (online && pendingCount === 0 && !showAlways) {
    return null;
  }
  
  // If offline isn't supported and we're not forcing display, hide the banner
  if (!offlineSupported && !showAlways) {
    return null;
  }
  
  return (
    <Alert 
      variant={online ? "info" : "warning"}
      className={`mb-4 ${className}`}
    >
      <div className="flex items-start">
        {online ? (
          <InfoIcon className="h-5 w-5 mr-2 mt-0.5" />
        ) : (
          <WifiOff className="h-5 w-5 mr-2 mt-0.5" />
        )}
        
        <div className="flex-1">
          <AlertTitle className="mb-1">
            {!online ? 'You\'re working offline' : pendingCount > 0 ? 'Offline data ready to sync' : 'Online mode'}
          </AlertTitle>
          
          <AlertDescription className="text-sm">
            {!online ? (
              <>
                Your inspection data will be saved locally and synced when your connection is restored.
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <CloudOff className="h-3.5 w-3.5" />
                  <span>
                    {pendingCount > 0 
                      ? `${pendingCount} inspection${pendingCount > 1 ? 's' : ''} pending sync` 
                      : 'No pending data'}
                  </span>
                </div>
              </>
            ) : pendingCount > 0 ? (
              <div className="flex items-center justify-between">
                <span>
                  You have {pendingCount} offline inspection{pendingCount > 1 ? 's' : ''} ready to sync.
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-4"
                  onClick={() => syncInspections()}
                  disabled={syncing}
                >
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>
            ) : (
              'You\'re working online. All your data will be saved in real-time.'
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default OfflineBanner;
