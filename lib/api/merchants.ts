import { apiClient, getApiError } from "./client";

export interface MerchantDto {
  id: string;
  name: string;
  logo?: string | null;
  hexa_color_1?: string | null;
  hexa_color_2?: string | null;
  status?: string;
  created_at?: string;
}

export async function fetchMerchants(): Promise<MerchantDto[]> {
  const { data } = await apiClient.get<MerchantDto[]>("/merchants");
  return data;
}

export async function createMerchant(body: {
  name: string;
  logo?: string | null;
  hexa_color_1?: string | null;
  hexa_color_2?: string | null;
}): Promise<MerchantDto> {
  const { data } = await apiClient.post<MerchantDto>("/merchants", body);
  return data;
}

export async function updateMerchant(
  merchantId: string,
  body: {
    name?: string;
    logo?: string | null;
    hexa_color_1?: string | null;
    hexa_color_2?: string | null;
    status?: string;
  }
): Promise<MerchantDto> {
  const { data } = await apiClient.patch<MerchantDto>(
    `/merchants/${merchantId}`,
    body
  );
  return data;
}

export { getApiError };
