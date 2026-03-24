/**
 * Skeleton rows for list/table loading states.
 */
export function DashboardListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y" style={{ borderColor: "var(--dashboard-border)" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4"
        >
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-slate-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-1/3 max-w-[200px] animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-8 w-20 shrink-0 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
