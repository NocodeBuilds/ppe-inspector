
import React from 'react';
import { 
  BarChart3, 
  FileText, 
  AlertTriangle,
  ClipboardCheck,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AnalyticsSummaryProps {
  ppeCount: number;
  inspectionCount: number;
  flaggedCount: number;
  inspectionTrend?: number;
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  ppeCount,
  inspectionCount,
  flaggedCount,
  inspectionTrend = 0,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Total PPE Items</span>
                <span className="text-2xl font-bold">{ppeCount}</span>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Total Inspections</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{inspectionCount}</span>
                  {inspectionTrend !== 0 && (
                    <div className={`flex items-center ${inspectionTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {inspectionTrend > 0 ? 
                        <TrendingUp className="h-4 w-4" /> : 
                        <TrendingDown className="h-4 w-4" />
                      }
                      <span className="text-xs">{Math.abs(inspectionTrend)}%</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Flagged Items</span>
                <span className="text-2xl font-bold text-destructive">{flaggedCount}</span>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSummary;
