
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDateOrNA } from '@/utils/pdfUtils';
import { Badge } from '@/components/ui/badge';

interface EquipmentLifecycleProps {
  item: {
    id: string;
    type: string;
    serial_number: string;
    manufacturing_date: string;
    expiry_date: string;
    status: string;
  };
}

const EquipmentLifecycleTracker: React.FC<EquipmentLifecycleProps> = ({
  item
}) => {
  // Calculate lifecycle progress
  const calculateLifecycleProgress = (): { progress: number; daysLeft: number } => {
    const today = new Date();
    const manufactureDate = new Date(item.manufacturing_date);
    const expiryDate = new Date(item.expiry_date);
    
    // Total lifecycle in days
    const totalLifecycle = expiryDate.getTime() - manufactureDate.getTime();
    
    // Days elapsed
    const elapsed = today.getTime() - manufactureDate.getTime();
    
    // Days left
    const daysLeft = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Progress percentage
    const progress = Math.min(100, Math.max(0, (elapsed / totalLifecycle) * 100));
    
    return { progress: Math.round(progress), daysLeft };
  };
  
  const { progress, daysLeft } = calculateLifecycleProgress();
  
  // Determine status color
  const getStatusColor = () => {
    switch (item.status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'flagged': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Lifecycle health indicator
  const getLifecycleHealth = () => {
    if (progress < 50) return { label: 'Good', color: 'bg-green-500' };
    if (progress < 75) return { label: 'Moderate', color: 'bg-yellow-500' };
    if (progress < 90) return { label: 'Critical', color: 'bg-red-500' };
    return { label: 'End of Life', color: 'bg-gray-500' };
  };
  
  const health = getLifecycleHealth();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{item.type} - {item.serial_number}</CardTitle>
          <Badge variant="outline" className={getStatusColor()}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Manufacture Date</p>
              <p className="font-medium">{formatDateOrNA(item.manufacturing_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expiry Date</p>
              <p className="font-medium">{formatDateOrNA(item.expiry_date)}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <p className="text-muted-foreground">Lifecycle Progress</p>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${health.color}`}></span>
                <span>{health.label}</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentLifecycleTracker;
