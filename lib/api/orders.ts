import { apiClient, getApiError } from "./client";
import type {
  Order,
  OrdersListResponse,
  OrderStatus,
  PaginationMeta,
} from "@/lib/types";

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
  params: OrdersQueryParams = {},
): Promise<OrdersListResponse> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") search.set(k, String(v));
  });
  const { data } = await apiClient.get<OrdersListResponse>(
    `/orders?${search.toString()}`,
  );
  return data;
}

export async function fetchOrder(orderId: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${orderId}`);
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  const { data } = await apiClient.patch<Order>(`/orders/${orderId}/status`, {
    status,
  });
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
    `/kitchen/orders?${search.toString()}`,
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
    `/cashier/orders?${search.toString()}`,
  );
  return data;
}

/** Response shape for GET /orders/updates (delta polling). */
export interface OrdersUpdatesResponse {
  items: Order[];
  server_time: string;
  count: number;
}

export interface TableSessionSummary {
  id: string;
  status: "active" | "closed";
  opened_at?: string;
  closed_at?: string | null;
  orders_count: number;
  open_orders_count: number;
  total_price: number;
  display_total_price?: number;
}

export interface TableSessionOrderSummary {
  id: string;
  order_number?: string;
  status: string;
  total_price: number;
  display_total_price?: number;
  created_at?: string;
}

export interface TableSessionOrdersResponse {
  session: TableSessionSummary;
  orders: TableSessionOrderSummary[];
}

export interface OpenTableSession extends TableSessionSummary {
  merchant_id?: string | number;
  branch_id?: string | number;
  table_id?: string | number;
  opened_by_type?: string | null;
  opened_by_id?: string | number | null;
  branch_name?: string | null;
  table_number?: string | number | null;
  orders?: TableSessionOrderSummary[];
}

export interface TableSessionsListResponse {
  data: OpenTableSession[];
  count?: number;
  pagination?: PaginationMeta;
}

export interface CloseTableSessionConflictError {
  error: string;
  open_orders_count: number;
  open_order_ids: Array<string | number>;
}

export interface CloseTableSessionResponse {
  session: TableSessionSummary;
  orders_count: number;
}

export async function fetchOrderUpdates(params: {
  after: string;
  branch_id?: string;
  limit?: number;
}): Promise<OrdersUpdatesResponse> {
  const search = new URLSearchParams();
  search.set("after", params.after);
  if (params.branch_id) search.set("branch_id", params.branch_id);
  if (params.limit != null) search.set("limit", String(params.limit));

  const { data } = await apiClient.get<OrdersUpdatesResponse>(
    `/orders/updates?${search.toString()}`,
  );
  return data;
}

/** Staff endpoint: GET /table-sessions/:sessionId/orders */
export async function fetchTableSessionOrders(
  sessionId: string,
): Promise<TableSessionOrdersResponse> {
  const { data } = await apiClient.get<TableSessionOrdersResponse>(
    `/table-sessions/${sessionId}/orders`,
  );
  return data;
}

/** Staff endpoint: GET /table-sessions */
export async function fetchTableSessions(params?: {
  branch_id?: string;
  table_id?: string;
  status?: string;
  opened_by_type?: string;
  include_orders?: boolean;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  sort_by?: "opened_at" | "closed_at" | "created_at";
  sort_dir?: "asc" | "desc";
}): Promise<TableSessionsListResponse> {
  const search = new URLSearchParams();
  if (params?.branch_id) search.set("branch_id", String(params.branch_id));
  if (params?.table_id) search.set("table_id", String(params.table_id));
  if (params?.status) search.set("status", params.status);
  if (params?.opened_by_type) {
    search.set("opened_by_type", String(params.opened_by_type));
  }
  if (params?.include_orders != null) {
    search.set("include_orders", String(Boolean(params.include_orders)));
  }
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.sort_by) search.set("sort_by", params.sort_by);
  if (params?.sort_dir) search.set("sort_dir", params.sort_dir);

  const suffix = search.toString() ? `?${search.toString()}` : "";
  const { data } = await apiClient.get<TableSessionsListResponse>(
    `/table-sessions${suffix}`,
  );
  return data;
}

/** Staff endpoint: PATCH /table-sessions/:sessionId/close */
export async function closeTableSession(
  sessionId: string,
): Promise<CloseTableSessionResponse> {
  const { data } = await apiClient.patch<CloseTableSessionResponse>(
    `/table-sessions/${sessionId}/close`,
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
  params: OrdersExportParams = {},
): Promise<void> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") search.set(k, String(v));
  });
  let response: Awaited<ReturnType<typeof apiClient.get<Blob>>>;
  try {
    response = await apiClient.get<Blob>(
      `/orders/export/excel?${search.toString()}`,
      { responseType: "blob" },
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
  const rawDisposition = headers["content-disposition"];
  const disposition =
    typeof rawDisposition === "string"
      ? rawDisposition
      : Array.isArray(rawDisposition)
        ? rawDisposition[0]
        : undefined;
  const match = disposition?.match(/filename="?([^";\n]+)"?/);
  const filename =
    match?.[1]?.trim() ||
    `orders_${new Date().toISOString().slice(0, 16).replace("T", "_")}.xlsx`;
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { getApiError };
