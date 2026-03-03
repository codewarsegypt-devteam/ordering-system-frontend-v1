import Link from "next/link";
import { LayoutDashboard, UtensilsCrossed } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-teal-50 via-white to-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="page-title mb-3 text-zinc-900">
          Merchant Ordering
        </h1>
        <p className="mb-10 text-zinc-600">
          Staff dashboard and customer menu
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard"
            className="card flex items-center justify-center gap-3 px-6 py-5 font-semibold text-teal-700 transition-all hover:border-teal-300 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/25">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            Dashboard
          </Link>
          <Link
            href="/menu"
            className="card flex items-center justify-center gap-3 px-6 py-5 font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-200 text-zinc-700">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            Menu (add ?merchantId=...)
          </Link>
        </div>
        <p className="mt-10 text-sm text-zinc-500">
          Open the menu with /menu?merchantId=YOUR_MERCHANT_UUID or scan a table QR.
        </p>
      </div>
    </div>
  );
}
