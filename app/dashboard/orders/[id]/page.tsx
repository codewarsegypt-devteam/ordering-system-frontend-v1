"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchOrder, updateOrderStatus, getApiError } from "@/lib/api";
import type { OrderStatus } from "@/lib/types";
import { ArrowLeft, Loader2, Check, ChefHat } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const statusLabels: Record<OrderStatus, string> = {
  draft: "Draft",
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: !!orderId,
  });

  const updateStatus = useMutation({
    mutationFn: ({ status }: { status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  if (isLoading || !order) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {getApiError(error)}
      </div>
    );
  }

  const canUpdate =
    order.status !== "completed" && order.status !== "cancelled";

  return (
    <div>
      <Link
        href="/dashboard/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800 sm:text-2xl">
            Order #{order.order_number}
          </h1>
          <p className="text-zinc-500">
            {new Date(order.created_at).toLocaleString()} ·{" "}
            <span
              className={`font-medium ${
                order.status === "completed"
                  ? "text-green-600"
                  : order.status === "cancelled"
                    ? "text-red-600"
                    : "text-teal-600"
              }`}
            >
              {statusLabels[order.status]}
            </span>
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xl font-semibold text-zinc-800 sm:text-2xl">
            {order.total_price.toFixed(2)} EGP
          </p>
          {order.customer_name && (
            <p className="text-sm text-zinc-600">{order.customer_name}</p>
          )}
          {order.customer_phone && (
            <p className="text-sm text-zinc-600">{order.customer_phone}</p>
          )}
        </div>
      </div>

      {order.notes && (
        <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Note: {order.notes}
        </div>
      )}

      <div className="mb-6 rounded-xl border border-zinc-200 bg-white">
        <h2 className="border-b border-zinc-200 px-4 py-3 font-medium text-zinc-800">
          Items
        </h2>
        <ul className="divide-y divide-zinc-100">
          {(order.items ?? []).map((item) => (
            <li key={item.id} className="flex justify-between px-4 py-3">
              <div>
                <p className="font-medium text-zinc-800">
                  {item.name_snapshot} × {item.quantity}
                </p>
                {item.modifiers && item.modifiers.length > 0 && (
                  <ul className="mt-1 text-sm text-zinc-500">
                    {item.modifiers.map((m) => (
                      <li key={m.id}>
                        + {m.name_snapshot} ({m.price.toFixed(2)} EGP)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <span className="font-medium text-zinc-800">
                {item.total_price.toFixed(2)} EGP
              </span>
            </li>
          ))}
        </ul>
      </div>

      {canUpdate && (
        <div className="flex flex-wrap gap-2">
          {order.status === "placed" && (
            <button
              type="button"
              onClick={() => updateStatus.mutate({ status: "accepted" })}
              disabled={updateStatus.isPending}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {updateStatus.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Accept
            </button>
          )}
          {order.status === "accepted" && (
            <button
              type="button"
              onClick={() => updateStatus.mutate({ status: "preparing" })}
              disabled={updateStatus.isPending}
              className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              <ChefHat className="h-4 w-4" />
              Start preparing
            </button>
          )}
          {order.status === "preparing" && (
            <button
              type="button"
              onClick={() => updateStatus.mutate({ status: "ready" })}
              disabled={updateStatus.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Mark ready
            </button>
          )}
          {order.status === "ready" && (
            <button
              type="button"
              onClick={() => updateStatus.mutate({ status: "completed" })}
              disabled={updateStatus.isPending}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Complete
            </button>
          )}
          <button
            type="button"
            onClick={() => updateStatus.mutate({ status: "cancelled" })}
            disabled={updateStatus.isPending}
            className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Cancel order
          </button>
        </div>
      )}
    </div>
  );
}
