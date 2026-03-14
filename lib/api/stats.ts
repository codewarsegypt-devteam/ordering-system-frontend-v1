import { apiClient } from "./client";

export interface StatsFilters {
  branch_id?: string;
  from?: string;
  to?: string;
  top_limit?: number;
}

interface StatsBaseResponse {
  filters: {
    from: string | null;
    to: string | null;
    branch_id: string | null;
  };
}

export interface StatsSummaryMetrics {
  total_sales: number;
  orders_count: number;
  completed_orders_count: number;
  cancelled_orders_count: number;
  average_order_value: number;
  completed_rate: number;
  cancelled_rate: number;
}

export interface SalesTimelinePoint {
  date?: string;
  week_start?: string;
  month?: string;
  total_sales: number;
  orders_count: number;
  completed_orders_count: number;
  cancelled_orders_count: number;
}

export interface SalesStatsResponse extends StatsBaseResponse {
  summary: StatsSummaryMetrics;
  sales_by_day: SalesTimelinePoint[];
  sales_by_week: SalesTimelinePoint[];
  sales_by_month: SalesTimelinePoint[];
}

export interface BranchStatsEntry extends StatsSummaryMetrics {
  branch_id: string | number;
  branch_name: string;
}

export interface BranchesStatsResponse extends StatsBaseResponse {
  summary: {
    branches_count: number;
    best_branch_by_sales: BranchStatsEntry | null;
    best_branch_by_orders: BranchStatsEntry | null;
  };
  branches: BranchStatsEntry[];
}

export interface TableStatsEntry extends StatsSummaryMetrics {
  table_id: string | number;
  table_number: string | null;
  branch_id: string | number;
  branch_name: string | null;
  is_active: boolean;
  seats: number | null;
}

export interface TablesStatsResponse extends StatsBaseResponse {
  summary: {
    tables_count: number;
    linked_orders_count: number;
    unlinked_orders_count: number;
    linked_orders_rate: number;
    most_used_table: TableStatsEntry | null;
    top_sales_table: TableStatsEntry | null;
  };
  tables: TableStatsEntry[];
}

export interface MenuStatsItem {
  item_id?: string | number | null;
  item_name_ar?: string | null;
  item_name_en?: string | null;
  category_id?: string | number | null;
  category_name_ar?: string | null;
  category_name_en?: string | null;
  quantity_sold: number;
  revenue: number;
  orders_count?: number;
}

export interface MenuStatsVariant {
  variant_id: string | number;
  item_id: string | number;
  variant_name_ar?: string | null;
  variant_name_en?: string | null;
  quantity_sold: number;
  revenue: number;
}

export interface MenuStatsModifier {
  modifier_id: string | number;
  modifier_name_ar?: string | null;
  modifier_name_en?: string | null;
  usage_count: number;
  revenue: number;
}

export interface MenuStatsResponse extends StatsBaseResponse {
  summary: {
    completed_orders_count: number;
    sold_items_count: number;
  };
  top_selling_items: MenuStatsItem[];
  top_revenue_items: MenuStatsItem[];
  low_selling_items: MenuStatsItem[];
  top_categories: MenuStatsItem[];
  top_variants: MenuStatsVariant[];
  top_modifiers: MenuStatsModifier[];
}

export interface OperationsBranchEntry {
  branch_id: string | number;
  branch_name: string;
  tables_count: number;
  active_tables_count: number;
  inactive_tables_count: number;
  total_seats: number;
  orders_count_in_period: number;
  average_orders_per_table: number;
}

export interface OperationsStatsResponse extends StatsBaseResponse {
  summary: {
    branches_count: number;
    tables_count: number;
    active_tables_count: number;
    inactive_tables_count: number;
    total_seats: number;
    orders_count_in_period: number;
  };
  branches: OperationsBranchEntry[];
}

function buildSearch(filters: StatsFilters = {}): string {
  const search = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value != null && value !== "") search.set(key, String(value));
  });
  return search.toString();
}

export async function fetchSalesStats(filters: StatsFilters = {}): Promise<SalesStatsResponse> {
  const { data } = await apiClient.get<SalesStatsResponse>(`/stats/sales?${buildSearch(filters)}`);
  return data;
}

export async function fetchBranchesStats(filters: StatsFilters = {}): Promise<BranchesStatsResponse> {
  const { data } = await apiClient.get<BranchesStatsResponse>(`/stats/branches?${buildSearch(filters)}`);
  return data;
}

export async function fetchTablesStats(filters: StatsFilters = {}): Promise<TablesStatsResponse> {
  const { data } = await apiClient.get<TablesStatsResponse>(`/stats/tables?${buildSearch(filters)}`);
  return data;
}

export async function fetchMenuStats(filters: StatsFilters = {}): Promise<MenuStatsResponse> {
  const { data } = await apiClient.get<MenuStatsResponse>(`/stats/menu?${buildSearch(filters)}`);
  return data;
}

export async function fetchOperationsStats(filters: StatsFilters = {}): Promise<OperationsStatsResponse> {
  const { data } = await apiClient.get<OperationsStatsResponse>(`/stats/operations?${buildSearch(filters)}`);
  return data;
}
