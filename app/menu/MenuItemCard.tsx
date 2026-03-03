"use client";

import * as React from "react";
import { Plus, Minus, Check, X } from "lucide-react";
import { useCart } from "@/contexts";
import type {
  PublicMenuItem,
  PublicMenuVariant,
  PublicMenuModifierGroupRule,
  PublicMenuModifier,
} from "@/lib/types";

interface MenuItemCardProps {
  item: PublicMenuItem;
  currency: string;
  merchantId: string;
  branchId: string | null;
  tableId: string | null;
}

export function MenuItemCard({ item, currency }: MenuItemCardProps) {
  const { addItem } = useCart();

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [variant, setVariant] = React.useState<PublicMenuVariant | null>(
    item.variants?.[0] ?? null
  );
  const [quantity, setQuantity] = React.useState(1);

  const [modifierSelections, setModifierSelections] = React.useState<
    Record<string, { modifier: PublicMenuModifier; qty: number }[]>
  >({});

  const groups = item.modifier_groups ?? [];
  const price = variant ? variant.price : item.base_price;
  const displayName = item.name_en || item.name_ar;
  const nameAr = item.name_ar;
  const nameEn = item.name_en;

  const selectedCountForGroup = (groupId: string) =>
    (modifierSelections[groupId] ?? []).reduce((s, x) => s + x.qty, 0);

  const isModifierSelected = (groupId: string, modId: string) =>
    (modifierSelections[groupId] ?? []).some(
      (x) => String(x.modifier.id) === String(modId)
    );

  const toggleModifier = (
    group: PublicMenuModifierGroupRule,
    mod: PublicMenuModifier
  ) => {
    const key = String(group.group.id);
    const list = modifierSelections[key] ?? [];
    const idx = list.findIndex((x) => String(x.modifier.id) === String(mod.id));
    const max = group.rule.max_select;
    let next: { modifier: PublicMenuModifier; qty: number }[];
    if (idx >= 0) {
      next = list.filter((_, i) => i !== idx);
    } else {
      const total = list.reduce((s, x) => s + x.qty, 0);
      if (total >= max) return;
      next = [...list, { modifier: mod, qty: 1 }];
    }
    setModifierSelections((prev) => ({ ...prev, [key]: next }));
  };

  const valid = groups.every((g) => {
    const selected = modifierSelections[String(g.group.id)] ?? [];
    const count = selected.reduce((s, x) => s + x.qty, 0);
    return count >= g.rule.min_select && count <= g.rule.max_select;
  });

  const firstInvalid = groups.find((g) => {
    const count = selectedCountForGroup(String(g.group.id));
    return count < g.rule.min_select || count > g.rule.max_select;
  });

  const resetState = () => {
    setVariant(item.variants?.[0] ?? null);
    setQuantity(1);
    setModifierSelections({});
  };

  const handleAdd = () => {
    const selectedModifiers = groups.flatMap((g) =>
      (modifierSelections[String(g.group.id)] ?? []).map((s) => ({
        modifier: s.modifier,
        quantity: s.qty,
      }))
    );
    addItem({
      item,
      variant: variant ?? null,
      quantity,
      selectedModifiers,
    });
    setDetailsOpen(false);
    resetState();
  };

  /** Quick order: add with default variant and min required modifiers (or none) */
  const handleQuickOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultVariant = item.variants?.[0] ?? null;
    const defaultModifiers: Array<{ modifier: PublicMenuModifier; quantity: number }> = [];
    for (const g of groups) {
      const min = g.rule.min_select;
      for (let i = 0; i < min && g.modifiers[i]; i++) {
        defaultModifiers.push({ modifier: g.modifiers[i], quantity: 1 });
      }
    }
    addItem({
      item,
      variant: defaultVariant,
      quantity: 1,
      selectedModifiers: defaultModifiers,
    });
  };

  const canQuickOrder = groups.every((g) => g.rule.min_select === 0);

  return (
    <>
      {/* Card: orange tint, image placeholder, name + price, Quick order + See details (blue) */}
      <div className="flex overflow-hidden rounded-2xl border-2 border-[#e85d04]/30 bg-[#ffedd5]/80 shadow-sm p-3 sm:p-4">
        <div className="flex flex-1 justify-between items-center gap-3  ">
          <div className="flex  h-16 w-16 shrink-0 sm:h-20 sm:w-20 ">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white shadow-inner">
              <span className="text-2xl font-bold text-[#6b6560] sm:text-3xl">
                {(displayName || "?").charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight text-[#2d2a26]">
              {nameEn && nameAr ? (
                <>
                  {nameEn} <span className="text-[#6b6560]">/ {nameAr}</span>
                </>
              ) : (
                displayName
              )}
            </p>
            <p className="mt-1 font-bold text-[#e85d04]">
              {price.toFixed(2)} {currency}
            </p>
          </div>
        </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleQuickOrder}
                disabled={!canQuickOrder}
                className="bg-[#0d5c63] w-full rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wide disabled:opacity-50 sm:text-sm"
              >
                Quick order
              </button>
              <button
                type="button"
                onClick={() => setDetailsOpen(true)}
                className="bg-[#0d5c63] w-full rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wide sm:text-sm"
              >
                See details
              </button>
            </div>
      </div>

      {/* See details modal / bottom sheet */}
      {detailsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          onClick={() => {
            setDetailsOpen(false);
            resetState();
          }}
        >
          <div
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-[#2d2a26]">
                    {displayName}
                  </h3>
                  <p className="mt-1 text-lg font-bold text-[#e85d04]">
                    {price.toFixed(2)} {currency}
                  </p>
                  {firstInvalid && (
                    <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
                      Please choose{" "}
                      {firstInvalid.group.name_en || firstInvalid.group.name_ar}{" "}
                      ({firstInvalid.rule.min_select}–{firstInvalid.rule.max_select})
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDetailsOpen(false);
                    resetState();
                  }}
                  className="rounded-full p-2 text-[#6b6560] hover:bg-zinc-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {item.variants && item.variants.length > 0 && (
                <div className="mb-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6b6560]">
                    Variants
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {item.variants.map((v) => {
                      const active = String(variant?.id) === String(v.id);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setVariant(v)}
                        className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-sm font-semibold ${
                          active
                            ? "border-[#e85d04] bg-[#ffedd5] text-[#e85d04]"
                            : "border-zinc-200 text-[#2d2a26] hover:border-[#e85d04]/50"
                        }`}
                        >
                          <span>{v.name_en || v.name_ar}</span>
                          <span className="text-[#6b6560]">
                            {v.price.toFixed(2)} {currency}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {groups.map((g) => {
                const gid = String(g.group.id);
                const count = selectedCountForGroup(gid);
                const min = g.rule.min_select;
                const max = g.rule.max_select;
                const ok = count >= min && count <= max;
                return (
                  <div key={gid} className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#6b6560]">
                      {g.group.name_en || g.group.name_ar} (choose {min}–{max})
                    </p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {count}/{max}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {g.modifiers.map((m) => {
                        const selected = isModifierSelected(gid, String(m.id));
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleModifier(g, m)}
                            className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold ${
                              selected
                                ? "border-[#e85d04] bg-[#ffedd5] text-[#e85d04]"
                                : "border-zinc-200 text-[#2d2a26] hover:border-[#e85d04]/50"
                            }`}
                          >
                            {selected ? <Check className="h-4 w-4" /> : null}
                            <span>{m.name_en || m.name_ar}</span>
                            {m.price > 0 && (
                              <span className="text-xs text-[#6b6560]">
                                +{m.price.toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="sticky bottom-0 -mx-6 mt-6 border-t border-zinc-200 bg-white px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-1 rounded-xl border-2 border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-11 w-11 items-center justify-center text-[#6b6560] hover:bg-zinc-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-lg font-bold text-[#2d2a26]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      className="flex h-11 w-11 items-center justify-center text-[#6b6560] hover:bg-zinc-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!valid}
                    className="menu-btn-orange rounded-xl px-6 py-3 font-bold uppercase tracking-wide disabled:opacity-50"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
