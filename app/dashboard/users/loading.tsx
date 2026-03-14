import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function UsersLoading() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} />
    </div>
  );
}
