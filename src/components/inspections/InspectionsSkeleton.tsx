
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface InspectionsSkeletonProps {
  count?: number;
}

const InspectionsSkeleton: React.FC<InspectionsSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-6 animate-pulse fade-in">
      {/* Search and filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      
      {/* Inspection items skeleton */}
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center gap-2 mt-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InspectionsSkeleton;
