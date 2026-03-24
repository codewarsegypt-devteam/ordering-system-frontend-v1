"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import { useMerchantBaseCurrency } from "@/lib/hooks/useMerchantBaseCurrency";
import {
  closeTableSession,
  fetchBranches,
  fetchTableSessions,
  fetchTableSessionOrders,
  getApiError,
  updateOrderStatus,
  type OpenTableSession,
} from "@/lib/api";
import type { OrderStatus } from "@/lib/types";
import {
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ChefHat,
  Filter,
  Loader2,
  RefreshCcw,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";

const statusLabels: Record<OrderStatus, string> = {
  draft: "Draft",
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusBadge: Record<OrderStatus, string> = {
  draft: "badge badge-neutral",
  placed: "badge badge-info",
  accepted: "badge badge-teal",
  preparing: "badge badge-warning",
  ready: "badge bg-blue-100 text-blue-700",
  completed: "badge badge-success",
  cancelled: "badge badge-error",
};

type DatePreset = "last6h" | "today" | "last24h" | "last7d";

function formatDateTimeLocal(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDatePresetRange(preset: DatePreset) {
  const now = new Date();
  const from = new Date(now);
  switch (preset) {
    case "last6h":
      from.setHours(now.getHours() - 6);
      break;
    case "today":
      from.setHours(0, 0, 0, 0);
      break;
    case "last24h":
      from.setHours(now.getHours() - 24);
      break;
    case "last7d":
      from.setDate(now.getDate() - 6);
      break;
  }
  return {
    from: formatDateTimeLocal(from),
    to: formatDateTimeLocal(now),
  };
}

export default function DashboardTableSessionsPage() {
  const { user } = useAuth();
  const { formatPrice } = useMerchantBaseCurrency();
  const queryClient = useQueryClient();
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOpenedByType, setSelectedOpenedByType] = useState("");
  const [fromDateTime, setFromDateTime] = useState("");
  const [toDateTime, setToDateTime] = useState("");
  const [sortBy, setSortBy] = useState<"opened_at" | "closed_at" | "created_at">(
    "opened_at",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isOwner = user?.role === "owner";
  const activeBranchId =
    !isOwner && user?.branch_id != null
      ? String(user.branch_id)
      : selectedBranchId || undefined;

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    enabled: !!user?.merchant_id && isOwner,
  });

  const sessionsQuery = useQuery({
    queryKey: [
      "table-sessions",
      user?.merchant_id,
      activeBranchId,
      selectedStatus,
      selectedOpenedByType,
      fromDateTime,
      toDateTime,
      sortBy,
      sortDir,
      page,
      limit,
    ],
    queryFn: () =>
      fetchTableSessions({
        branch_id: activeBranchId,
        status: selectedStatus || undefined,
        opened_by_type: selectedOpenedByType || undefined,
        from: fromDateTime || undefined,
        to: toDateTime || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
        page,
        limit,
      }),
    enabled: !!user?.merchant_id,
    refetchInterval: 15000,
  });

  const sessions = sessionsQuery.data?.data ?? [];
  const pagination = sessionsQuery.data?.pagination;

  const hasAdvancedFilters =
    Boolean(selectedOpenedByType) ||
    Boolean(fromDateTime) ||
    Boolean(toDateTime) ||
    sortBy !== "opened_at" ||
    sortDir !== "desc" ||
    limit !== 20;

  const hasActiveFilters =
    Boolean(activeBranchId) || Boolean(selectedStatus) || hasAdvancedFilters;

  const resetFilters = () => {
    setSelectedBranchId("");
    setSelectedStatus("");
    setSelectedOpenedByType("");
    setFromDateTime("");
    setToDateTime("");
    setSortBy("opened_at");
    setSortDir("desc");
    setLimit(20);
    setPage(1);
    setShowAdvancedFilters(false);
  };

  const applyDatePreset = (preset: DatePreset) => {
    const range = getDatePresetRange(preset);
    setFromDateTime(range.from);
    setToDateTime(range.to);
    setPage(1);
  };

  const selectedSession = useMemo(
    () => sessions.find((session) => String(session.id) === expandedSessionId) ?? null,
    [sessions, expandedSessionId],
  );

  const sessionOrdersQuery = useQuery({
    queryKey: ["table-session-orders", expandedSessionId],
    queryFn: () => fetchTableSessionOrders(expandedSessionId as string),
    enabled: !!expandedSessionId,
    refetchInterval: expandedSessionId ? 10000 : false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["table-session-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["table-sessions"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);
    },
    onError: (error) => {
      setErrorMessage(getApiError(error));
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => closeTableSession(sessionId),
    onSuccess: async (_, sessionId) => {
      if (expandedSessionId === sessionId) {
        setExpandedSessionId(null);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["table-sessions"] }),
        queryClient.invalidateQueries({ queryKey: ["table-session-orders"] }),
      ]);
    },
    onError: (error) => {
      setErrorMessage(getApiError(error));
    },
  });

  const orders = sessionOrdersQuery.data?.orders ?? [];

  const renderOrderActions = (order: {
    id: string | number;
    status: string;
  }) => {
    const status = String(order.status).toLowerCase() as OrderStatus;
    return (
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/dashboard/orders/${order.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-teal-600"
          title="View details"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>

        {status === "placed" && (
          <button
            type="button"
            onClick={() =>
              updateStatusMutation.mutate({
                orderId: String(order.id),
                status: "accepted",
              })
            }
            disabled={updateStatusMutation.isPending}
            className="flex h-8 items-center gap-1 rounded-lg bg-teal-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
            title="Accept order"
          >
            <Check className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Accept</span>
          </button>
        )}

        {status === "accepted" && (
          <button
            type="button"
            onClick={() =>
              updateStatusMutation.mutate({
                orderId: String(order.id),
                status: "preparing",
              })
            }
            disabled={updateStatusMutation.isPending}
            className="flex h-8 items-center gap-1 rounded-lg bg-amber-500 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
            title="Start preparing"
          >
            <ChefHat className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preparing</span>
          </button>
        )}

        {status === "preparing" && (
          <button
            type="button"
            onClick={() =>
              updateStatusMutation.mutate({
                orderId: String(order.id),
                status: "ready",
              })
            }
            disabled={updateStatusMutation.isPending}
            className="flex h-8 items-center gap-1 rounded-lg bg-sky-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
            title="Mark ready"
          >
            <span className="hidden sm:inline">Ready</span>
          </button>
        )}

        {status === "ready" && (
          <button
            type="button"
            onClick={() =>
              updateStatusMutation.mutate({
                orderId: String(order.id),
                status: "completed",
              })
            }
            disabled={updateStatusMutation.isPending}
            className="flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            title="Complete"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Complete</span>
          </button>
        )}

        {["placed", "accepted", "preparing"].includes(status) && (
          <button
            type="button"
            onClick={() =>
              updateStatusMutation.mutate({
                orderId: String(order.id),
                status: "cancelled",
              })
            }
            disabled={updateStatusMutation.isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
            title="Cancel order"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Table Sessions</h1>
          <p className="text-sm text-slate-500">
            All table sessions with order status controls.
          </p>
        </div>
        <button
          type="button"
          onClick={() => sessionsQuery.refetch()}
          className="btn-secondary btn-sm"
          disabled={sessionsQuery.isFetching}
        >
          {sessionsQuery.isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Refresh
        </button>
      </div>

      <div className="form-card space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-700">
              <Filter className="h-4 w-4" />
              <h2 className="section-title text-sm">Filters</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Keep common filters visible and open advanced options when needed.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((current) => !current)}
              className="btn-secondary btn-sm"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {showAdvancedFilters || hasAdvancedFilters
                ? "Hide advanced"
                : "Advanced filters"}
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="btn-secondary btn-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isOwner && (
            <div>
              <label className="label">Branch</label>
              <select
                className="input-base"
                value={selectedBranchId}
                onChange={(event) => {
                  setSelectedBranchId(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All branches</option>
                {(branches ?? []).map((branch) => (
                  <option key={String(branch.id)} value={String(branch.id)}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Status</label>
            <select
              className="input-base"
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              {/* <option value="active,closed">Active + Closed</option> */}
            </select>
          </div>
          <div className="md:col-span-2 xl:col-span-1">
            <label className="label">Quick date range</label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["last6h", "Last 6h"],
                  ["today", "Today"],
                  ["last24h", "Last 24h"],
                  ["last7d", "Last 7d"],
                ] as const
              ).map(([preset, label]) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyDatePreset(preset)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                >
                  <CalendarRange className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 text-xs">
            {selectedStatus && (
              <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
                Status: {selectedStatus}
              </span>
            )}
            {activeBranchId && (
              <span className="rounded-full bg-teal-50 px-3 py-1 font-medium text-teal-700">
                Branch filtered
              </span>
            )}
            {selectedOpenedByType && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                Opened by: {selectedOpenedByType}
              </span>
            )}
            {fromDateTime && toDateTime && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                Custom time range
              </span>
            )}
          </div>
        )}

        {(showAdvancedFilters || hasAdvancedFilters) && (
          <div className="grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="label">Opened by type</label>
              <select
                className="input-base"
                value={selectedOpenedByType}
                onChange={(event) => {
                  setSelectedOpenedByType(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div>
              <label className="label">From date</label>
              <input
                type="datetime-local"
                className="input-base"
                value={fromDateTime}
                onChange={(event) => {
                  setFromDateTime(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label className="label">To date</label>
              <input
                type="datetime-local"
                className="input-base"
                value={toDateTime}
                onChange={(event) => {
                  setToDateTime(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label className="label">Sort by</label>
              <select
                className="input-base"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as "opened_at" | "closed_at" | "created_at");
                  setPage(1);
                }}
              >
                <option value="opened_at">Opened at</option>
                <option value="closed_at">Closed at</option>
                <option value="created_at">Created at</option>
              </select>
            </div>
            <div>
              <label className="label">Sort direction</label>
              <select
                className="input-base"
                value={sortDir}
                onChange={(event) => {
                  setSortDir(event.target.value as "asc" | "desc");
                  setPage(1);
                }}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            <div>
              <label className="label">Page size</label>
              <select
                className="input-base"
                value={String(limit)}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
              >
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
                <option value="100">100 / page</option>
              </select>
            </div>
          </div>
        )}
          <div className="text-sm text-slate-500">
            <span className="font-medium text-slate-700">{sessions.length}</span>{" "}
            session(s)
            {pagination?.total != null ? ` of ${pagination.total}` : ""}
          </div>
        </div>

      {errorMessage && (
        <div className="alert alert-error">
          <span>{errorMessage}</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setErrorMessage(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {sessionsQuery.isLoading ? (
        <div className="card p-8 text-center text-slate-500">Loading sessions...</div>
      ) : sessionsQuery.error ? (
        <div className="card p-8 text-center text-red-600">
          {getApiError(sessionsQuery.error)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          No sessions found.
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session: OpenTableSession) => {
            const isExpanded = expandedSessionId === String(session.id);
            const isClosed = String(session.status).toLowerCase() === "closed";
            return (
              <div key={String(session.id)} className="card overflow-hidden">
                <div className="flex w-full items-center justify-between gap-3 px-4 py-4">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() =>
                      setExpandedSessionId((prev) =>
                        prev === String(session.id) ? null : String(session.id),
                      )
                    }
                  >
                    <p className="font-semibold text-slate-900">
                      Session #{session.id}{" "}
                      <span className="ml-2 text-sm font-normal text-slate-500">
                        Table {session.table_number ?? session.table_id ?? "—"}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Opened:{" "}
                      {session.opened_at
                        ? new Date(session.opened_at).toLocaleString()
                        : "—"}{" "}
                      · Orders: {session.orders_count} · Open: {session.open_orders_count}
                    </p>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className={isClosed ? "badge badge-neutral" : "badge badge-success"}>
                      {isClosed ? "Closed" : "Active"}
                    </span>
                    {isClosed ? (
                      <span className="badge badge-neutral px-3 py-3 text-xs">
                        Session Closed
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-error btn-sm text-white bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer"
                        onClick={() => closeSessionMutation.mutate(String(session.id))}
                        disabled={closeSessionMutation.isPending}
                      >
                        {closeSessionMutation.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Close Session
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800">
                      {formatPrice(session.total_price || 0)}
                    </span>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
                      onClick={() =>
                        setExpandedSessionId((prev) =>
                          prev === String(session.id) ? null : String(session.id),
                        )
                      }
                      title={isExpanded ? "Hide orders" : "Show orders"}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        Table:{" "}
                        <span className="font-medium text-slate-900">
                          {session.table_number ?? session.table_id ?? "—"}
                        </span>
                      </div>
                    </div>

                    {selectedSession && String(selectedSession.id) === String(session.id) && (
                      <div className="overflow-x-auto border-t border-slate-200">
                        {sessionOrdersQuery.isLoading ? (
                          <div className="p-6 text-sm text-slate-500">Loading orders...</div>
                        ) : sessionOrdersQuery.error ? (
                          <div className="p-6 text-sm text-red-600">
                            {getApiError(sessionOrdersQuery.error)}
                          </div>
                        ) : orders.length === 0 ? (
                          <div className="p-6 text-sm text-slate-500">
                            No orders inside this session.
                          </div>
                        ) : (
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Order</th>
                                <th>Status</th>
                                <th className="hidden md:table-cell">Created</th>
                                <th className="text-right">Total</th>
                                <th className="text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.map((order) => {
                                const orderStatus = String(order.status).toLowerCase() as OrderStatus;
                                const badgeClass =
                                  statusBadge[orderStatus] ?? "badge badge-neutral";
                                const badgeLabel = statusLabels[orderStatus] ?? order.status;
                                return (
                                  <tr key={String(order.id)}>
                                    <td className="font-mono font-semibold text-slate-800">
                                      #{order.order_number ?? order.id}
                                    </td>
                                    <td>
                                      <span className={badgeClass}>{badgeLabel}</span>
                                    </td>
                                    <td className="hidden md:table-cell text-xs text-slate-500">
                                      {order.created_at
                                        ? new Date(order.created_at).toLocaleString()
                                        : "—"}
                                    </td>
                                    <td className="text-right font-semibold text-slate-800">
                                      {formatPrice(order.total_price || 0)}
                                    </td>
                                    <td className="text-right">
                                      {renderOrderActions({
                                        id: order.id,
                                        status: String(order.status),
                                      })}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {!!pagination && (
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.total_pages || 1}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary btn-sm"
                disabled={!pagination.has_prev}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                className="btn-primary btn-sm"
                disabled={!pagination.has_next}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
