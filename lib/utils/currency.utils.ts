import type { Currency, AvailableCurrency } from "@/lib/types/currency";
import type { PublicMenuCategory } from "@/lib/types";

/**
 * Format a price with currency symbol. Always 2 decimal places.
 */
export function formatPrice(amount: number, currency: Currency | null): string {
  if (!currency) return amount.toFixed(2);
  return `${currency.symbol} ${amount.toFixed(2)}`;
}

/**
 * Convert a base price to display price client-side.
 * Use for real-time currency switching without re-fetching the menu.
 */
export function convertToDisplay(basePrice: number, rate: number): number {
  const safeRate = rate > 0 ? rate : 1;
  return Math.round((basePrice * safeRate + Number.EPSILON) * 100) / 100;
}

/**
 * Get the rate for a given currency_id from the available currencies list.
 * Returns 1 if not found (safe fallback).
 */
export function getRateForCurrency(
  currencyId: number,
  availableCurrencies: AvailableCurrency[]
): number {
  return (
    availableCurrencies.find((c) => c.currency_id === currencyId)
      ?.rate_from_base ?? 1
  );
}

/**
 * Recompute all display prices in a menu categories structure when the
 * customer switches currency without re-fetching from the server.
 */
export function recomputeMenuPrices(
  categories: PublicMenuCategory[],
  newRate: number
): PublicMenuCategory[] {
  return categories.map((cat) => ({
    ...cat,
    items: cat.items.map((item) => ({
      ...item,
      display_price: convertToDisplay(item.base_price, newRate),
      variants: (item.variants ?? []).map((v) => ({
        ...v,
        display_price: convertToDisplay(v.price, newRate),
      })),
      modifier_groups: (item.modifier_groups ?? []).map((mg) => ({
        ...mg,
        modifiers: mg.modifiers.map((m) => ({
          ...m,
          display_price: convertToDisplay(m.price, newRate),
        })),
      })),
    })),
  }));
}

/** Session storage key for persisting the selected currency. */
export const CURRENCY_SESSION_KEY = "selected_currency_id";
