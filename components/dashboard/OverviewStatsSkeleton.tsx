import { Skeleton, StatCardSkeleton } from "@/components/ui/Skeleton";

/** Matches overview “At a glance” + chart + list blocks while stats queries load. */
export function OverviewStatsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-1.5 h-4 w-64" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
