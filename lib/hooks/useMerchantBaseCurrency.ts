"use client";

import { useQuery } from "@tanstack/react-query";
import { getMerchantCurrencies } from "@/lib/api/currencies";
import type { Currency } from "@/lib/types/currency";

const MERCHANT_CURRENCIES_KEY = ["merchantCurrencies"] as const;

/**
 * Fetches merchant currency setup. Use across the dashboard to display
 * amounts in the merchant's base currency. When base currency is changed
 * in /dashboard/currencies, invalidate this query so all dashboard views update.
 */
export function useMerchantBaseCurrency() {
  const { data, isLoading } = useQuery({
    queryKey: MERCHANT_CURRENCIES_KEY,
    queryFn: getMerchantCurrencies,
  });

  const baseCurrency = data?.base_currency ?? null;

  const formatPrice = (amount: number | undefined | null): string => {
    const n = Number(amount ?? 0);
    if (!baseCurrency) return `${n.toFixed(2)}`;
    return `${baseCurrency.symbol} ${n.toFixed(2)}`;
  };

  const currencyCode = baseCurrency?.code ?? "EGP";
  const currencySymbol = baseCurrency?.symbol ?? "EGP";

  return {
    baseCurrency,
    formatPrice,
    currencyCode,
    currencySymbol,
    isLoading,
    queryKey: MERCHANT_CURRENCIES_KEY,
  };
}
