import { apiClient } from "./client";
import type { Currency, AvailableCurrency, MerchantCurrencySetup } from "@/lib/types/currency";

/** GET /currencies — all globally active currencies */
export async function listAllCurrencies(): Promise<Currency[]> {
  const { data } = await apiClient.get<Currency[]>("/currencies");
  return data;
}

/** GET /currencies/merchant — merchant's base + display currencies */
export async function getMerchantCurrencies(): Promise<MerchantCurrencySetup> {
  const { data } = await apiClient.get<MerchantCurrencySetup>(
    "/currencies/merchant"
  );
  return data;
}

/** PATCH /currencies/merchant/base */
export async function setBaseCurrency(currencyId: number): Promise<void> {
  await apiClient.patch("/currencies/merchant/base", {
    currency_id: currencyId,
  });
}

export interface AddDisplayCurrencyBody {
  currency_id: number;
  rate_from_base: number;
  is_default_display?: boolean;
}

/** POST /currencies/merchant/display */
export async function addDisplayCurrency(
  body: AddDisplayCurrencyBody
): Promise<AvailableCurrency> {
  const { data } = await apiClient.post<AvailableCurrency>(
    "/currencies/merchant/display",
    body
  );
  return data;
}

export interface UpdateDisplayCurrencyBody {
  rate_from_base?: number;
  is_active?: boolean;
  is_default_display?: boolean;
}

/** PATCH /currencies/merchant/display/:mcId */
export async function updateDisplayCurrency(
  mcId: number,
  body: UpdateDisplayCurrencyBody
): Promise<AvailableCurrency> {
  const { data } = await apiClient.patch<AvailableCurrency>(
    `/currencies/merchant/display/${mcId}`,
    body
  );
  return data;
}

/** DELETE /currencies/merchant/display/:mcId */
export async function deleteDisplayCurrency(mcId: number): Promise<void> {
  await apiClient.delete(`/currencies/merchant/display/${mcId}`);
}
