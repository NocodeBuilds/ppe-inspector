
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ReportSkeleton from '@/components/reports/ReportSkeleton';

interface ReportPageSkeletonProps {
  includeAnalytics?: boolean;
  includeCharts?: boolean;
}

const ReportPageSkeleton = ({ includeAnalytics = false, includeCharts = false }: ReportPageSkeletonProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      
      {/* Analytics summary skeleton */}
      {includeAnalytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 bg-muted/30 rounded-md border text-center">
              <div className="flex justify-center mb-2">
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24 mx-auto mb-2" />
              <Skeleton className="h-8 w-12 mx-auto" />
            </div>
          ))}
        </div>
      )}
      
      {/* Tab navigation skeleton */}
      <Skeleton className="h-10 w-full max-w-md" />
      
      {/* Charts skeleton */}
      {includeCharts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[350px] w-full md:col-span-2" />
          <Skeleton className="h-[350px] w-full" />
          <Skeleton className="h-[350px] w-full" />
        </div>
      )}
      
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
          {[1, 2, 3].map((i) => (
            <ReportSkeleton key={i} showAnalytics={includeAnalytics} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportPageSkeleton;
