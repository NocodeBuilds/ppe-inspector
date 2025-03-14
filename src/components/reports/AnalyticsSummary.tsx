
import React from 'react';
import { 
  BarChart3, 
  FileText, 
  AlertTriangle,
  ClipboardCheck,
  CheckSquare,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsSummaryProps {
  ppeCount: number;
  inspectionCount: number;
  flaggedCount: number;
  expiringCount?: number;
  upcomingCount?: number;
  passingRate?: number;
  className?: string;
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  ppeCount,
  inspectionCount,
  flaggedCount,
  expiringCount,
  upcomingCount,
  passingRate,
  className
}) => {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6", className)}>
      <div className="p-4 bg-muted/30 rounded-md border text-center">
        <div className="flex justify-center mb-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="font-medium text-muted-foreground">Total PPE Items</p>
        <p className="text-2xl font-bold">{ppeCount}</p>
      </div>
      
      <div className="p-4 bg-muted/30 rounded-md border text-center">
        <div className="flex justify-center mb-2">
          <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="font-medium text-muted-foreground">Total Inspections</p>
        <p className="text-2xl font-bold">{inspectionCount}</p>
      </div>
      
      <div className="p-4 bg-muted/30 rounded-md border text-center">
        <div className="flex justify-center mb-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <p className="font-medium text-muted-foreground">Flagged Items</p>
        <p className="text-2xl font-bold text-destructive">{flaggedCount}</p>
      </div>
      
      {expiringCount !== undefined && (
        <div className="p-4 bg-muted/30 rounded-md border text-center">
          <div className="flex justify-center mb-2">
            <Calendar className="h-5 w-5 text-amber-500" />
          </div>
          <p className="font-medium text-muted-foreground">Expiring Soon</p>
          <p className="text-2xl font-bold text-amber-500">{expiringCount}</p>
        </div>
      )}
      
      {upcomingCount !== undefined && (
        <div className="p-4 bg-muted/30 rounded-md border text-center">
          <div className="flex justify-center mb-2">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <p className="font-medium text-muted-foreground">Upcoming Inspections</p>
          <p className="text-2xl font-bold text-blue-500">{upcomingCount}</p>
        </div>
      )}
      
      {passingRate !== undefined && (
        <div className="p-4 bg-muted/30 rounded-md border text-center">
          <div className="flex justify-center mb-2">
            <CheckSquare className="h-5 w-5 text-green-500" />
          </div>
          <p className="font-medium text-muted-foreground">Passing Rate</p>
          <div className="relative pt-1">
            <div className="flex items-center justify-center">
              <p className="text-2xl font-bold text-green-500">{passingRate}%</p>
            </div>
            <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-muted">
              <div
                style={{ width: `${passingRate}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSummary;
