import type { Order } from "@/lib/types";

/** Get the best available timestamp for ordering & cursors. */
export function getOrderTimestamp(order: Order): string {
  return order.updated_at || order.created_at;
}

/**
 * Merge existing + incoming orders by id, without duplicates, and keep
 * a stable, sensible ordering (newest first by updated_at/created_at).
 */
export function mergeOrdersById(
  existing: Order[],
  incoming: Order[]
): Order[] {
  if (!incoming.length && !existing.length) return existing;

  const map = new Map<string | number, Order>();
  for (const o of existing) {
    map.set(o.id, o);
  }
  for (const o of incoming) {
    map.set(o.id, o);
  }

  const merged = Array.from(map.values());
  merged.sort((a, b) => {
    const aTime = new Date(getOrderTimestamp(a)).getTime();
    const bTime = new Date(getOrderTimestamp(b)).getTime();
    return bTime - aTime; // newest first
  });

  return merged;
}

