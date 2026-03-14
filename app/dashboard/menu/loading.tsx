import { PageHeaderSkeleton, CardSkeleton } from "@/components/ui/Skeleton";

export default function MenuLoading() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
