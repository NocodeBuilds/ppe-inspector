
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReportCardProps {
  title: React.ReactNode;
  description: string;
  count?: number;
  isEmpty?: boolean;
  emptyMessage?: string;
  onGenerate: () => void;
  onGenerateExcel?: () => void;
  isGenerating: boolean;
  children?: React.ReactNode;
  visualizations?: React.ReactNode;
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  description,
  count,
  isEmpty = false,
  emptyMessage = 'No data found.',
  onGenerate,
  onGenerateExcel,
  isGenerating,
  children,
  visualizations,
}) => {
  return (
    <Card className="backdrop-blur-sm bg-background/80 border-border/50 transition-all duration-200 hover:shadow-md">
      <CardHeader className="p-3">
        <CardTitle className="flex items-center text-sm sm:text-base">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-muted-foreground text-xs mb-2">
          {description}
        </p>

        {children}
        
        {visualizations && (
          <div className="mt-4 mb-3">
            {visualizations}
          </div>
        )}
        
        {typeof count === 'number' && (
          <div className="flex flex-row justify-between items-center p-2 bg-muted/30 rounded-md border mb-2 gap-1">
            <div>
              <p className="font-medium text-xs">Total Count</p>
              <p className="text-base sm:text-lg font-bold">{count}</p>
            </div>
            <div className="flex gap-1">
              {onGenerateExcel && (
                <Button 
                  variant="outline"
                  onClick={onGenerateExcel}
                  disabled={isGenerating || count === 0}
                  className="text-xs h-7 px-2"
                  size="sm"
                >
                  Excel
                  <FileSpreadsheet className="ml-1 h-3 w-3" />
                </Button>
              )}
              <Button 
                onClick={onGenerate}
                disabled={isGenerating || count === 0}
                className="text-xs h-7 px-2"
                size="sm"
              >
                {isGenerating ? 'Generating...' : 'PDF'}
                <Download className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {isEmpty && (
          <Alert className="mt-2 p-2">
            <AlertDescription className="text-xs">
              {emptyMessage}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportCard;
