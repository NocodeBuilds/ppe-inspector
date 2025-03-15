
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-2 animate-pulse fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-center mb-2">
        <Skeleton className="h-8 w-8 rounded-full mr-2" />
        <Skeleton className="h-5 w-32" />
      </div>
      
      {/* Analytics dashboard skeleton */}
      <div className="w-full rounded-lg overflow-hidden border border-border/30 shadow-sm mb-2">
        <div className="p-1.5 border-b border-border/20">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        
        <div className="p-1 grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex flex-col items-center text-center py-1">
              <Skeleton className="h-6 w-6 rounded-full mb-0.5" />
              <Skeleton className="h-4 w-8 mb-0.5" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Dashboard buttons skeleton - 2 column grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Generate 6 card skeletons in a 2-column layout */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg p-2 flex items-center">
            <Skeleton className="h-8 w-8 rounded-full mr-2" />
            <div className="space-y-1 text-left flex-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
