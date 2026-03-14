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
  page?: number;
  limit?: number;
}

/**
 * قائمة طلبات الخدمة (للستاف) مع فلترة.
 * GET /table-services?branch_id=&status=pending&page=&limit=
 */
export async function listTableServices(
  params: TableServicesListParams = {},
): Promise<TableServicesListResponse> {
  const { data } = await apiClient.get<TableServicesListResponse>(
    "/table-services",
    { params },
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
