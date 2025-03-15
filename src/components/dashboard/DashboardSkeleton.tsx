
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse fade-in">
      {/* Header skeleton */}
      <div className="text-center space-y-3">
        <Skeleton className="h-6 w-48 mx-auto" />
      </div>
      
      {/* Analytics dashboard skeleton */}
      <div className="w-full rounded-xl overflow-hidden backdrop-blur-md bg-gradient-to-r from-background/70 to-background/80 border border-border/30 shadow-lg">
        <div className="p-3 sm:p-4 border-b border-border/20 bg-background/20">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        
        <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex flex-col items-center text-center p-3 rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full mb-2" />
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Dashboard cards skeleton - 2 column grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
        {/* Generate 6 card skeletons in a 2-column layout */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg p-3 sm:p-4 space-y-3 bg-background/60">
            <div className="flex justify-center">
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
            </div>
            <div className="space-y-2 text-center">
              <Skeleton className="h-4 w-20 sm:w-24 mx-auto" />
              <Skeleton className="h-3 w-16 sm:w-20 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
