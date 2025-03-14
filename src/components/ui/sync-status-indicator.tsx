
import React from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface SyncStatusIndicatorProps {
  className?: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ 
  className 
}) => {
  const { 
    isOnline, 
    isSyncing, 
    pendingActionsCount, 
    syncOfflineData,
    lastSyncedAt
  } = useOfflineSync();
  
  const getStatusColor = () => {
    if (!isOnline) return 'text-destructive';
    if (pendingActionsCount > 0) return 'text-warning';
    return 'text-success';
  };
  
  const getStatusIcon = () => {
    if (!isOnline) return <CloudOff className="w-4 h-4" />;
    if (isSyncing) return <RefreshCw className="w-4 h-4 animate-spin" />;
    return <Cloud className="w-4 h-4" />;
  };
  
  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Syncing...';
    if (pendingActionsCount > 0) return `${pendingActionsCount} pending`;
    return 'Online';
  };
  
  const getTooltipText = () => {
    if (!isOnline) return 'You are working offline. Changes will be synced when you reconnect.';
    if (isSyncing) return 'Syncing data with server...';
    if (pendingActionsCount > 0) return `${pendingActionsCount} changes pending sync. Click to sync now.`;
    
    if (lastSyncedAt) {
      const formattedTime = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }).format(lastSyncedAt);
      return `All changes synced. Last sync: ${formattedTime}`;
    }
    
    return 'All changes synced';
  };
  
  const handleClick = () => {
    if (isOnline && pendingActionsCount > 0 && !isSyncing) {
      syncOfflineData();
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex items-center gap-1.5 cursor-pointer transition-colors",
              pendingActionsCount > 0 && isOnline && !isSyncing ? "hover:text-primary" : "",
              className
            )}
            onClick={handleClick}
          >
            <span className={getStatusColor()}>
              {getStatusIcon()}
            </span>
            
            {pendingActionsCount > 0 && (
              <Badge variant="outline" className="py-0 h-5 min-w-5 flex justify-center">
                {pendingActionsCount}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncStatusIndicator;
