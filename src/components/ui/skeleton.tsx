
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/70 dark:bg-muted/50", className)}
      {...props}
      aria-hidden="true" // Improve accessibility by hiding skeletons from screen readers
    />
  )
}

export { Skeleton }
