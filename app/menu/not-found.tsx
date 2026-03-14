import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function MenuNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
        <UtensilsCrossed className="h-8 w-8 text-orange-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Menu not found</h2>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        This menu page doesn&apos;t exist or the link may have expired.
      </p>
      <Link
        href="/menu"
        className="mt-6 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
      >
        Back to menu
      </Link>
    </div>
  );
}
