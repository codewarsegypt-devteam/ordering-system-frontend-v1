import { apiClient, getApiError } from "./client";
import type { Order, OrderItem, OrderItemModifier } from "@/lib/types";

export interface WaiterReadyOrdersResponse {
  data: Order[];
  next_cursor: string | null;
}

/** Raw row from `order_items` + joined `order_item_modifier` rows. */
export interface WaiterOrderItemApiRow {
  id: string;
  order_id?: string;
  item_id?: string;
  variant_id?: string | null;
  quantity: number;
  name_snapshot?: string | null;
  price_snapshot?: number;
  total_price?: number;
  modifiers?: Array<Record<string, unknown>>;
}

export interface WaiterOrderItemsResponse {
  order_id: string;
  items: WaiterOrderItemApiRow[];
}

/** GET /waiter/orders/:orderId/items — line items + modifiers for one order. */
export async function fetchWaiterOrderItems(
  orderId: string,
): Promise<WaiterOrderItemsResponse> {
  const { data } = await apiClient.get<WaiterOrderItemsResponse>(
    `/waiter/orders/${encodeURIComponent(orderId)}/items`,
  );
  return data;
}

/** Map API rows to dashboard `OrderItem` shape for UI reuse. */
export function mapWaiterItemsToOrderItems(
  rows: WaiterOrderItemApiRow[],
): OrderItem[] {
  return rows.map((row) => {
    const modsRaw = row.modifiers ?? [];
    const modifiers: OrderItemModifier[] = modsRaw.map((m) => ({
      id: String((m as { id?: string }).id ?? ""),
      modifier_id: String(
        (m as { modifier_id?: string }).modifier_id ?? "",
      ),
      name_snapshot: String(
        (m as { name_snapshot?: string }).name_snapshot ?? "",
      ),
      price_snapshot: Number(
        (m as { price_snapshot?: number }).price_snapshot ?? 0,
      ),
      price: Number((m as { price_snapshot?: number }).price_snapshot ?? 0),
    }));
    return {
      id: String(row.id),
      order_id: String(row.order_id ?? ""),
      item_id: String(row.item_id ?? ""),
      variant_id:
        row.variant_id != null && row.variant_id !== ""
          ? String(row.variant_id)
          : null,
      quantity: Number(row.quantity),
      name_snapshot: String(row.name_snapshot ?? "Item"),
      price_snapshot: Number(row.price_snapshot ?? 0),
      total_price: Number(row.total_price ?? 0),
      modifiers: modifiers.length ? modifiers : undefined,
    };
  });
}

/** GET /waiter/orders/ready — orders with status `ready` for the waiter’s branch. */
export async function fetchWaiterReadyOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<WaiterReadyOrdersResponse>(
    "/waiter/orders/ready",
  );
  return data?.data ?? [];
}

/** PATCH /waiter/orders/:orderId/complete — ready → completed. */
export async function completeWaiterOrder(orderId: string): Promise<Order> {
  const { data } = await apiClient.patch<Order>(
    `/waiter/orders/${encodeURIComponent(orderId)}/complete`,
  );
  return data;
}

export { getApiError };
