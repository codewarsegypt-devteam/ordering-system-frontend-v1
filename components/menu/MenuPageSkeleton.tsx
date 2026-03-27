import { Skeleton } from "@/components/ui/Skeleton";

/** Single loading UI for /menu/[id] (route loading, Suspense, and data fetch). */
export function MenuPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          </div>
          <div className="px-4 pb-2">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="flex gap-2 px-4 pb-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-8 w-20 shrink-0 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-5">
        {Array.from({ length: 2 }).map((_, sectionIdx) => (
          <div key={sectionIdx} className="space-y-3">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3.5"
              >
                <Skeleton className="h-[72px] w-[72px] shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
