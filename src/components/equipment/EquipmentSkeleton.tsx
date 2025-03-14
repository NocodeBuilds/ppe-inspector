
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const EquipmentSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Search and filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-10" />
      </div>
      
      {/* Tab list skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-full rounded-md mb-4" />
      </div>
      
      {/* Equipment cards skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-4 mb-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
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
      ))}
    </div>
  );
};

export default EquipmentSkeleton;
