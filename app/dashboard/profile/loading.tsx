import { PageHeaderSkeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
