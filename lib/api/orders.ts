import { apiClient, getApiError } from "./client";
import type { Order, OrdersListResponse, OrderStatus } from "@/lib/types";

export interface OrdersQueryParams {
  branch_id?: string;
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
  cursor?: string;
  table_id?: string;
  table_number?: string;
  min_total?: number | string;
  max_total?: number | string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

export async function fetchOrders(
  params: OrdersQueryParams = {}
): Promise<OrdersListResponse> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") search.set(k, String(v));
  });
  const { data } = await apiClient.get<OrdersListResponse>(
    `/orders?${search.toString()}`
  );
  return data;
}

export async function fetchOrder(orderId: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${orderId}`);
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const { data } = await apiClient.patch<Order>(
    `/orders/${orderId}/status`,
    { status }
  );
  return data;
}

export async function fetchKitchenOrders(params?: {
  branch_id?: string;
  status?: string;
}): Promise<OrdersListResponse> {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== "") search.set(k, String(v));
    });
  }
  const { data } = await apiClient.get<OrdersListResponse>(
    `/kitchen/orders?${search.toString()}`
  );
  return data;
}

export async function fetchCashierOrders(params?: {
  branch_id?: string;
  status?: string;
}): Promise<OrdersListResponse> {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== "") search.set(k, String(v));
    });
  }
  const { data } = await apiClient.get<OrdersListResponse>(
    `/cashier/orders?${search.toString()}`
  );
  return data;
}

/** Params for export (no page/limit/cursor). */
export type OrdersExportParams = Omit<
  OrdersQueryParams,
  "page" | "limit" | "cursor"
>;

/**
 * Download orders as Excel. Uses current filters (branch, status, dates, etc.).
 * Triggers a file download in the browser.
 */
export async function exportOrdersExcel(
  params: OrdersExportParams = {}
): Promise<void> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") search.set(k, String(v));
  });
  let response: { data: Blob; headers: Record<string, string> };
  try {
    response = await apiClient.get<Blob>(
      `/orders/export/excel?${search.toString()}`,
      { responseType: "blob" }
    );
  } catch (err: unknown) {
    if (err && typeof err === "object" && "response" in err) {
      const ax = err as { response?: { data?: Blob } };
      const data = ax.response?.data;
      if (data instanceof Blob) {
        const text = await data.text();
        let msg = "Export failed.";
        try {
          const json = JSON.parse(text) as { error?: string };
          if (json?.error) msg = json.error;
        } catch {
          if (text) msg = text.slice(0, 200);
        }
        throw new Error(msg);
      }
    }
    throw err;
  }
  const { data, headers } = response;
  const disposition = headers["content-disposition"];
  const match = disposition?.match(/filename="?([^";\n]+)"?/);
  const filename =
    match?.[1]?.trim() || `orders_${new Date().toISOString().slice(0, 16).replace("T", "_")}.xlsx`;
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { getApiError };
