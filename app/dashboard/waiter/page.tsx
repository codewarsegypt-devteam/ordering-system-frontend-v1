"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import {
  fetchWaiterReadyOrders,
  fetchWaiterOrderItems,
  mapWaiterItemsToOrderItems,
  completeWaiterOrder,
  getApiError,
} from "@/lib/api";
import type { Order, OrderItem } from "@/lib/types";
import {
  Loader2,
  RefreshCw,
  UtensilsCrossed,
  CheckCircle2,
  ShieldAlert,
  ChevronLeft,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

function formatOrderTotal(amount: number | undefined | null): string {
  const n = Number(amount ?? 0);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function tableLabel(order: Order): string {
  if (order.table_number != null && String(order.table_number).trim() !== "") {
    return String(order.table_number);
  }
  if (order.table?.number != null) return String(order.table.number);
  if (order.table_id != null) return `#${order.table_id}`;
  return "—";
}

function LineRow({ line }: { line: OrderItem }) {
  const mods = line.modifiers?.length
    ? line.modifiers.map((m) => m.name_snapshot).filter(Boolean).join(", ")
    : null;
  return (
    <li className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-slate-900">
          {line.quantity}× {line.name_snapshot}
        </span>
      </div>
      {mods ? (
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">+ {mods}</p>
      ) : null}
    </li>
  );
}

export default function WaiterReadyOrdersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["waiter", "orders", "ready"],
    queryFn: fetchWaiterReadyOrders,
    enabled: user?.role === "waiter",
    refetchInterval: 25_000,
    retry: 1,
  });

  const itemsQuery = useQuery({
    queryKey: ["waiter", "order", selectedOrderId, "items"],
    queryFn: async () => {
      const res = await fetchWaiterOrderItems(selectedOrderId!);
      return mapWaiterItemsToOrderItems(res.items);
    },
    enabled: !!selectedOrderId && user?.role === "waiter",
    retry: 1,
  });

  const orders = ordersQuery.data ?? [];
  const selectedOrder =
    selectedOrderId != null
      ? orders.find((o) => String(o.id) === selectedOrderId)
      : undefined;

  useEffect(() => {
    if (
      selectedOrderId &&
      !orders.some((o) => String(o.id) === selectedOrderId)
    ) {
      setSelectedOrderId(null);
    }
  }, [orders, selectedOrderId]);

  const [completingId, setCompletingId] = useState<string | null>(null);

  const completeMut = useMutation({
    mutationFn: completeWaiterOrder,
    onSuccess: (_, orderId) => {
      qc.invalidateQueries({ queryKey: ["waiter", "orders", "ready"] });
      qc.removeQueries({ queryKey: ["waiter", "order", orderId, "items"] });
      setSelectedOrderId(null);
      toast.success("Order marked completed.");
    },
    onError: (e) => toast.error(getApiError(e)),
    onSettled: () => setCompletingId(null),
  });

  if (user?.role !== "waiter") {
    return (
      <div className="alert-warning flex items-start gap-3 rounded-xl p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Waiter access only</p>
          <p className="mt-1 text-sm text-slate-600">
            This page is for staff with the waiter role.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh]">
      <header className="mb-4 flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Ready orders
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Tap an order to see items. Mark complete when served.
          </p>
        </div>
        <button
          type="button"
          onClick={() => ordersQuery.refetch()}
          disabled={ordersQuery.isFetching}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm active:scale-[0.99] sm:h-10"
        >
          {ordersQuery.isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </button>
      </header>

      {ordersQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Loader2
            className="h-10 w-10 animate-spin"
            style={{ color: "var(--system-primary)" }}
          />
          <p className="text-sm text-slate-500">Loading orders…</p>
        </div>
      ) : ordersQuery.error ? (
        <div className="alert-error rounded-xl">
          {getApiError(ordersQuery.error)}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <UtensilsCrossed className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 font-semibold text-slate-700">No ready orders</p>
          <p className="mt-1 text-sm text-slate-500">
            When kitchen marks an order ready, it will show up here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {orders.map((order) => (
            <li key={String(order.id)}>
              <button
                type="button"
                onClick={() => setSelectedOrderId(String(order.id))}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors active:bg-slate-50"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold text-white shadow-inner"
                  style={{ backgroundColor: "var(--system-primary)" }}
                >
                  #{order.order_number}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    Table {tableLabel(order)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatOrderTotal(order.total_price)} · Tap for items
                  </p>
                </div>
                <ChevronLeft className="h-5 w-5 shrink-0 rotate-180 text-slate-400" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Slide-over from the right: order line items */}
      {selectedOrderId && selectedOrder && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={() => setSelectedOrderId(null)}
          />
          <div
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div
              className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3"
              style={{
                borderColor: "var(--system-sage)",
                backgroundColor: "var(--system-cream)",
              }}
            >
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Order
                </p>
                <p className="truncate font-mono text-lg font-bold text-slate-900">
                  #{selectedOrder.order_number}
                </p>
                <p className="mt-0.5 text-sm text-slate-600">
                  Table {tableLabel(selectedOrder)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {itemsQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16">
                  <Loader2
                    className="h-8 w-8 animate-spin"
                    style={{ color: "var(--system-primary)" }}
                  />
                  <p className="text-sm text-slate-500">Loading items…</p>
                </div>
              ) : itemsQuery.error ? (
                <div className="alert-error text-sm">
                  {getApiError(itemsQuery.error)}
                </div>
              ) : (
                <ul className="space-y-2">
                  {(itemsQuery.data ?? []).map((line) => (
                    <LineRow key={String(line.id)} line={line} />
                  ))}
                  {(itemsQuery.data?.length ?? 0) === 0 && (
                    <li className="py-8 text-center text-sm text-slate-400">
                      No items in this order.
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div
              className="shrink-0 border-t border-slate-100 p-4"
              style={{
                paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              }}
            >
              <p className="mb-2 text-center text-sm font-semibold text-slate-700">
                Total {formatOrderTotal(selectedOrder.total_price)}
              </p>
              <button
                type="button"
                disabled={completingId !== null}
                onClick={() => {
                  const id = String(selectedOrder.id);
                  setCompletingId(id);
                  completeMut.mutate(id);
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-base font-bold text-white shadow-md transition-colors hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60"
              >
                {completingId === String(selectedOrder.id) ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                Mark completed
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
