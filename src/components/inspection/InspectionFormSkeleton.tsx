import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const InspectionFormSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" /> {/* h2 size */}
        <Skeleton className="h-5 w-48" /> {/* text-body size */}
      </div>
      
      {/* PPE Information */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" /> {/* h3 size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" /> {/* text-body-sm size */}
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" /> {/* text-body-sm size */}
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      
      {/* Inspection Type */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" /> {/* h3 size */}
        <div className="flex space-x-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>
      </div>
      
      {/* Checkpoints */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" /> {/* h3 size */}
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-3 border p-4 rounded-md">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-64" /> {/* h4 size */}
                <div className="flex space-x-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-8 w-16" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" /> {/* text-body-sm size */}
                <Skeleton className="h-5 w-24" /> {/* text-body-sm size */}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Form actions */}
      <div className="flex justify-between">
        <Skeleton className="h-10 w-28" />
        <div className="flex space-x-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
};

export default InspectionFormSkeleton;
