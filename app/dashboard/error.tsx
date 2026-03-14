"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        An error occurred while loading this page.
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-slate-400">Error ID: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="btn-primary mt-6"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
