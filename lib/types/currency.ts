export interface Currency {
  id: number;
  code: string;   // "EGP", "USD", "EUR"
  name: string;   // "Egyptian Pound"
  symbol: string; // "ج.م", "$", "€"
  is_active?: boolean;
}

export interface AvailableCurrency {
  id: number;           // merchant_currency.id (mcId used for edit/delete)
  currency_id: number;
  rate_from_base: number;
  is_default_display: boolean;
  is_active: boolean;
  currency: Currency;
}

export interface CurrencyInfo {
  base_currency: Currency | null;
  display_currency: Currency | null;
  display_rate: number;
  default_display_currency: Currency | null;
  available_currencies: AvailableCurrency[];
}

/** Admin: merchant currency setup response */
export interface MerchantCurrencySetup {
  base_currency: Currency | null;
  display_currencies: AvailableCurrency[];
}
