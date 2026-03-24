"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts";
import { useLiveOrdersOptional } from "@/contexts/LiveOrdersContext";
import {
  getDefaultOrdersFilters,
  type OrdersFilterState,
} from "@/lib/orders-filters";
import {
  fetchBranches,
  fetchOrders,
  exportOrdersExcel,
  getApiError,
  updateOrderStatus,
} from "@/lib/api";
import type { OrderStatus } from "@/lib/types";
import { useMerchantBaseCurrency } from "@/lib/hooks/useMerchantBaseCurrency";
import {
  CalendarRange,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Filter,
  Loader2,
  RotateCcw,
  Search,
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

const SORT_OPTIONS = [
  { value: "created_at", label: "Created at" },
  { value: "total_price", label: "Total price" },
  { value: "order_number", label: "Order number" },
  { value: "status", label: "Status" },
] as const;

type DatePreset = "live" | "today" | "last24h" | "last7d";

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
    case "live":
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

function formatRelativeTime(value: string) {
  const now = Date.now();
  const timestamp = new Date(value).getTime();
  const diffInMinutes = Math.round((timestamp - now) / 60000);
  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });

  if (Math.abs(diffInMinutes) < 60) {
    return formatter.format(diffInMinutes, "minute");
  }

  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return formatter.format(diffInHours, "hour");
  }

  const diffInDays = Math.round(diffInHours / 24);
  return formatter.format(diffInDays, "day");
}

