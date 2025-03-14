
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse fade-in">
      {/* Header skeleton */}
      <div className="text-center mt-6 space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-5 w-48 mx-auto" />
      </div>
      
      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
      
      {/* Dashboard cards skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg p-5 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Chart placeholder */}
      <div className="border rounded-lg p-4 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 w-full rounded-md" />
        <div className="flex justify-center space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
