"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchPublicMenu, fetchPublicMenuById, fetchPublicScan, getApiError } from "@/lib/api";
import { useCart } from "@/contexts";
import { Search, ShoppingCart, UtensilsCrossed, MapPin, Hash } from "lucide-react";
import { MenuItemCard } from "./MenuItemCard";
import { CartDrawer } from "./CartDrawer";

export default function MenuPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("t") ?? undefined;
  const menuIdParam = searchParams.get("menuId") ?? undefined;
  const merchantIdParam = searchParams.get("merchantId") ?? "";
  const tableCodeParam = searchParams.get("tableCode") ?? undefined;

  const isTokenFlow = !!token;
  const showScanFirst = isTokenFlow && !menuIdParam;

  const { data: scanData, isLoading: scanLoading, error: scanError } = useQuery({
    queryKey: ["publicScan", token],
    queryFn: () => fetchPublicScan(token!),
    enabled: (showScanFirst || (!!token && !!menuIdParam)) && !!token,
  });

  const { data: menuByIdData, isLoading: menuByIdLoading, error: menuByIdError } = useQuery({
    queryKey: ["publicMenuById", token, menuIdParam],
    queryFn: () => fetchPublicMenuById(menuIdParam!, token!),
    enabled: isTokenFlow && !!menuIdParam && !!token,
  });

  const { data: legacyMenuData, isLoading: legacyLoading, error: legacyError } = useQuery({
    queryKey: ["publicMenu", merchantIdParam, tableCodeParam],
    queryFn: () => fetchPublicMenu(merchantIdParam, tableCodeParam),
    enabled: !isTokenFlow && !!merchantIdParam,
  });

  const data = React.useMemo(() => {
    if (isTokenFlow && menuIdParam && scanData && menuByIdData) {
      return {
        merchant_id: String(scanData.merchant_id),
        branch_id: scanData.branch_id != null ? String(scanData.branch_id) : null,
        table_id: scanData.table_id != null ? String(scanData.table_id) : null,
        table_code: scanData.table_code ?? undefined,
        menu: menuByIdData.menu,
        categories: menuByIdData.categories ?? [],
      };
    }
    return legacyMenuData ?? null;
  }, [isTokenFlow, menuIdParam, scanData, menuByIdData, legacyMenuData]);

  const isLoading = showScanFirst
    ? scanLoading
    : isTokenFlow && menuIdParam
      ? scanLoading || menuByIdLoading
      : legacyLoading;
  const error = showScanFirst ? scanError : isTokenFlow && menuIdParam ? scanError || menuByIdError : legacyError;

  const { totalItems } = useCart();
  const [query, setQuery] = React.useState("");
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(null);
  const [cartOpen, setCartOpen] = React.useState(false);
  const sectionRefs = React.useRef<Record<string, HTMLElement | null>>({});

  if (!token && !merchantIdParam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-center text-gray-600">
          Open with a menu link (e.g. ?merchantId=... or scan the table QR)
        </p>
      </div>
    );
  }

  if (showScanFirst) {
    if (scanLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      );
    }
    if (scanError || !scanData) {
      const message = scanError ? getApiError(scanError) : "Failed to load scan";
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md text-center">
            <p className="text-red-600 font-medium">{message}</p>
            <p className="mt-2 text-sm text-gray-500">Please scan the table QR again.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-4">
              {scanData.merchant_logo ? (
                <img
                  src={scanData.merchant_logo}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <UtensilsCrossed className="h-7 w-7" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {scanData.merchant_name ?? "Menu"}
                </h1>
                {scanData.branch_name && (
                  <p className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    {scanData.branch_name}
                  </p>
                )}
                {scanData.table_name != null && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Hash className="h-4 w-4" />
                    Table {scanData.table_name}
                  </p>
                )}
              </div>
            </div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Choose a menu
            </h2>
            <ul className="space-y-2">
              {(scanData.menus ?? []).map((menu) => (
                <li key={String(menu.id)}>
                  <Link
                    href={`/menu?t=${encodeURIComponent(token!)}&menuId=${menu.id}`}
                    className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-left font-medium text-gray-900 transition-colors hover:border-orange-300 hover:bg-orange-50"
                  >
                    {menu.name_en || menu.name_ar || `Menu ${menu.id}`}
                  </Link>
                </li>
              ))}
            </ul>
            {(scanData.menus ?? []).length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">No menus available.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    const message = error ? getApiError(error) : "Failed to load menu";
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <p className="text-red-600 font-medium">{message}</p>
          {token && (
            <Link
              href={`/menu?t=${encodeURIComponent(token)}`}
              className="mt-3 inline-block text-sm text-orange-600 hover:underline"
            >
              ← Back to menu selection
            </Link>
          )}
        </div>
      </div>
    );
  }

  const { menu, categories = [] } = data;
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
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cartHref = token
    ? `/menu/cart?t=${token}`
    : `/menu/cart?merchantId=${data.merchant_id}&tableCode=${tableCodeParam ?? ""}`;
  const checkoutHref = token
    ? `/menu/checkout?t=${token}`
    : `/menu/checkout?merchantId=${data.merchant_id}&tableCode=${tableCodeParam ?? ""}`;

  const backToMenusHref = token ? `/menu?t=${encodeURIComponent(token)}` : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-[env(safe-area-inset-top)]">
      <header className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              {backToMenusHref && (
                <Link
                  href={backToMenusHref}
                  className="mb-0.5 block text-xs font-medium text-orange-600 hover:underline"
                >
                  ← All menus
                </Link>
              )}
              <h1 className="truncate text-lg font-bold text-gray-900">
                {menu.name_en || menu.name_ar}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
              aria-label="Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
          {/* add svg */}
          
          {/* Category chips – horizontal scroll */}
          {catTabs.length > 0 && (
            <div className="mt-3 -mx-4 overflow-x-auto px-4 scrollbar-none">
              <div className="flex gap-2 pb-1">
                {catTabs.map((t) => {
                  const active = t.id === effectiveActiveId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => scrollToCategory(t.id)}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
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

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-4">
        {filteredCategories.length === 0 ? (
          <p className="py-12 text-center text-gray-500">
            No items match your search.
          </p>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((cat) => (
              <section
                key={cat.id}
                ref={(el) => {
                  sectionRefs.current[cat.id] = el;
                }}
                className="scroll-mt-40"
              >
                <h2 className="mb-3 text-base font-bold text-gray-900">
                  {cat.name_en || cat.name_ar}
                </h2>
                <div className="space-y-2">
                  {(cat.items ?? []).map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      currency={menu.currancy}
                      merchantId={data.merchant_id}
                      branchId={data.branch_id}
                      tableId={data.table_id}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Bottom bar – View cart (Talabat style) */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-0 left-0 right-0 z-30 mx-auto flex max-w-2xl items-center justify-between gap-4 bg-orange-500 px-4 py-4 text-white shadow-lg pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <span className="font-semibold">
          {totalItems > 0
            ? `View cart · ${totalItems} item${totalItems !== 1 ? "s" : ""}`
            : "View cart"}
        </span>
        <ShoppingCart className="h-5 w-5" />
      </button>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        currency={menu.currancy}
        cartLink={cartHref}
        checkoutLink={checkoutHref}
      />
    </div>
  );
}
