"use client";

import * as React from "react";
import Link from "next/link";
import { useCart } from "@/contexts";
import { X, Minus, Plus, Trash2, ChevronRight } from "lucide-react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  currency: string;
  cartLink: string;
  checkoutLink: string;
}

export function CartDrawer({
  open,
  onClose,
  currency,
  cartLink,
  checkoutLink,
}: CartDrawerProps) {
  const { entries, updateQuantity, removeItem, totalItems } = useCart();

  const subtotal = entries.reduce((sum, entry) => {
    const price = entry.variant ? entry.variant.price : entry.item.base_price;
    const modTotal = entry.selectedModifiers.reduce(
      (s, m) => s + m.modifier.price * m.quantity,
      0
    );
    return sum + (price + modTotal) * entry.quantity;
  }, 0);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl shadow-2xl"
        style={{
          backgroundColor: "#0d5c63",
          borderTopLeftRadius: "1.5rem",
          borderTopRightRadius: "1.5rem",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Curvy top edge + ORDER tab + close */}
        <div className="relative shrink-0">
          {/* <div className="absolute -top-px left-0 right-0 h-6" style={{ backgroundColor: "#0d5c63", borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }} /> */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="w-12" />
            <span className="rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-white" style={{ backgroundColor: "#e85d04" }}>
              Order
            </span>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {totalItems === 0 ? (
              <p className="py-8 text-center text-[#e6f4f5]/90">
                Your cart is empty
              </p>
            ) : (
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
                            <p className="mt-1 text-sm text-white/80">
                              + {addOns}
                            </p>
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
            )}
          </div>

          {totalItems > 0 && (
            <div className="shrink-0 border-t border-white/20 px-4 py-4" style={{ backgroundColor: "#0d5c63" }}>
              <div className="mb-4 flex items-center justify-between text-white">
                <span className="text-lg font-bold">Total</span>
                <span className="text-xl font-bold text-[#ffedd5]">
                  {subtotal.toFixed(2)} {currency}
                </span>
              </div>
              <Link
                href={checkoutLink}
                className="menu-btn-orange flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-bold uppercase tracking-wide"
                onClick={onClose}
              >
                Proceed to checkout
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                href={cartLink}
                className="mt-2 block text-center text-sm font-medium text-white/80 underline hover:text-white"
                onClick={onClose}
              >
                View full cart
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
