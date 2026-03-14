"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fetchPublicScan, createTableServiceRequest, getApiError } from "@/lib/api";
import Image from "next/image";
import { UtensilsCrossed, MapPin, Hash, ChevronLeft, UserCircle2, Receipt } from "lucide-react";
import { toast } from "sonner";

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
  const [serviceSending, setServiceSending] = useState<"call_waiter" | "request_bill" | null>(null);
  const [serviceCooldown, setServiceCooldown] = useState(false);

  const sendTableService = async (type: "call_waiter" | "request_bill") => {
    if (!token || serviceCooldown) return;
    setServiceSending(type);
    try {
      await createTableServiceRequest(token, type);
      toast.success(type === "call_waiter" ? "تم إرسال طلب الويتر" : "تم إرسال طلب الفاتورة");
      setServiceCooldown(true);
      setTimeout(() => setServiceCooldown(false), 8000);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setServiceSending(null);
    }
  };

  if (menus.length === 1) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const merchantName = scanData.merchant_name ?? "our place";
  const branchName = scanData.branch_name;
  const tableName = scanData.table_name;

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50 to-gray-50 pb-10">
      {/* Welcome header */}
      <div className="bg-linear-to-br from-orange-500 rounded-b-4xl via-orange-600 to-amber-600 px-6 pt-10 pb-12 text-white shadow-lg">
        <div className="mx-auto max-w-lg">
          <div className="flex flex-col items-start gap-4">
            {scanData.merchant_logo ? (
              <Image
                src={scanData.merchant_logo}
                alt=""
                width={72}
                height={72}
                className="h-20 w-20 shrink-0 rounded-2xl border-2 border-white/30 object-cover shadow-lg"
                sizes="72px"
                priority
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
                <UtensilsCrossed className="h-10 w-10 text-white" />
              </div>
            )}
            <div className="min-w-0 flex-1 pt-0.5">
              {/* <p className="text-sm font-medium uppercase tracking-wider text-orange-100">
                Welcome
              </p> */}
              <h1 className="mt-1 text-2xl font-bold leading-tight">
                Welcome to {merchantName}
              </h1>
              <p className="mt-3 text-orange-100/95 leading-relaxed">
                {branchName != null && tableName != null ? (
                  <>
                    You&apos;re at <span className="font-semibold text-white">{branchName}</span>, sitting at{" "}
                    <span className="font-semibold text-white">Table {tableName}</span>. We&apos;re glad you&apos;re here take a look at the menu and enjoy your time.
                  </>
                ) : branchName ? (
                  <>
                    You&apos;re at <span className="font-semibold text-white">{branchName}</span>. We&apos;re glad you&apos;re here — browse the menu below and enjoy.
                  </>
                ) : tableName != null ? (
                  <>
                    You&apos;re at <span className="font-semibold text-white">Table {tableName}</span>. We&apos;re glad you&apos;re here — browse the menu and enjoy.
                  </>
                ) : (
                  "We're glad you're here — browse the menu below and enjoy."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 -mt-6 space-y-4">
        {/* Service shortcuts */}
        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Need something?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => sendTableService("call_waiter")}
              disabled={serviceSending !== null || serviceCooldown}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50/80 py-3 text-sm font-medium text-orange-800 transition-colors hover:bg-orange-100 disabled:opacity-60"
            >
              {serviceSending === "call_waiter" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              ) : (
                <UserCircle2 className="h-4 w-4 text-orange-600" />
              )}
              {serviceCooldown && !serviceSending ? "تم الإرسال" : "طلب ويتر"}
            </button>
            <button
              type="button"
              onClick={() => sendTableService("request_bill")}
              disabled={serviceSending !== null || serviceCooldown}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50/80 py-3 text-sm font-medium text-orange-800 transition-colors hover:bg-orange-100 disabled:opacity-60"
            >
              {serviceSending === "request_bill" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              ) : (
                <Receipt className="h-4 w-4 text-orange-600" />
              )}
              {serviceCooldown && !serviceSending ? "تم الإرسال" : "طلب الفاتورة"}
            </button>
          </div>
        </div>

        {/* Choose menu */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-bold text-gray-900">
            Choose a menu
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Select a menu to start ordering
          </p>
          {menus.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No menus available at the moment.</p>
          ) : (
            <ul className="space-y-2.5">
              {menus.map((menu) => (
                <li key={String(menu.id)}>
                  <Link
                    href={`/menu/${menu.id}?t=${encodeURIComponent(token)}`}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-5 py-4 font-semibold text-gray-900 transition-all hover:border-orange-200 hover:bg-orange-50/50 hover:text-orange-700 active:scale-[0.99]"
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
