import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export function OrdersPageSkeleton() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} />
    </div>
  );
}
