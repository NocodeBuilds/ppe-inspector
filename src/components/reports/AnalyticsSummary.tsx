
import React from 'react';
import { 
  BarChart3, 
  FileText, 
  AlertTriangle,
  ClipboardCheck 
} from 'lucide-react';

interface AnalyticsSummaryProps {
  ppeCount: number;
  inspectionCount: number;
  flaggedCount: number;
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  ppeCount,
  inspectionCount,
  flaggedCount,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
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
    </div>
  );
};

export default AnalyticsSummary;
