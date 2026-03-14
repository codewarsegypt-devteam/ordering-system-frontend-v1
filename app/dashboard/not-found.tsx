import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <span className="text-4xl font-black text-slate-300">404</span>
      </div>
      <h2 className="text-xl font-bold text-slate-900">Page not found</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        This dashboard page doesn&apos;t exist or has been moved.
      </p>
      <Link href="/dashboard" className="btn-primary mt-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
