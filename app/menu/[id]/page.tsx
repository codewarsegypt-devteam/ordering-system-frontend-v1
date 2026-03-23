"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchPublicMenuById, createTableServiceRequest, getApiError } from "@/lib/api";
import { useCart, useCurrency } from "@/contexts";
import { recomputeMenuPrices } from "@/lib/utils/currency.utils";
import { Search, ShoppingBag, Hash, ChevronLeft, X, UserCircle2, Receipt, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { MenuItemCard } from "../MenuItemCard";
import { CartDrawer } from "../CartDrawer";
import { useScanBrandColors } from "@/lib/hooks/useScanBrandColors";

export default function MenuByIdPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string | undefined;
  const token = searchParams.get("t") ?? undefined;

  const {
    selectedCurrency,
    selectedRate,
    availableCurrencies,
    setSelectedCurrency: setCurrency,
    initFromCurrencyInfo,
  } = useCurrency();

  // Fetch menu once without currency_id; we recompute display prices client-side on switch (no refetch = no freeze)
  const { data, isLoading, error } = useQuery({
    queryKey: ["publicMenuById", token, id],
    queryFn: () => fetchPublicMenuById(id!, token!),
    enabled: !!id && !!token,
  });

  // Brand colors: only from localStorage (saved on first /menu scan) — no second fetch here.
  const { primary } = useScanBrandColors(token, undefined);

  // Init currency context from menu response if not yet done from scan
  React.useEffect(() => {
    if (data?.currency_info) {
      initFromCurrencyInfo(data.currency_info);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.currency_info]);

  const { totalItems } = useCart();
  const [query, setQuery] = React.useState("");
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(
    null,
  );
  const [cartOpen, setCartOpen] = React.useState(false);
  const [serviceSending, setServiceSending] = React.useState<"call_waiter" | "request_bill" | null>(null);
  const [serviceCooldown, setServiceCooldown] = React.useState(false);
  const sectionRefs = React.useRef<Record<string, HTMLElement | null>>({});

  // Must run before any early return (Rules of Hooks)
  const rawCategories = data?.categories ?? [];
  const categories = React.useMemo(
    () => recomputeMenuPrices(rawCategories, selectedRate),
    [rawCategories, selectedRate]
  );

  const sendTableService = async (type: "call_waiter" | "request_bill") => {
    if (!token || serviceCooldown) return;
    setServiceSending(type);
    try {
      await createTableServiceRequest(token, type);
      toast.success(type === "call_waiter" ? "Call waiter request sent" : "Request bill sent");
      setServiceCooldown(true);
      setTimeout(() => setServiceCooldown(false), 8000);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setServiceSending(null);
    }
  };

  if (!id || !token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <p className="font-semibold text-gray-900">Missing menu or token.</p>
        <Link
          href="/menu"
          className="mt-4 text-sm text-orange-600 hover:underline"
        >
          Back to menu
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-28">
        {/* Header skeleton */}
        <div className="bg-white shadow-sm">
          <div className="mx-auto max-w-2xl">
            {/* Top bar */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-5 w-36 animate-pulse rounded-md bg-gray-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-orange-100" />
            </div>
            {/* Search bar */}
            <div className="px-4 pb-2">
              <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
            </div>
            {/* Category tabs */}
            <div className="flex gap-2 px-4 pb-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 shrink-0 animate-pulse rounded-full bg-gray-100"
                  style={{ width: `${60 + i * 12}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Items skeleton */}
        <div className="mx-auto max-w-2xl px-4 py-5 space-y-7">
          {[1, 2].map((section) => (
            <div key={section} className="space-y-3">
              <div className="space-y-1.5">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                <div className="h-0.5 w-8 rounded-full bg-orange-200" />
              </div>
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3.5"
                >
                  <div className="h-[72px] w-[72px] shrink-0 animate-pulse rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-16 animate-pulse rounded bg-orange-100" />
                  </div>
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-orange-100" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <p className="font-semibold text-gray-900">
          {error ? getApiError(error) : "Failed to load menu"}
        </p>
        <Link
          href={`/menu?t=${encodeURIComponent(token)}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to menu selection
        </Link>
      </div>
    );
  }

  const { menu, merchant_id, branch_id, table_id, table_code } = data;
  const merchantId = merchant_id != null ? String(merchant_id) : "";
  const branchId = branch_id != null ? String(branch_id) : null;
  const tableId = table_id != null ? String(table_id) : null;

  const currencySymbol = selectedCurrency?.symbol ?? menu.currancy ?? "";

  const normalizedQuery = query.trim().toLowerCase();
  const filteredCategories = normalizedQuery
    ? categories
        .map((c) => ({
          ...c,
          items: (c.items ?? []).filter((it) => {
            const hay = `${it.name_en ?? ""} ${it.name_ar ?? ""}`.toLowerCase();
            return hay.includes(normalizedQuery);
          }),
        }))
        .filter((c) => (c.items ?? []).length > 0)
    : categories;

  const catTabs = categories.map((c) => ({
    id: c.id,
    label: c.name_en || c.name_ar || "Category",
  }));
  const effectiveActiveId = activeCategoryId ?? catTabs[0]?.id ?? null;

  const scrollToCategory = (id: string) => {
    setActiveCategoryId(id);
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const backHref = `/menu?t=${encodeURIComponent(token)}`;
  const cartHref = `/menu/cart?t=${encodeURIComponent(token)}&menuId=${id}`;
  const checkoutHref = `/menu/checkout?t=${encodeURIComponent(token)}&menuId=${id}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-[env(safe-area-inset-top)]">
      <header className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link
              href={backHref}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="All menus"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold text-gray-900">
                {menu.name_en || menu.name_ar}
              </h1>
              {table_code ? (
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <Hash className="h-3 w-3" />
                  <span className="text-orange-500 font-medium">Welcome</span>
                  {" — "}Table {table_code}
                </p>
              ) : null}
            </div>

            {/* Currency selector — hidden when only one or zero choices */}
            {availableCurrencies.length > 1 && (
              <div className="relative shrink-0">
                <select
                  value={selectedCurrency?.id ?? ""}
                  onChange={(e) => {
                    const chosen = availableCurrencies.find(
                      (c) => c.currency_id === Number(e.target.value)
                    );
                    if (chosen) setCurrency(chosen);
                  }}
                  className="appearance-none rounded-xl border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-7 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 cursor-pointer"
                  style={{ focusRingColor: primary } as React.CSSProperties}
                  aria-label="Select currency"
                >
                  {availableCurrencies.map((c) => (
                    <option key={c.currency_id} value={c.currency_id}>
                      {c.currency.symbol} {c.currency.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
            )}
            {availableCurrencies.length === 1 && selectedCurrency && (
              <span className="shrink-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-600">
                {selectedCurrency.symbol} {selectedCurrency.code}
              </span>
            )}

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
              style={{ backgroundColor: `${primary}15`, color: primary }}
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow"
                  style={{ backgroundColor: primary }}
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Call Waiter / Request Bill */}
          <div className="flex gap-2 px-4 pb-2">
            <button
              type="button"
              onClick={() => sendTableService("call_waiter")}
              disabled={serviceSending !== null || serviceCooldown}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {serviceSending === "call_waiter" ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: `${primary} transparent transparent transparent` }}
                />
              ) : (
                <UserCircle2 className="h-4 w-4" style={{ color: primary }} />
              )}
              {serviceCooldown && serviceSending === null ? "Sent" : "Call waiter"}
            </button>
            <button
              type="button"
              onClick={() => sendTableService("request_bill")}
              disabled={serviceSending !== null || serviceCooldown}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {serviceSending === "request_bill" ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: `${primary} transparent transparent transparent` }}
                />
              ) : (
                <Receipt className="h-4 w-4" style={{ color: primary }} />
              )}
              {serviceCooldown && serviceSending === null ? "Sent" : "Request bill"}
            </button>
          </div>

          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {catTabs.length > 0 && (
            <div className="overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2">
                {catTabs.map((t) => {
                  const active = t.id === effectiveActiveId && !normalizedQuery;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setQuery("");
                        scrollToCategory(t.id);
                      }}
                      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                        active ? "text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      style={active ? { backgroundColor: primary } : {}}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Search className="mb-3 h-10 w-10 text-gray-300" />
            <p className="font-medium text-gray-500">No dishes found</p>
            <p className="mt-1 text-sm text-gray-400">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((cat) => (
              <section
                key={cat.id}
                ref={(el) => {
                  sectionRefs.current[cat.id] = el;
                }}
                className="scroll-mt-44"
              >
                <h2
                  className="mb-3 text-base font-bold text-gray-900"
                  style={
                    {
                      "--tw-after-bg": primary,
                    } as React.CSSProperties
                  }
                >
                  <span className="flex flex-col gap-1">
                    {cat.name_en || cat.name_ar}
                    <span
                      className="block h-0.5 w-8 rounded-full"
                      style={{ backgroundColor: primary }}
                    />
                  </span>
                </h2>
                <div className="space-y-3">
                  {(cat.items ?? []).map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      currency={currencySymbol}
                      token={token}
                      merchantId={merchantId}
                      branchId={branchId}
                      tableId={tableId}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="mx-auto flex w-full max-w-2xl items-center justify-between rounded-2xl px-5 py-4 text-white shadow-lg transition-colors"
            style={{ backgroundColor: primary }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-sm font-bold">
              {totalItems}
            </span>
            <span className="font-semibold">View cart</span>
            <ShoppingBag className="h-5 w-5 opacity-80" />
          </button>
        </div>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        currency={currencySymbol}
        cartLink={cartHref}
      />
    </div>
  );
}
