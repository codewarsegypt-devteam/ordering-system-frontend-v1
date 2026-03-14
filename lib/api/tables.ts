import { apiClient, getApiError } from "./client";
import type { TableDto } from "./branches";

export async function updateTable(
  tableId: string,
  body: {
    number?: string | number;
    seats?: number;
    is_active?: boolean;
    qr_code?: string | null;
  }
): Promise<TableDto> {
  const { data } = await apiClient.patch<TableDto>(
    `/tables/${tableId}`,
    body
  );
  return data;
}

export async function deleteTable(tableId: string): Promise<void> {
  await apiClient.delete(`/tables/${tableId}`);
}

export interface TableQrResponse {
  qr_url: string;
  qr_svg?: string;
  table_code: string;
  branch_id: string;
}

export async function fetchTableQr(tableId: string): Promise<TableQrResponse> {
  const { data } = await apiClient.get<TableQrResponse>(
    `/tables/${tableId}/qr`
  );
  return data;
}

/** Stored QR preview for a table (from tables_qrcode). Use when QR was already generated. */
export interface TableQrcodePreview {
  id: string;
  table_id: string;
  qr_svg: string;
}

export async function fetchTableQrcodePreview(
  tableId: string
): Promise<TableQrcodePreview> {
  const { data } = await apiClient.get<TableQrcodePreview>(
    `/tables/${tableId}/qrcode`
  );
  return data;
}

export { getApiError };
