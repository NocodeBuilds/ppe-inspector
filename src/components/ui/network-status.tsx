import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useIsOnline } from '@/hooks/use-is-online';

/**
 * NetworkStatus component displays a notification when the user is offline
 * and automatically hides when connection is restored
 */
const NetworkStatus = () => {
  const isOnline = useIsOnline();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline) {
      // When coming back online, show reconnected message briefly
      if (showReconnected === false) {
        setShowReconnected(true);
        const timer = setTimeout(() => {
          setShowReconnected(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, showReconnected]);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 mx-auto w-full max-w-md px-4">
      <Alert
        variant={isOnline ? "default" : "destructive"}
        className="animate-in fade-in slide-in-from-bottom-5 relative overflow-hidden"
      >
        {isOnline ? (
          <Wifi className="h-4 w-4 text-success" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertTitle>
          {isOnline ? "Connection Restored" : "You're Offline"}
        </AlertTitle>
        <AlertDescription>
          {isOnline
            ? "Your internet connection has been restored."
            : "Please check your internet connection. Some features may be unavailable while offline."}
        </AlertDescription>
        
        {/* Progress bar for auto-dismiss (only for reconnected message) */}
        {isOnline && (
          <div className="absolute bottom-0 left-0 h-1 w-full bg-muted overflow-hidden">
            <div 
              className="h-full bg-success transition-all duration-3000 ease-linear"
              style={{ 
                width: '100%',
                animation: 'shrink 3s linear forwards'
              }}
            />
          </div>
        )}
      </Alert>
      
      {/* Add keyframe animation for progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NetworkStatus;
