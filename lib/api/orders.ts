import { apiClient, getApiError } from "./client";
import type { Order, OrdersListResponse, OrderStatus } from "@/lib/types";

export interface OrdersQueryParams {
  branch_id?: string;
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  limit?: number;
  cursor?: string;
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

export { getApiError };
