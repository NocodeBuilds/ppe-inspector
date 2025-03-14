
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReportCardProps {
  title: React.ReactNode;
  description: string;
  count?: number;
  isEmpty?: boolean;
  emptyMessage?: string;
  onGenerate: () => void;
  isGenerating: boolean;
  children?: React.ReactNode;
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  description,
  count,
  isEmpty = false,
  emptyMessage = 'No data found.',
  onGenerate,
  isGenerating,
  children,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {description}
        </p>

        {children}
        
        {typeof count === 'number' && (
          <div className="flex justify-between items-center p-4 bg-muted/30 rounded-md border mb-4">
            <div>
              <p className="font-medium">Total Count</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
            <Button 
              onClick={onGenerate}
              disabled={isGenerating || count === 0}
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
              <Download className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
        
        {isEmpty && (
          <Alert className="mt-4">
            <AlertDescription>
              {emptyMessage}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportCard;
