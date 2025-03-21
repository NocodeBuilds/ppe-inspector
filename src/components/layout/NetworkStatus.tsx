
import React from 'react';
import { useNetwork } from '@/hooks/useNetwork';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CloudOff, WifiOff, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const NetworkStatus: React.FC = () => {
  const { isOnline, wasOffline, resetWasOffline } = useNetwork();

  // Only show reconnection status for 5 seconds
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (wasOffline && isOnline) {
      timer = setTimeout(() => {
        resetWasOffline();
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [wasOffline, isOnline, resetWasOffline]);

  if (!isOnline) {
    return (
      <Alert 
        variant="destructive"
        className="fixed bottom-20 left-0 right-0 mx-auto w-[90%] max-w-md z-50 shadow-lg border-destructive"
      >
        <WifiOff className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          Offline
          <Badge variant="destructive" size="sm">No Connection</Badge>
        </AlertTitle>
        <AlertDescription>
          You are currently offline. Some features may be limited until your connection is restored.
        </AlertDescription>
      </Alert>
    );
  }

  if (wasOffline && isOnline) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-0 right-0 mx-auto w-[90%] max-w-md z-50"
      >
        <Alert className="bg-green-500/10 border-green-500 text-green-700 dark:text-green-400 shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="flex items-center gap-2">
            Back Online
            <Badge variant="success" size="sm">Connected</Badge>
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            Your connection has been restored. All features are now available.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return null;
};

export default NetworkStatus;
