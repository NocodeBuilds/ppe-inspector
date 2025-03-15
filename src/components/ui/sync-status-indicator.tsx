
import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

interface SyncStatusIndicatorProps {
  className?: string;
  detailed?: boolean;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ 
  className,
  detailed = false
}) => {
  const { 
    isOnline, 
    isSyncing, 
    pendingActionsCount, 
    syncOfflineData,
    lastSyncedAt,
    lastSyncError
  } = useOfflineSync();
  
  const [syncProgress, setSyncProgress] = useState(0);
  
  // Simulated progress for the sync operation
  useEffect(() => {
    let progressInterval: number;
    
    if (isSyncing) {
      setSyncProgress(0);
      progressInterval = window.setInterval(() => {
        setSyncProgress(prev => {
          // Slowly increase to 90% max, the final jump happens when sync is complete
          const newProgress = prev + (90 - prev) * 0.1;
          return Math.min(newProgress, 90);
        });
      }, 300);
    } else if (pendingActionsCount === 0) {
      setSyncProgress(100);
      // Reset to 0 after a delay
      const resetTimer = window.setTimeout(() => {
        setSyncProgress(0);
      }, 2000);
      return () => clearTimeout(resetTimer);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isSyncing, pendingActionsCount]);
  
  const getStatusColor = () => {
    if (lastSyncError) return 'text-destructive';
    if (!isOnline) return 'text-destructive';
    if (pendingActionsCount > 0) return 'text-amber-500';
    return 'text-green-500';
  };
  
  const getStatusIcon = () => {
    if (lastSyncError) return <AlertCircle className="w-4 h-4" />;
    if (!isOnline) return <CloudOff className="w-4 h-4" />;
    if (isSyncing) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (pendingActionsCount === 0 && lastSyncedAt) return <CheckCircle2 className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };
  
  const getStatusText = () => {
    if (lastSyncError) return 'Sync Error';
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Syncing...';
    if (pendingActionsCount > 0) return `${pendingActionsCount} pending`;
    if (lastSyncedAt) return 'Synced';
    return 'Online';
  };
  
  const getTooltipText = () => {
    if (lastSyncError) return `Sync error: ${lastSyncError}. Click to retry.`;
    if (!isOnline) return 'You are working offline. Changes will be synced when you reconnect.';
    if (isSyncing) return `Syncing ${pendingActionsCount} items with server...`;
    if (pendingActionsCount > 0) return `${pendingActionsCount} changes pending sync. Click to sync now.`;
    
    if (lastSyncedAt) {
      return `All changes synced. Last sync: ${formatDistanceToNow(lastSyncedAt, { addSuffix: true })}`;
    }
    
    return 'All changes synced';
  };
  
  const handleClick = () => {
    if (isOnline && (pendingActionsCount > 0 || lastSyncError) && !isSyncing) {
      syncOfflineData();
    }
  };
  
  // Simple indicator for non-detailed mode
  if (!detailed) {
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
  }
  
  // Detailed view for dedicated UI
  return (
    <div className={cn("border rounded-md p-4 space-y-3", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={getStatusColor()}>
            {getStatusIcon()}
          </span>
          <span className="font-medium">{getStatusText()}</span>
        </div>
        
        {isOnline && pendingActionsCount > 0 && !isSyncing && (
          <Button size="sm" onClick={handleClick}>
            Sync Now
          </Button>
        )}
      </div>
      
      {isSyncing && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Syncing data...</span>
            <span>{Math.round(syncProgress)}%</span>
          </div>
          <Progress value={syncProgress} className="h-2" />
        </div>
      )}
      
      {lastSyncedAt && !isSyncing && (
        <p className="text-xs text-muted-foreground">
          Last synced: {formatDistanceToNow(lastSyncedAt, { addSuffix: true })}
        </p>
      )}
      
      {lastSyncError && (
        <div className="text-xs text-destructive">
          {lastSyncError}
        </div>
      )}
      
      {pendingActionsCount > 0 && !isSyncing && (
        <p className="text-xs text-amber-500">
          {pendingActionsCount} {pendingActionsCount === 1 ? 'change' : 'changes'} pending synchronization
        </p>
      )}
    </div>
  );
};

export default SyncStatusIndicator;
