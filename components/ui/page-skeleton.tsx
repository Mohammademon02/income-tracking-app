import { PageContainer } from "@/components/page-shell"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * The loading state shared by every page.
 *
 * Six loading.tsx files each hand-built their own with hardcoded slate boxes
 * and their own copy of the old page gradient. One component keeps them in step
 * with the real layout, and on tokens so they work in dark mode.
 */
export function PageSkeleton({
  rows = 5,
  showStats = false,
}: {
  rows?: number
  showStats?: boolean
}) {
  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {showStats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : null}

      <div className="space-y-3 rounded-lg border bg-card p-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="ml-auto h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
