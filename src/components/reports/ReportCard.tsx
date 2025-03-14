
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportCardProps {
  title: React.ReactNode;
  description: string;
  count?: number;
  isEmpty?: boolean;
  emptyMessage?: string;
  onGenerate: () => void;
  isGenerating: boolean;
  children?: React.ReactNode;
  className?: string;
  actionLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  footer?: React.ReactNode;
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
  className,
  actionLabel = 'Generate Report',
  secondaryAction,
  footer,
}) => {
  return (
    <Card className={cn("transition-all", className)}>
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
            <div className="flex gap-2">
              {secondaryAction && (
                <Button 
                  variant="outline"
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.label}
                  {secondaryAction.icon || <ExternalLink className="ml-2 h-4 w-4" />}
                </Button>
              )}
              <Button 
                onClick={onGenerate}
                disabled={isGenerating || count === 0}
              >
                {isGenerating ? 'Generating...' : actionLabel}
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {!isEmpty && !children && !count && (
          <div className="flex justify-between items-center p-4 bg-muted/30 rounded-md border mb-4">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Button 
              onClick={onGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : actionLabel}
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
        
        {footer && (
          <div className="mt-4">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportCard;
