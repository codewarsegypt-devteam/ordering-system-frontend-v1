"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import {
  listTableServices,
  updateTableServiceStatus,
  getApiError,
  type TableServiceRow,
  type TableServiceStatus,
} from "@/lib/api";
import { useTableServiceCreated } from "@/hooks/useTableServiceCreated";
import {
  UserCircle2,
  Loader2,
  Receipt,
  Check,
  X,
  RefreshCw,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const TYPE_LABELS: Record<string, string> = {
  call_waiter: "طلب ويتر",
  request_bill: "طلب الفاتورة",
  other: "أخرى",
};

const STATUS_LABELS: Record<TableServiceStatus, string> = {
  pending: "قيد الانتظار",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  cancelled: "ملغي",
};

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
              إكمال
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              بدء
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
          title="إلغاء"
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
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tableServices", statusFilter, user?.merchant_id],
    queryFn: () =>
      listTableServices({
        status: statusFilter,
        branch_id: user?.branch_id ? String(user.branch_id) : undefined,
      }),
    enabled: !!user?.merchant_id,
  });

  useTableServiceCreated(
    () => {
      queryClient.invalidateQueries({ queryKey: ["tableServices"] });
    },
    { branchId: user?.branch_id ? String(user.branch_id) : undefined },
  );

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableServiceStatus }) =>
      updateTableServiceStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["tableServices"] });
      setUpdatingId(null);
      toast.success("تم تحديث الحالة");
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

  const requests = data?.data ?? [];
  const pagination = data?.pagination;

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
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-teal-600 text-white shadow-md">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Table Services</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                طلبات الويتر والفاتورة من الطاولات
              </p>
            </div>
          </div>
          {requests.length > 0 && (
            <span className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
              {requests.length} طلب
            </span>
          )}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["pending", "in_progress", "completed"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              statusFilter === s
                ? "bg-teal-600 text-white shadow-md shadow-teal-900/20"
                : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:ring-teal-300 hover:text-teal-700"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
            <UserCircle2 className="h-10 w-10 text-slate-300" />
          </div>
          <p className="text-base font-semibold text-slate-700">لا توجد طلبات</p>
          <p className="mt-1.5 max-w-sm text-sm text-slate-500">
            {statusFilter === "pending"
              ? "طلبات قيد الانتظار ستظهر هنا عند طلب العملاء"
              : "لا توجد طلبات بهذه الحالة"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
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
                        طاولة{" "}
                        {row.table_number != null
                          ? String(row.table_number)
                          : `#${row.table_id}`}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span>
                        {new Date(row.created_at).toLocaleTimeString("ar-EG", {
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
      )}

      {pagination && pagination.total_pages > 1 && (
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
          الصفحة {pagination.page} من {pagination.total_pages} ·{" "}
          {pagination.total} طلب
        </div>
      )}
    </div>
  );
}