export default function DashboardOrdersPage() {
  const { user } = useAuth();
  const { formatPrice, currencyCode } = useMerchantBaseCurrency();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<OrdersFilterState>(
    getDefaultOrdersFilters,
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const liveOrders = useLiveOrdersOptional();

  const isOwner = user?.role === "owner";

  useEffect(() => {
    if (liveOrders) liveOrders.setOrdersFilters(filters);
  }, [filters, liveOrders]);

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    enabled: !!user?.merchant_id && isOwner,
  });

  const activeBranchId =
    !isOwner && user?.branch_id != null
      ? String(user.branch_id)
      : filters.branch_id || undefined;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["orders", user?.merchant_id, user?.branch_id, filters],
    queryFn: () =>
      fetchOrders({
        branch_id: activeBranchId,
        status: filters.status.length ? filters.status.join(",") : undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        q: filters.q || undefined,
        page: filters.page,
        limit: filters.limit,
        table_id: filters.table_id || undefined,
        table_number: filters.table_number || undefined,
        min_total: filters.min_total || undefined,
        max_total: filters.max_total || undefined,
        sort_by: filters.sort_by,
        sort_dir: filters.sort_dir,
      }),
    enabled: !!user?.merchant_id,
    placeholderData: (previousData) => previousData,
  });

  const updateStatus = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => updateOrderStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const updateFilter = <K extends keyof OrdersFilterState>(
    key: K,
    value: OrdersFilterState[K],
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? Number(value) : 1,
    }));
  };

  const toggleStatus = (status: OrderStatus) => {
    setFilters((current) => ({
      ...current,
      page: 1,
      status: current.status.includes(status)
        ? current.status.filter((item) => item !== status)
        : [...current.status, status],
    }));
  };

  const resetFilters = () => {
    setFilters(getDefaultOrdersFilters());
  };

  const orders = data?.data ?? [];
  const pagination = data?.pagination;
  const totalOrders = pagination?.total ?? orders.length;
  const totalPages = pagination?.total_pages ?? 1;
  const currentPage = pagination?.page ?? filters.page;
  const statusCounts = (Object.keys(statusLabels) as OrderStatus[]).reduce(
    (accumulator, status) => {
      accumulator[status] = 0;
      return accumulator;
    },
    {} as Record<OrderStatus, number>,
  );

  for (const order of orders) {
    statusCounts[order.status] += 1;
  }

  const liveStatusSet: OrderStatus[] = [
    "placed",
    "accepted",
    "preparing",
    "ready",
  ];
  const kitchenStatusSet: OrderStatus[] = ["accepted", "preparing"];
  const hasAdvancedFilters =
    Boolean(filters.table_id) ||
    Boolean(filters.table_number) ||
    Boolean(filters.min_total) ||
    Boolean(filters.max_total) ||
    filters.sort_by !== "created_at" ||
    filters.sort_dir !== "desc" ||
    filters.limit !== 20;
  const hasActiveFilters =
    Boolean(filters.q) ||
    Boolean(filters.branch_id) ||
    Boolean(filters.from) ||
    Boolean(filters.to) ||
    Boolean(filters.table_id) ||
    Boolean(filters.table_number) ||
    Boolean(filters.min_total) ||
    Boolean(filters.max_total) ||
    filters.status.length > 0 ||
    hasAdvancedFilters;

  const matchesStatusSelection = (target: OrderStatus[]) =>
    target.length === filters.status.length &&
    target.every((status) => filters.status.includes(status));

  const applyStatusShortcut = (target: OrderStatus[]) => {
    setFilters((current) => ({
      ...current,
      page: 1,
      status: matchesStatusSelection(target) ? [] : target,
    }));
  };

  const applyDatePreset = (preset: DatePreset) => {
    const range = getDatePresetRange(preset);
    setFilters((current) => ({
      ...current,
      page: 1,
      from: range.from,
      to: range.to,
    }));
  };

  const handleExportExcel = async () => {
    setExportError(null);
    setExporting(true);
    try {
      await exportOrdersExcel({
        branch_id: activeBranchId,
        status: filters.status.length ? filters.status.join(",") : undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        q: filters.q || undefined,
        table_id: filters.table_id || undefined,
        table_number: filters.table_number || undefined,
        min_total: filters.min_total || undefined,
        max_total: filters.max_total || undefined,
        sort_by: filters.sort_by,
        sort_dir: filters.sort_dir,
      });
    } catch (err) {
      setExportError(getApiError(err));
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-sm text-slate-500">Loading orders…</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert-error">{getApiError(error)}</div>;
  }

  return (
    <div className="space-y-5">
      {exportError && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-lg text-sm text-red-800">
          <X className="h-4 w-4 shrink-0" />
          {exportError}
        </div>
      )}
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {totalOrders} {totalOrders === 1 ? "order" : "orders"}
            {filters.status.length > 0 &&
              ` · ${filters.status.length} status filter${filters.status.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isFetching && (
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            </div>
          )}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="btn-secondary"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exporting ? "Exporting…" : "Export Excel"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => applyStatusShortcut(liveStatusSet)}
          className={`rounded-xl border p-4 text-left transition-all ${
            matchesStatusSelection(liveStatusSet)
              ? "border-teal-300 bg-teal-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-teal-200 hover:shadow-sm"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Live queue
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {statusCounts.placed +
              statusCounts.accepted +
              statusCounts.preparing +
              statusCounts.ready}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Orders that still need action
          </p>
        </button>
        <button
          type="button"
          onClick={() => applyStatusShortcut(["placed"])}
          className={`rounded-xl border p-4 text-left transition-all ${
            matchesStatusSelection(["placed"])
              ? "border-sky-300 bg-sky-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-sky-200 hover:shadow-sm"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            New
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {statusCounts.placed}
          </p>
          <p className="mt-1 text-sm text-slate-500">Waiting to be accepted</p>
        </button>
        <button
          type="button"
          onClick={() => applyStatusShortcut(kitchenStatusSet)}
          className={`rounded-xl border p-4 text-left transition-all ${
            matchesStatusSelection(kitchenStatusSet)
              ? "border-amber-300 bg-amber-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-amber-200 hover:shadow-sm"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            In progress
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {statusCounts.accepted + statusCounts.preparing}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Accepted or being prepared
          </p>
        </button>
        <button
          type="button"
          onClick={() => applyStatusShortcut(["ready"])}
          className={`rounded-xl border p-4 text-left transition-all ${
            matchesStatusSelection(["ready"])
              ? "border-emerald-300 bg-emerald-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Ready
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {statusCounts.ready}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Ready for pickup or service
          </p>
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
              Keep the common filters visible, and open advanced options only
              when needed.
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
          <div>
            <label className="label">Search order #</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input-base pl-9"
                placeholder="e.g. 1017"
                value={filters.q}
                onChange={(e) => updateFilter("q", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Branch</label>
            <select
              className="input-base"
              value={
                isOwner ? filters.branch_id : String(user?.branch_id ?? "")
              }
              onChange={(e) => updateFilter("branch_id", e.target.value)}
              disabled={!isOwner}
            >
              <option value="">
                {isOwner ? "All branches" : "Your branch"}
              </option>
              {branches?.map((branch) => (
                <option key={branch.id} value={String(branch.id)}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 xl:col-span-1">
            <label className="label">Quick date range</label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["live", "Last 6h"],
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

        <div>
          <label className="label">Statuses</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(statusLabels) as OrderStatus[]).map((status) => {
              const active = filters.status.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggleStatus(status)}
                  className={
                    active ? "btn-primary btn-sm" : "btn-secondary btn-sm"
                  }
                >
                  {statusLabels[status]}
                </button>
              );
            })}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 text-xs">
            {filters.q && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                Search: {filters.q}
              </span>
            )}
            {activeBranchId && (
              <span className="rounded-full bg-teal-50 px-3 py-1 font-medium text-teal-700">
                Branch filtered
              </span>
            )}
            {filters.status.length > 0 && (
              <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
                {filters.status.length} status filter
                {filters.status.length > 1 ? "s" : ""}
              </span>
            )}
            {filters.from && filters.to && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                Custom time range
              </span>
            )}
            {filters.table_number && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                Table #{filters.table_number}
              </span>
            )}
            {filters.min_total && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                Min {filters.min_total} {currencyCode}
              </span>
            )}
          </div>
        )}

        {(showAdvancedFilters || hasAdvancedFilters) && (
          <div className="grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="label">Table number</label>
              <input
                className="input-base"
                placeholder="e.g. A1"
                value={filters.table_number}
                onChange={(e) => updateFilter("table_number", e.target.value)}
              />
            </div>

            <div>
              <label className="label">Table ID</label>
              <input
                className="input-base"
                placeholder="e.g. 19"
                value={filters.table_id}
                onChange={(e) => updateFilter("table_id", e.target.value)}
              />
            </div>

            <div>
              <label className="label">From date</label>
              <input
                type="datetime-local"
                className="input-base"
                value={filters.from}
                onChange={(e) => updateFilter("from", e.target.value)}
              />
            </div>

            <div>
              <label className="label">To date</label>
              <input
                type="datetime-local"
                className="input-base"
                value={filters.to}
                onChange={(e) => updateFilter("to", e.target.value)}
              />
            </div>

            <div>
              <label className="label">Min total</label>
              <input
                type="number"
                min="0"
                className="input-base"
                placeholder="0"
                value={filters.min_total}
                onChange={(e) => updateFilter("min_total", e.target.value)}
              />
            </div>

            <div>
              <label className="label">Max total</label>
              <input
                type="number"
                min="0"
                className="input-base"
                placeholder="500"
                value={filters.max_total}
                onChange={(e) => updateFilter("max_total", e.target.value)}
              />
            </div>

            <div>
              <label className="label">Sort by</label>
              <select
                className="input-base"
                value={filters.sort_by}
                onChange={(e) => updateFilter("sort_by", e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Sort direction</label>
              <select
                className="input-base"
                value={filters.sort_dir}
                onChange={(e) =>
                  updateFilter("sort_dir", e.target.value as "asc" | "desc")
                }
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <div>
              <label className="label">Page size</label>
              <select
                className="input-base"
                value={String(filters.limit)}
                onChange={(e) => updateFilter("limit", Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <ClipboardList className="h-8 w-8 text-slate-400" />
          </div>
          <p className="font-medium text-slate-700">No orders found</p>
          <p className="mt-1 text-sm text-slate-400">
            Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Status</th>
                  <th className="hidden sm:table-cell">Customer</th>
                  <th className="hidden md:table-cell">Table</th>
                  <th className="hidden lg:table-cell">Date</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={String(order.id)}
                    className={
                      order.status === "placed"
                        ? "bg-sky-50/40"
                        : order.status === "ready"
                          ? "bg-emerald-50/40"
                          : ""
                    }
                  >
                    <td>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="block font-mono font-semibold text-slate-800 transition-colors hover:text-teal-600"
                      >
                        #{order.order_number}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{formatRelativeTime(order.created_at)}</span>
                        {(order.table_number || order.table?.number) && (
                          <span>
                            Table: {order.table_number ?? order.table?.number}
                          </span>
                        )}
                        {order.branch_name && (
                          <span>Branch: {order.branch_name}</span>
                        )}
                        {order.order_type && (
                          <span className="badge badge-neutral capitalize">
                            {order.order_type.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={statusBadge[order.status]}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="text-slate-600">
                        {order.customer_name ?? (
                          <span className="italic text-slate-400">Guest</span>
                        )}
                      </span>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-slate-500">
                        {order.table_number ?? order.table?.number ?? "—"}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="text-right font-semibold text-slate-800">
                      {formatPrice(order.total_price)}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-teal-600"
                          title="View details"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>

                        {order.status === "placed" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus.mutate({
                                orderId: String(order.id),
                                status: "accepted",
                              })
                            }
                            disabled={updateStatus.isPending}
                            className="flex h-8 items-center gap-1 rounded-lg bg-teal-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                            title="Accept order"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Accept</span>
                          </button>
                        )}
                        {order.status === "accepted" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus.mutate({
                                orderId: String(order.id),
                                status: "preparing",
                              })
                            }
                            disabled={updateStatus.isPending}
                            className="flex h-8 items-center gap-1 rounded-lg bg-amber-500 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
                            title="Start preparing"
                          >
                            <ChefHat className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Preparing</span>
                          </button>
                        )}
                        {order.status === "preparing" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus.mutate({
                                orderId: String(order.id),
                                status: "ready",
                              })
                            }
                            disabled={updateStatus.isPending}
                            className="flex h-8 items-center gap-1 rounded-lg bg-sky-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
                            title="Mark ready"
                          >
                            <span className="hidden sm:inline">Ready</span>
                          </button>
                        )}
                        {order.status === "ready" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus.mutate({
                                orderId: String(order.id),
                                status: "completed",
                              })
                            }
                            disabled={updateStatus.isPending}
                            className="flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                            title="Complete"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Complete</span>
                          </button>
                        )}
                        {["placed", "accepted", "preparing"].includes(
                          order.status,
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus.mutate({
                                orderId: String(order.id),
                                status: "cancelled",
                              })
                            }
                            disabled={updateStatus.isPending}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                            title="Cancel order"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
              {pagination?.total != null && ` · ${pagination.total} total`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  updateFilter("page", Math.max(1, filters.page - 1))
                }
                disabled={!pagination?.has_prev}
                className="btn-secondary btn-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => updateFilter("page", filters.page + 1)}
                disabled={!pagination?.has_next}
                className="btn-primary btn-sm"
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
