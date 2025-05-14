import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "bg-muted",
        dark: "bg-muted/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  className,
  variant,
  width,
  height,
  ...props
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      style={style}
      {...props}
    />
  );
}

// Common skeleton patterns for reuse
function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-background p-4 shadow">
      <div className="space-y-3">
        <Skeleton height={20} width="60%" />
        <Skeleton height={100} />
        <div className="flex items-center gap-2">
          <Skeleton width={100} height={20} />
          <Skeleton width={100} height={20} />
        </div>
      </div>
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton height={40} width={40} className="rounded-full" />
      <div className="space-y-2">
        <Skeleton height={16} width={150} />
        <Skeleton height={12} width={200} />
      </div>
    </div>
  );
}

function TextInputSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton height={16} width={120} />
      <Skeleton height={40} />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Skeleton height={80} width={80} className="rounded-full" />
        <div className="space-y-2">
          <Skeleton height={20} width={150} />
          <Skeleton height={16} width={200} />
        </div>
      </div>
      <Skeleton height={1} className="my-2" />
      <div className="space-y-3">
        <Skeleton height={16} />
        <Skeleton height={16} />
        <Skeleton height={16} width="80%" />
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  CardSkeleton, 
  ListItemSkeleton, 
  TextInputSkeleton, 
  ProfileSkeleton,
  skeletonVariants 
};
