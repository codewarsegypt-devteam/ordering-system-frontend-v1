"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicMenu } from "@/lib/api";
import { useAuth, useCart } from "@/contexts";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Trash2, ChevronRight, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tableCode = searchParams.get("tableCode") ?? "";
  const merchantId = user?.merchant_id ?? searchParams.get("merchantId") ?? "";

  const { data: menuData } = useQuery({
    queryKey: ["publicMenu", merchantId, tableCode],
    queryFn: () => fetchPublicMenu(merchantId, tableCode),
    enabled: !!merchantId,
  });
  const currency = menuData?.menu?.currancy ?? "EGP";

  const { entries, updateQuantity, removeItem, totalItems } = useCart();

  const menuHref = `/menu?merchantId=${merchantId}&tableCode=${tableCode}`;
  const checkoutHref = `/menu/checkout?merchantId=${merchantId}&tableCode=${tableCode}`;

  const subtotal = entries.reduce((sum, entry) => {
    const price = entry.variant ? entry.variant.price : entry.item.base_price;
    const modTotal = entry.selectedModifiers.reduce(
      (s, m) => s + m.modifier.price * m.quantity,
      0
    );
    return sum + (price + modTotal) * entry.quantity;
  }, 0);

  if (totalItems === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]" style={{ backgroundColor: "#0d5c63" }}>
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-white">
          <ShoppingCart className="h-12 w-12" />
        </div>
        <h1 className="mt-6 text-center text-xl font-bold text-white">
          Your cart is empty
        </h1>
        <Link
          href={menuHref}
          className="menu-btn-orange mt-6 rounded-2xl px-6 py-3 font-bold uppercase tracking-wide text-white"
        >
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]" style={{ backgroundColor: "#0d5c63" }}>
      {/* Header with ORDER tab + back */}
      <header className="sticky top-0 z-10 border-b border-white/20" style={{ backgroundColor: "#0d5c63" }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href={menuHref}
            className="flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            Menu
          </Link>
          <span className="rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-white" style={{ backgroundColor: "#e85d04" }}>
            Order
          </span>
          <span className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <ul className="space-y-3">
          {entries.map((entry, index) => {
            const price = entry.variant
              ? entry.variant.price
              : entry.item.base_price;
            const modTotal = entry.selectedModifiers.reduce(
              (s, m) => s + m.modifier.price * m.quantity,
              0
            );
            const lineTotal = (price + modTotal) * entry.quantity;
            const name = entry.item.name_en || entry.item.name_ar;
            const variantLabel = entry.variant
              ? ` · ${entry.variant.name_en || entry.variant.name_ar}`
              : "";
            const addOns =
              entry.selectedModifiers.length > 0
                ? entry.selectedModifiers
                    .map(
                      (m) =>
                        `${m.modifier.name_en || m.modifier.name_ar}${m.quantity > 1 ? ` ×${m.quantity}` : ""}`
                    )
                    .join(", ")
                : null;

            return (
              <li
                key={`${index}-${entry.item.id}-${entry.variant?.id}`}
                className="rounded-2xl bg-white/10 p-4 text-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {name}
                      {variantLabel}
                    </p>
                    {addOns && (
                      <p className="mt-1 text-sm text-white/80">+ {addOns}</p>
                    )}
                    <p className="mt-1.5 font-semibold text-[#ffedd5]">
                      {lineTotal.toFixed(2)} {currency}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center rounded-xl bg-white/20 overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(index, entry.quantity - 1)
                        }
                        className="flex h-9 w-9 items-center justify-center text-white hover:bg-white/20"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {entry.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(index, entry.quantity + 1)
                        }
                        className="flex h-9 w-9 items-center justify-center text-white hover:bg-white/20"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-lg p-2 text-red-300 hover:bg-white/10 hover:text-red-200"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 rounded-2xl border border-white/20 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between text-white">
            <span className="text-lg font-bold">Total</span>
            <span className="text-xl font-bold text-[#ffedd5]">
              {subtotal.toFixed(2)} {currency}
            </span>
          </div>
          <Link
            href={checkoutHref}
            className="menu-btn-orange flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-bold uppercase tracking-wide"
          >
            Proceed to checkout
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
