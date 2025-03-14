
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ReportSkeleton from '@/components/reports/ReportSkeleton';

const ReportPageSkeleton = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      
      {/* Report options skeleton - improved for mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 md:h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-12 md:h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-2">
            <Skeleton className="h-12 md:h-10 w-full rounded-lg" />
            <Skeleton className="h-12 md:h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
      
      {/* Reports grid skeleton - improved for mobile */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ReportSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportPageSkeleton;
