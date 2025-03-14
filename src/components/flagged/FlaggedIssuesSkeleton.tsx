
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const FlaggedIssuesSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header and search skeleton */}
      <div className="flex items-center mb-4">
        <Skeleton className="h-6 w-6 mr-2 rounded-full" />
        <Skeleton className="h-7 w-48" />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      
      {/* Flagged items skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-6 mr-2 rounded-full" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </Card>
          
          {/* Inspection notes skeleton */}
          <div className="ml-4 pl-4 border-l-2 border-destructive/30">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlaggedIssuesSkeleton;
