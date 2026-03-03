"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicMenu } from "@/lib/api";
import { useAuth, useCart } from "@/contexts";
import {
  Loader2,
  UtensilsCrossed,
  ShoppingCart,
} from "lucide-react";
import { MenuItemCard } from "./MenuItemCard";
import { CartDrawer } from "./CartDrawer";

export default function MenuPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tableCode = searchParams.get("tableCode") ?? undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["publicMenu", user?.merchant_id, tableCode],
    queryFn: () => fetchPublicMenu(user?.merchant_id ?? "", tableCode),
    enabled: !!user?.merchant_id,
  });

  const { totalItems } = useCart();
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(
    null
  );
  const [cartOpen, setCartOpen] = React.useState(false);
  const sectionRefs = React.useRef<Record<string, HTMLElement | null>>({});
  

  if (!user?.merchant_id) {
    return (
      <div className="menu-theme flex min-h-screen flex-col items-center justify-center px-5 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <div className="menu-theme-orange-soft menu-theme-accent flex h-20 w-20 items-center justify-center rounded-full">
          <UtensilsCrossed className="h-10 w-10" />
        </div>
        <h1 className="menu-theme-text mt-6 text-center text-xl font-bold">
          Menu not found
        </h1>
        <p className="menu-theme-text-muted mt-2 max-w-xs text-center text-sm">
          Open this page with a merchant link.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="menu-theme flex min-h-screen items-center justify-center pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#e85d04] border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="menu-theme flex min-h-screen flex-col items-center justify-center px-5 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <p className="text-center text-sm font-medium text-red-600">
          {error ? String(error) : "Failed to load menu"}
        </p>
      </div>
    );
  }

  const { menu, categories = [] } = data;
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

  const cartHref = `/menu/cart?merchantId=${user.merchant_id}&tableCode=${tableCode ?? ""}`;
  const checkoutHref = `/menu/checkout?merchantId=${user.merchant_id}&tableCode=${tableCode ?? ""}`;

  return (
    <div className="bg-menu-bg min-h-screen pb-28 pt-[env(safe-area-inset-top)] sm:pb-10 overflow-hidden">
      {/* Header: logo + MENU, PICK YOUR ORDER NOW, CART */}
      <header className="menu-theme-bg sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-5">
          <div className="flex flex-col items-center pt-8 pb-2">
            <div className="bg-menu-orange flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <span className="text-menu-orange mt-2 text-sm font-bold uppercase tracking-wider">
              Menu
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 py-4">
            <h1 className="text-menu-orange text-base font-bold uppercase tracking-wide sm:text-lg">
              Pick your order now
            </h1>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="menu-btn-orange relative flex items-center gap-2 rounded-2xl px-4 py-2.5 font-bold uppercase tracking-wide shadow-md sm:px-5"
            >
              <ShoppingCart className="h-5 w-5" />
              {/* Cart */}
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#e85d04]">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
        <div className="bg-menu-orange h-[1px] my-3" />

      {/* Circular category pills */}
      {catTabs.length > 0 && (
        <div className="menu-theme-bg sticky top-0 z-10 -mx-4 overflow-x-auto px-4  py-4 scrollbar-none sm:mx-0 sm:px-5">
          <div className="flex gap-6 sm:flex-wrap sm:justify-center">
            {catTabs.map((t) => {
              const active = t.id === effectiveActiveId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => scrollToCategory(t.id)}
                  className="flex flex-col items-center gap-2 px-3"
                >
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold sm:h-16 sm:w-16 ${
                      active
                        ? "bg-menu-orange text-white shadow-md"
                        : "bg-menu-orange-soft text-menu-orange"
                    }`}
                  >
                    {(t.label || "?").charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`max-w-16 truncate text-center text-xs font-semibold sm:max-w-20 ${
                      active ? "text-menu-orange" : "text-menu-text-muted"
                    }`}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
  <div className="bg-menu-orange h-[1px] my-3" /> 
      {/* Content: CAT NAME + item cards */}
      <main className="  mx-auto max-w-5xl px-4 py-6 sm:px-5 sm:py-8 ">
        <div className="space-y-8">
          {categories.map((cat) => (
            <section
              key={cat.id}
              ref={(el) => {
                sectionRefs.current[cat.id] = el;
              }}
              className="scroll-mt-48 sm:scroll-mt-52"
            >
              <h2 className="text-menu-orange mb-4 text-xl font-bold uppercase tracking-wide sm:text-2xl">
                {cat.name_en || cat.name_ar}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {(cat.items ?? []).map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    currency={menu.currancy}
                    merchantId={user.merchant_id}
                    branchId={data.branch_id}
                    tableId={data.table_id}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Cart bottom sheet */}
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
