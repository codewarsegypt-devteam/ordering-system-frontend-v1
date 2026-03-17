"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { Currency, AvailableCurrency, CurrencyInfo } from "@/lib/types/currency";
import { CURRENCY_SESSION_KEY } from "@/lib/utils/currency.utils";

interface CurrencyState {
  baseCurrency: Currency | null;
  selectedCurrency: Currency | null;
  selectedRate: number;
  availableCurrencies: AvailableCurrency[];
}

interface CurrencyContextValue extends CurrencyState {
  initFromCurrencyInfo: (info: CurrencyInfo) => void;
  setSelectedCurrency: (entry: AvailableCurrency) => void;
}

const defaultState: CurrencyState = {
  baseCurrency: null,
  selectedCurrency: null,
  selectedRate: 1,
  availableCurrencies: [],
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CurrencyState>(defaultState);

  /** Called once after a successful QR scan. */
  const initFromCurrencyInfo = useCallback((info: CurrencyInfo) => {
    const available = info.available_currencies ?? [];

    // Restore persisted selection from sessionStorage
    let selected: AvailableCurrency | undefined;
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(CURRENCY_SESSION_KEY);
      if (saved) {
        selected = available.find((c) => c.currency_id === Number(saved));
      }
    }

    // Fall back to default display currency from the scan response
    if (!selected && info.default_display_currency) {
      selected = available.find(
        (c) => c.currency_id === info.default_display_currency!.id
      );
    }

    setState({
      baseCurrency: info.base_currency,
      selectedCurrency: selected?.currency ?? info.display_currency,
      selectedRate: selected?.rate_from_base ?? info.display_rate,
      availableCurrencies: available,
    });
  }, []);

  const setSelectedCurrency = useCallback((entry: AvailableCurrency) => {
    setState((prev) => ({
      ...prev,
      selectedCurrency: entry.currency,
      selectedRate: entry.rate_from_base,
    }));
    if (typeof window !== "undefined") {
      sessionStorage.setItem(CURRENCY_SESSION_KEY, String(entry.currency_id));
    }
  }, []);

  return (
    <CurrencyContext.Provider
      value={{ ...state, initFromCurrencyInfo, setSelectedCurrency }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
