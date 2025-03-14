
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/70 dark:bg-muted/50 relative overflow-hidden",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite]",
        "after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
        className
      )}
      {...props}
      aria-hidden="true" // Improve accessibility by hiding skeletons from screen readers
      role="status"
      aria-label="Loading"
    />
  )
}

export { Skeleton }
