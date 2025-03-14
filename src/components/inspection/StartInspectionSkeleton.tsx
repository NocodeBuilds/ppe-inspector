
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const StartInspectionSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>
      
      {/* Option cards */}
      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        {[1, 2].map((i) => (
          <div key={i} className="border rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-40" />
              <div className="h-12 w-12 rounded-full overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
      
      {/* Recent scans section */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartInspectionSkeleton;
