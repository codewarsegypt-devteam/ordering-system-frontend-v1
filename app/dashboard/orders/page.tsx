"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import { fetchOrders, updateOrderStatus, getApiError } from "@/lib/api";
import type { OrderStatus } from "@/lib/types";
import {
  ClipboardList,
  ChevronRight,
  Loader2,
  Check,
  X,
  ChefHat,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

export default function DashboardOrdersPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", user?.merchant_id, user?.branch_id, statusFilter],
    queryFn: () =>
      fetchOrders({
        branch_id: user?.branch_id ?? undefined,
        status: statusFilter || undefined,
        limit: 50,
      }),
    enabled: !!user?.merchant_id,
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  if (isLoading) {
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

  const orders = data?.data ?? [];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-zinc-800 sm:text-2xl">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:w-auto"
        >
          <option value="">All statuses</option>
          {(Object.keys(statusLabels) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
          <ClipboardList className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
          <p className="text-zinc-500">No orders found</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="flex flex-wrap items-center gap-2 gap-y-1 sm:gap-4">
                <span className="font-mono text-sm font-semibold text-zinc-800 sm:text-base">
                  #{order.order_number}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    order.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-teal-100 text-teal-800"
                  }`}
                >
                  {statusLabels[order.status]}
                </span>
                <span className="w-full text-xs text-zinc-500 sm:w-auto sm:text-sm">
                  {new Date(order.created_at).toLocaleString()}
                </span>
                {order.customer_name && (
                  <span className="text-sm text-zinc-600">
                    {order.customer_name}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3 sm:border-t-0 sm:pt-0">
                <span className="font-semibold text-zinc-800">
                  {order.total_price.toFixed(2)} EGP
                </span>
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-teal-600"
                  aria-label="View order"
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
                {order.status === "placed" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus.mutate({
                        orderId: order.id,
                        status: "accepted",
                      })
                    }
                    disabled={updateStatus.isPending}
                    className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
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
                    onClick={() =>
                      updateStatus.mutate({
                        orderId: order.id,
                        status: "preparing",
                      })
                    }
                    disabled={updateStatus.isPending}
                    className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    <ChefHat className="h-4 w-4" />
                    Preparing
                  </button>
                )}
                {order.status === "preparing" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus.mutate({
                        orderId: order.id,
                        status: "ready",
                      })
                    }
                    disabled={updateStatus.isPending}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Ready
                  </button>
                )}
                {order.status === "ready" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus.mutate({
                        orderId: order.id,
                        status: "completed",
                      })
                    }
                    disabled={updateStatus.isPending}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Complete
                  </button>
                )}
                {["placed", "accepted", "preparing"].includes(order.status) && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus.mutate({
                        orderId: order.id,
                        status: "cancelled",
                      })
                    }
                    disabled={updateStatus.isPending}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    aria-label="Cancel order"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
