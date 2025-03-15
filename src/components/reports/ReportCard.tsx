
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
    <Card className="backdrop-blur-sm bg-background/80 border-border/50 transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          {description}
        </p>

        {visualizations ? (
          <Tabs defaultValue="data" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
            </TabsList>
            <TabsContent value="data">
              {children}
            </TabsContent>
            <TabsContent value="visualizations">
              {visualizations}
            </TabsContent>
          </Tabs>
        ) : children}
        
        {typeof count === 'number' && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-3 sm:p-4 bg-muted/30 rounded-md border mb-4 gap-2 sm:gap-0">
            <div>
              <p className="font-medium text-sm sm:text-base">Total Count</p>
              <p className="text-xl sm:text-2xl font-bold">{count}</p>
            </div>
            <div className="flex gap-2">
              {onGenerateExcel && (
                <Button 
                  variant="outline"
                  onClick={onGenerateExcel}
                  disabled={isGenerating || count === 0}
                  className="text-xs sm:text-sm"
                  size="sm"
                >
                  Excel
                  <FileSpreadsheet className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
              <Button 
                onClick={onGenerate}
                disabled={isGenerating || count === 0}
                className="text-xs sm:text-sm"
                size="sm"
              >
                {isGenerating ? 'Generating...' : 'PDF Report'}
                <Download className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {isEmpty && (
          <Alert className="mt-4">
            <AlertDescription className="text-sm">
              {emptyMessage}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportCard;
