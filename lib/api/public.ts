import { apiClient, getApiError } from "./client";
import type {
  PublicMenuResponse,
  ValidateCartRequest,
  CreateOrderRequest,
  CreateOrderResponse,
} from "@/lib/types";

/**
 * First step after scanning QR. Returns merchant, branch, table info and list of menus (no categories/items).
 * GET /public/scan?t=TOKEN
 */
export interface PublicScanResponse {
  merchant_id: string | number;
  merchant_name: string | null;
  merchant_logo: string | null;
  branch_id: string | number;
  branch_name: string | null;
  table_id: string | number;
  table_name: string | null;
  /** Optional: needed for create order when using token flow. */
  table_code?: string | null;
  menus: Array<{
    id: number | string;
    name_ar?: string | null;
    name_en?: string | null;
    currancy?: string;
    is_active?: boolean;
    created_at?: string;
  }>;
}

export async function fetchPublicScan(token: string): Promise<PublicScanResponse> {
  const { data } = await apiClient.get<PublicScanResponse>("/public/scan", {
    params: { t: token },
  });
  return data;
}

/**
 * Fetch public menu (legacy: merchantId + tableCode, or single menu by token).
 * - Merchant: GET /public/menu?merchantId=...&tableCode=...
 * - Token + menuId: use fetchPublicMenuById instead (GET /public/menu/:menuId?t=TOKEN).
 */
export async function fetchPublicMenu(
  merchantId?: string,
  tableCode?: string,
  _token?: string,
  _menuId?: string | number
): Promise<PublicMenuResponse> {
  const params: Record<string, string> = {};
  if (merchantId) params.merchantId = merchantId;
  if (tableCode) params.tableCode = tableCode;
  const { data } = await apiClient.get<PublicMenuResponse>(
    `/public/menu`,
    { params }
  );
  return data;
}

/**
 * Get a single menu by id with full details (token required).
 * GET /public/menu/:menuId?t=TOKEN
 * Backend returns { menu, categories }. Use with scan data to build full PublicMenuResponse (merchant_id, branch_id, table_id).
 */
export interface PublicMenuByIdResponse {
  menu: PublicMenuResponse["menu"];
  categories: PublicMenuResponse["categories"];
  merchant_id?: string | null;
  branch_id?: string | null;
  table_id?: string | null;
  table_code?: string | null;
}

export async function fetchPublicMenuById(
  menuId: string | number,
  token: string
): Promise<PublicMenuByIdResponse> {
  const { data } = await apiClient.get<PublicMenuByIdResponse>(
    `/public/menu/${menuId}`,
    { params: { t: token } }
  );
  return data;
} 

export interface ValidateCartResult {
  is_valid: boolean;
  errors: string[];
  totals: { subtotal: number; total: number };
  line_items: Array<{
    item_id: string;
    variant_id: string | null;
    unit_price: number;
    qty: number;
    line_total: number;
  }>;
}

export async function validateCart(
  body: ValidateCartRequest,
): Promise<ValidateCartResult> {
  const { data } = await apiClient.post<ValidateCartResult>(
    "/public/cart/validate",
    body,
  );
  return data;
}

export async function createOrder(
  body: CreateOrderRequest,
): Promise<CreateOrderResponse> {
  const { data } = await apiClient.post<CreateOrderResponse>("/orders", body);
  return data;
}

/** Public endpoint: get stored table QR by table id (no auth). */
export interface PublicTableQrcodeResponse {
  id: string;
  table_id: string;
  qr_svg: string;
  qr_url?: string;
}

export async function fetchPublicTableQrcode(
  tableId: string
): Promise<PublicTableQrcodeResponse> {
  const { data } = await apiClient.get<PublicTableQrcodeResponse>(
    `/public/table/${tableId}/qrcode`
  );
  return data;
}

export { getApiError };
