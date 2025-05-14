import React from 'react';
import { WifiOff, Cloud, RefreshCw, AlertTriangle } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EquipmentOfflineStatusProps {
  equipmentId?: string;
}

/**
 * Component that displays the offline status specifically for equipment pages,
 * showing pending inspections for the specific equipment when offline
 */
export const EquipmentOfflineStatus = ({ equipmentId }: EquipmentOfflineStatusProps) => {
  const { online, pendingInspections, pendingCount, syncInspections, syncing } = useOffline();
  
  // If online and nothing pending, don't show anything
  if (online && pendingCount === 0) {
    return null;
  }
  
  // Filter inspections for this equipment if an ID is provided
  const relevantInspections = equipmentId 
    ? pendingInspections.filter(insp => insp.equipmentId === equipmentId)
    : pendingInspections;
  
  const relevantCount = relevantInspections.length;
  
  // If we have an equipment ID and no relevant inspections, don't show anything
  if (equipmentId && relevantCount === 0) {
    return null;
  }
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className={`flex items-center justify-between ${online ? 'text-primary' : 'text-warning'}`}>
          <div className="flex items-center gap-2">
            {online ? (
              <Cloud className="h-5 w-5" />
            ) : (
              <WifiOff className="h-5 w-5" />
            )}
            
            <div>
              <p className="font-medium">
                {online ? 'Online Mode' : 'Offline Mode'}
              </p>
              
              <p className="text-sm text-muted-foreground">
                {online 
                  ? `${pendingCount} pending inspection${pendingCount !== 1 ? 's' : ''} ready to sync` 
                  : 'Your inspections will be saved locally while offline'}
              </p>
            </div>
          </div>
          
          {online && pendingCount > 0 && (
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2"
              onClick={() => syncInspections()}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Sync Now
                </>
              )}
            </Button>
          )}
        </div>
        
        {/* Show pending inspections for this equipment */}
        {relevantCount > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <p className="text-sm font-medium">
                {equipmentId 
                  ? 'Pending Inspections for this Equipment' 
                  : 'Recent Pending Inspections'}
              </p>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {relevantInspections.slice(0, 5).map((inspection) => (
                <div 
                  key={inspection.id} 
                  className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md"
                >
                  <div>
                    <p className="font-medium">
                      {inspection.data.templateId || 'Inspection'} 
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inspection.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <Badge variant={inspection.status === 'pending' ? 'outline' : 'secondary'}>
                    {inspection.status}
                  </Badge>
                </div>
              ))}
              
              {relevantInspections.length > 5 && (
                <p className="text-xs text-center text-muted-foreground pt-1">
                  +{relevantInspections.length - 5} more pending inspections
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentOfflineStatus;
