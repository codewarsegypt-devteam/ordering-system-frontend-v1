import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} />
    </div>
  );
}
