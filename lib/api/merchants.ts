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
  },
): Promise<MerchantDto> {
  const { data } = await apiClient.patch<MerchantDto>(
    `/merchants/${merchantId}`,
    body,
  );
  return data;
}

const LOGO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const LOGO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Upload merchant logo (multipart/form-data, field "logo").
 * Allowed: JPEG, PNG, WebP, GIF — max 5 MB.
 */
export async function uploadMerchantLogo(
  merchantId: string,
  file: File,
): Promise<MerchantDto> {
  if (file.size > LOGO_MAX_BYTES) {
    throw new Error("Logo must be 5 MB or smaller.");
  }
  const form = new FormData();
  form.append("logo", file);
  const { data } = await apiClient.post<MerchantDto>(
    `/merchants/${merchantId}/logo`,
    form,
  );
  return data;
}

export { getApiError };
