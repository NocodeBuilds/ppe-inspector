
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="text-center mt-6 space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-5 w-48 mx-auto" />
      </div>
      
      {/* Dashboard cards skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
