
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse fade-in">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-background to-background/90 rounded-xl p-6 border border-border/20">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-56 rounded-md" />
      </div>
      
      {/* Analytics dashboard skeleton */}
      <div className="w-full rounded-xl overflow-hidden backdrop-blur-md bg-gradient-to-r from-background/70 to-background/80 border border-border/30 shadow-lg">
        <div className="p-5 border-b border-border/20 bg-background/20 flex justify-between items-center">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        
        <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex flex-col items-center text-center p-4 rounded-lg border border-border/10">
              <Skeleton className="h-14 w-14 rounded-full mb-3" />
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick Actions section skeleton */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <Skeleton className="h-7 w-32 mb-2 sm:mb-0" />
          <Skeleton className="h-10 w-44 rounded-md" />
        </div>
        
        {/* Dashboard cards skeleton - 2 row grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl p-5 space-y-3 bg-card/40 border border-border/30">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <div className="space-y-2 text-center">
                <Skeleton className="h-5 w-24 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
