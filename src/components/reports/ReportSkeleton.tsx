
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ReportSkeletonProps {
  showAnalytics?: boolean;
}

const ReportSkeleton: React.FC<ReportSkeletonProps> = ({ 
  showAnalytics = false 
}) => {
  return (
    <div className="space-y-6 animate-pulse">
      {showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-muted/30 rounded-md border">
              <div className="flex justify-center mb-2">
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32 mx-auto mb-2" />
              <Skeleton className="h-8 w-16 mx-auto" />
            </div>
          ))}
        </div>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          
          <div className="flex justify-between items-center p-4 bg-muted/30 rounded-md border">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
          
          {showAnalytics && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-32 w-full rounded-md" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSkeleton;
