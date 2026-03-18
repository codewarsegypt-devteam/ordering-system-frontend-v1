import { apiClient, getApiError } from "./client";

export type TableServiceStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface TableServiceRow {
  id: string;
  merchant_id: string;
  branch_id: string | null;
  table_id: string;
  type: string;
  status: TableServiceStatus;
  created_at: string;
  updated_at?: string;
  /** رقم الطاولة من الباكند (enriched من جدول table) */
  table_number?: string | number | null;
  table?: { id: string; number: string | number };
}

export interface TableServicesListResponse {
  data: TableServiceRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface TableServicesListParams {
  branch_id?: string;
  table_id?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface TableServicesPollParams {
  after: string; // ISO timestamp
  branch_id?: string;
  limit?: number;
}

export interface TableServicesPollResponse {
  items: TableServiceRow[];
  server_time: string;
  count: number;
}

/**
 * قائمة طلبات الخدمة (للستاف) مع فلترة.
 * GET /table-services?branch_id=&status=&from=&to=&table_id=&page=&limit=
 */
export async function listTableServices(
  params: TableServicesListParams = {},
): Promise<TableServicesListResponse> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") search.set(k, String(v));
  });
  const { data } = await apiClient.get<TableServicesListResponse>(
    `/table-services?${search.toString()}`
  );
  return data;
}

/**
 * Delta polling endpoint. Returns only rows where updated_at > after.
 * GET /table-services/updates?after=<ISO>&branch_id=<optional>&limit=<optional>
 */
export async function pollTableServiceUpdates(
  params: TableServicesPollParams,
): Promise<TableServicesPollResponse> {
  const search = new URLSearchParams();
  search.set("after", params.after);
  if (params.branch_id) search.set("branch_id", params.branch_id);
  if (params.limit != null) search.set("limit", String(params.limit));

  const { data } = await apiClient.get<TableServicesPollResponse>(
    `/table-services/updates?${search.toString()}`
  );
  return data;
}

/**
 * تغيير حالة الطلب — للستاف فقط.
 * PATCH /table-services/:id/status
 * Body: { status: "pending" | "in_progress" | "completed" | "cancelled" }
 */
export async function updateTableServiceStatus(
  id: string,
  status: TableServiceStatus,
): Promise<TableServiceRow> {
  const { data } = await apiClient.patch<TableServiceRow>(
    `/table-services/${id}/status`,
    { status },
  );
  return data;
}

export { getApiError };
