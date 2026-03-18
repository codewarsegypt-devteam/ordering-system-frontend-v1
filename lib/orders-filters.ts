import type { OrderStatus } from "@/lib/types";

export type OrdersFilterState = {
  q: string;
  branch_id: string;
  table_id: string;
  table_number: string;
  from: string;
  to: string;
  min_total: string;
  max_total: string;
  status: OrderStatus[];
  sort_by: string;
  sort_dir: "asc" | "desc";
  page: number;
  limit: number;
};

export function getDefaultOrdersFilters(): OrdersFilterState {
  return {
    q: "",
    branch_id: "",
    table_id: "",
    table_number: "",
    from: "",
    to: "",
    min_total: "",
    max_total: "",
    status: [],
    sort_by: "created_at",
    sort_dir: "desc",
    page: 1,
    limit: 20,
  };
}
