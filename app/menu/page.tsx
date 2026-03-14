"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { fetchPublicScan, getApiError } from "@/lib/api";
import { UtensilsCrossed, MapPin, Hash, ChevronLeft } from "lucide-react";

export default function MenuPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("t") ?? undefined;
  const redirected = useRef(false);

  const { data: scanData, isLoading, error } = useQuery({
    queryKey: ["publicScan", token],
    queryFn: () => fetchPublicScan(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (!scanData || redirected.current) return;
    const menus = scanData.menus ?? [];
    if (menus.length === 1) {
      redirected.current = true;
      router.replace(`/menu/${menus[0].id}?t=${encodeURIComponent(token!)}`);
    }
  }, [scanData, token, router]);

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
          <UtensilsCrossed className="h-10 w-10 text-orange-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">No menu found</h1>
        <p className="mt-2 text-sm text-gray-500">
          Open via a menu link or scan the table QR code.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-orange-500 px-6 pb-10 pt-16 text-white">
          <div className="mx-auto max-w-lg">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 animate-pulse rounded-2xl bg-white/20" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-36 animate-pulse rounded bg-white/25" />
                <div className="h-4 w-24 animate-pulse rounded bg-white/15" />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-lg px-4 -mt-5">
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <div className="mb-4 h-4 w-28 animate-pulse rounded bg-gray-200" />
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !scanData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <UtensilsCrossed className="h-8 w-8 text-red-400" />
        </div>
        <p className="font-semibold text-gray-900">
          {error ? getApiError(error) : "Failed to load scan"}
        </p>
        <p className="mt-1.5 text-sm text-gray-500">Please scan the table QR again.</p>
      </div>
    );
  }

  const menus = scanData.menus ?? [];

  if (menus.length === 1) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 px-6 pb-10 pt-16 text-white">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-4">
            {scanData.merchant_logo ? (
              <img
                src={scanData.merchant_logo}
                alt={scanData.merchant_name ?? ""}
                className="h-16 w-16 rounded-2xl border-2 border-white/30 object-cover shadow"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                <UtensilsCrossed className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{scanData.merchant_name ?? "Menu"}</h1>
              {scanData.branch_name && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-orange-100">
                  <MapPin className="h-3.5 w-3.5" />
                  {scanData.branch_name}
                </p>
              )}
              {scanData.table_name != null && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <Hash className="h-3.5 w-3.5" />
                  Table {scanData.table_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 -mt-5">
        <div className="rounded-3xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-400">
            Choose a menu
          </h2>
          {menus.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No menus available.</p>
          ) : (
            <ul className="space-y-2.5">
              {menus.map((menu) => (
                <li key={String(menu.id)}>
                  <Link
                    href={`/menu/${menu.id}?t=${encodeURIComponent(token)}`}
                    className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-semibold text-gray-900 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  >
                    {menu.name_en || menu.name_ar || `Menu ${menu.id}`}
                    <ChevronLeft className="h-5 w-5 rotate-180 text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
