"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import {
  listTableServices,
  updateTableServiceStatus,
  getApiError,
  fetchBranches,
  type TableServiceRow,
  type TableServiceStatus,
} from "@/lib/api";
import {
  UserCircle2,
  Loader2,
  Receipt,
  Check,
  X,
  RefreshCw,
  UtensilsCrossed,
  Filter,
  CalendarRange,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const TYPE_LABELS: Record<string, string> = {
  call_waiter: "Call waiter",
  request_bill: "Request bill",
  other: "Other",
};

const STATUS_LABELS: Record<TableServiceStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

type DatePreset = "live" | "today" | "last24h" | "last7d";

type TableServicesFilterState = {
  branch_id: string;
  table_id: string;
  from: string;
  to: string;
  status: TableServiceStatus[];
  page: number;
  limit: number;
};

function getDefaultFilters(): TableServicesFilterState {
  return {
    branch_id: "",
    table_id: "",
    from: "",
    to: "",
    status: [],
    page: 1,
    limit: 20,
  };
}

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

function StatusSelect({
  row,
  onUpdate,
  isUpdating,
}: {
  row: TableServiceRow;
  onUpdate: (id: string, status: TableServiceStatus) => void;
  isUpdating: boolean;
}) {
  const nextStatus: TableServiceStatus | null =
    row.status === "pending"
      ? "in_progress"
      : row.status === "in_progress"
        ? "completed"
        : null;

  if (row.status === "completed" || row.status === "cancelled") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        {STATUS_LABELS[row.status]}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
          row.status === "pending"
            ? "bg-amber-100 text-amber-800"
            : "bg-teal-100 text-teal-800"
        }`}
      >
        {STATUS_LABELS[row.status]}
      </span>
      {nextStatus && (
        <button
          type="button"
          onClick={() => onUpdate(row.id, nextStatus)}
          disabled={isUpdating}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
        >
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : nextStatus === "completed" ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Complete
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Start
            </>
          )}
        </button>
      )}
      {row.status === "pending" && (
        <button
          type="button"
          onClick={() => onUpdate(row.id, "cancelled")}
          disabled={isUpdating}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function TableServicesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TableServicesFilterState>(getDefaultFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isOwner = user?.role === "owner";
  const activeBranchId =
    !isOwner && user?.branch_id != null ? String(user.branch_id) : filters.branch_id || undefined;

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    enabled: !!user?.merchant_id && isOwner,
  });

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["tableServices", user?.merchant_id, user?.branch_id, filters],
    queryFn: () =>
      listTableServices({
        branch_id: activeBranchId,
        table_id: filters.table_id || undefined,
        status: filters.status.length ? filters.status.join(",") : undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        page: filters.page,
        limit: filters.limit,
      }),
    enabled: !!user?.merchant_id,
    placeholderData: (previousData) => previousData,
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableServiceStatus }) =>
      updateTableServiceStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["tableServices"] });
      setUpdatingId(null);
      toast.success("Status updated");
    },
    onError: (e) => {
      setUpdatingId(null);
      toast.error(getApiError(e));
    },
  });

  const handleUpdateStatus = (id: string, status: TableServiceStatus) => {
    setUpdatingId(id);
    updateStatusMut.mutate({ id, status });
  };

  const updateFilter = <K extends keyof TableServicesFilterState>(
    key: K,
    value: TableServicesFilterState[K]
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? Number(value) : 1,
    }));
  };

  const toggleStatus = (status: TableServiceStatus) => {
    setFilters((current) => ({
      ...current,
      page: 1,
      status: current.status.includes(status)
        ? current.status.filter((s) => s !== status)
        : [...current.status, status],
    }));
  };

  const resetFilters = () => {
    setFilters(getDefaultFilters());
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

  const requests = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.total_pages ?? 1;
  const currentPage = pagination?.page ?? filters.page;
  const hasAdvancedFilters =
    Boolean(filters.table_id) || Boolean(filters.from) || Boolean(filters.to) || filters.limit !== 20;
  const hasActiveFilters =
    Boolean(filters.branch_id) ||
    Boolean(filters.table_id) ||
    Boolean(filters.from) ||
    Boolean(filters.to) ||
    filters.status.length > 0 ||
    hasAdvancedFilters;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error rounded-xl">{getApiError(error)}</div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Table Services</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Waiter & bill requests from tables
            {pagination?.total != null && ` · ${pagination.total} request${pagination.total === 1 ? "" : "s"}`}
            {filters.status.length > 0 &&
              ` · ${filters.status.length} status filter${filters.status.length > 1 ? "s" : ""}`}
          </p>
        </div>
        {isFetching && (
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            Updating…
          </div>
        )}
      </div>

      <div className="form-card space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-700">
              <Filter className="h-4 w-4" />
              <h2 className="section-title text-sm">Filters</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Filter by branch, date, status, and table.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((c) => !c)}
              className="btn-secondary btn-sm"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {showAdvancedFilters || hasAdvancedFilters ? "Hide advanced" : "Advanced filters"}
            </button>
            <button type="button" onClick={resetFilters} className="btn-secondary btn-sm">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="label">Branch</label>
            <select
              className="input-base"
              value={isOwner ? filters.branch_id : String(user?.branch_id ?? "")}
              onChange={(e) => updateFilter("branch_id", e.target.value)}
              disabled={!isOwner}
            >
              <option value="">{isOwner ? "All branches" : "Your branch"}</option>
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
              {([
                ["live", "Last 6h"],
                ["today", "Today"],
                ["last24h", "Last 24h"],
                ["last7d", "Last 7d"],
              ] as const).map(([preset, label]) => (
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
          <label className="label">Status</label>
          <div className="flex flex-wrap gap-2">
            {(["pending", "in_progress", "completed", "cancelled"] as const).map((status) => {
              const active = filters.status.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggleStatus(status)}
                  className={active ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
                >
                  {STATUS_LABELS[status]}
                </button>
              );
            })}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 text-xs">
            {activeBranchId && (
              <span className="rounded-full bg-teal-50 px-3 py-1 font-medium text-teal-700">
                Branch filtered
              </span>
            )}
            {filters.status.length > 0 && (
              <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
                {filters.status.length} status filter{filters.status.length > 1 ? "s" : ""}
              </span>
            )}
            {(filters.from || filters.to) && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                Custom time range
              </span>
            )}
            {filters.table_id && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                Table #{filters.table_id}
              </span>
            )}
          </div>
        )}

        {(showAdvancedFilters || hasAdvancedFilters) && (
          <div className="grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2 xl:grid-cols-4">
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
              <label className="label">Page size</label>
              <select
                className="input-base"
                value={String(filters.limit)}
                onChange={(e) => updateFilter("limit", Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <UserCircle2 className="h-8 w-8 text-slate-400" />
          </div>
          <p className="font-medium text-slate-700">No requests</p>
          <p className="mt-1 text-sm text-slate-400">Try adjusting filters or wait for new requests.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="flex flex-col gap-4 p-5">
            {requests.map((row) => (
            <div
              key={row.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-1 flex-wrap items-start justify-between gap-4 p-5">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      row.type === "request_bill"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {row.type === "request_bill" ? (
                      <Receipt className="h-6 w-6" />
                    ) : (
                      <UserCircle2 className="h-6 w-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800">
                      {TYPE_LABELS[row.type] ?? row.type}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                        Table{" "}
                        {row.table_number != null
                          ? String(row.table_number)
                          : `#${row.table_id}`}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span>
                        {new Date(row.created_at).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <StatusSelect
                  row={row}
                  onUpdate={handleUpdateStatus}
                  isUpdating={updatingId === row.id}
                />
              </div>
            </div>
          ))}
          </div>

          {pagination && (pagination.total_pages > 1 || pagination.total > 0) && (
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
                {pagination.total != null && ` · ${pagination.total} total`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateFilter("page", Math.max(1, filters.page - 1))}
                  disabled={currentPage <= 1}
                  className="btn-secondary btn-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => updateFilter("page", filters.page + 1)}
                  disabled={currentPage >= totalPages}
                  className="btn-primary btn-sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
