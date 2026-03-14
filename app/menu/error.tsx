"use client";

import { useEffect } from "react";
import { UtensilsCrossed } from "lucide-react";

export default function MenuError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Menu error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <UtensilsCrossed className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        We couldn&apos;t load the menu. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
      >
        Try again
      </button>
    </div>
  );
}
