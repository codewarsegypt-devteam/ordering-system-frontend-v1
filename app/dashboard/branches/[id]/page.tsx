"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts";
import {
  fetchBranches,
  fetchBranchTables,
  createTable,
  updateBranch,
  deleteBranch,
  getApiError,
} from "@/lib/api";
import { fetchTableQr, updateTable, deleteTable } from "@/lib/api/tables";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  QrCode,
  X,
  Check,
  Phone,
  Home,
  TableProperties,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";

interface TableEditFormData {
  number: string;
  seats: string;
  is_active: boolean;
  qr_code: string;
}

function Toast({
  toast,
}: {
  toast: { type: "ok" | "err"; text: string } | null;
}) {
  if (!toast) return null;
  return (
    <div
      role="alert"
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full px-5 py-3 text-sm font-medium shadow-lg ring-2 ring-white/20 ${
        toast.type === "ok"
          ? "bg-emerald-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {toast.type === "ok" ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
      {toast.text}
    </div>
  );
}

export default function BranchTablesPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = params?.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [addingTable, setAddingTable] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingBranch, setEditingBranch] = useState(false);
  const [qrTableId, setQrTableId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const showToast = (type: "ok" | "err", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    enabled: !!user?.merchant_id && user?.role === "owner",
  });

  const branch = branches?.find((b) => String(b.id) === String(branchId));

  const { data: tables, isLoading: tablesLoading } = useQuery({
    queryKey: ["branchTables", branchId],
    queryFn: () => fetchBranchTables(branchId),
    enabled: !!branchId,
  });

  const { data: qrData } = useQuery({
    queryKey: ["tableQr", qrTableId],
    queryFn: () => fetchTableQr(qrTableId!),
    enabled: !!qrTableId,
  });

  const updateBranchMut = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof updateBranch>[1];
    }) => updateBranch(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setEditingBranch(false);
      showToast("ok", "Branch updated.");
    },
    onError: (e) => showToast("err", getApiError(e)),
  });

  const deleteBranchMut = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      showToast("ok", "Branch deleted.");
      router.push("/dashboard/branches");
    },
    onError: (e) => showToast("err", getApiError(e)),
  });

  const createTableMut = useMutation({
    mutationFn: ({
      branchId,
      body,
    }: {
      branchId: string;
      body: {
        number: number;
        seats?: number;
        is_active?: boolean;
        qr_code?: string | null;
      };
    }) => createTable(branchId, { ...body, is_active: true }),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ["branchTables", branchId] });
      setAddingTable(false);
      showToast("ok", "Table created.");
    },
    onError: (e) => showToast("err", getApiError(e)),
  });

  const updateTableMut = useMutation({
    mutationFn: ({
      tableId,
      body,
    }: {
      tableId: string;
      body: {
        number?: number;
        seats?: number;
        is_active?: boolean;
        qr_code?: string | null;
      };
    }) => updateTable(tableId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branchTables", branchId] });
      setEditingTableId(null);
      showToast("ok", "Table updated.");
    },
    onError: (e) => showToast("err", getApiError(e)),
  });

  const deleteTableMut = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branchTables", branchId] });
      showToast("ok", "Table deleted.");
    },
    onError: (e) => showToast("err", getApiError(e)),
  });

  if (user?.role !== "owner") {
    return (
      <div className="alert-warning flex items-start gap-3 rounded-xl">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        Only owners can manage branches and tables.
      </div>
    );
  }

  if (branchesLoading || !branchId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/branches"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to branches
        </Link>
        <div className="alert-error rounded-xl">Branch not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-0 space-y-8">
      <Toast toast={toast} />

      {/* Back link */}
      <Link
        href="/dashboard/branches"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to branches
      </Link>

      {/* Branch hero */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-200/60 bg-linear-to-br from-teal-600 via-teal-600 to-teal-700 px-6 py-8 text-white shadow-lg shadow-teal-900/10 sm:px-8">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {branch.name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-teal-100">
                {branch.address && (
                  <span className="flex items-center gap-1.5">
                    <Home className="h-4 w-4 shrink-0" /> {branch.address}
                  </span>
                )}
                {branch.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 shrink-0" /> {branch.phone}
                  </span>
                )}
              </div>
              {!branch.is_active && (
                <span className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  Inactive
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditingBranch(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-medium backdrop-blur transition-colors hover:bg-white/20"
            >
              <Pencil className="h-4 w-4" /> Edit branch
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Delete this branch and all its tables? This cannot be undone."
                  )
                )
                  deleteBranchMut.mutate(branch.id);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500/90 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-red-500"
            >
              <Trash2 className="h-4 w-4" /> Delete branch
            </button>
          </div>
        </div>
      </div>

      {/* Edit branch inline */}
      {editingBranch && (
        <div className="form-card border-teal-200/60 bg-slate-50/50">
          <h2 className="section-title mb-4">Edit branch</h2>
          <BranchEditForm
            branch={branch}
            onSubmit={(body) =>
              updateBranchMut.mutate({ id: branch.id, body })
            }
            onCancel={() => setEditingBranch(false)}
            isPending={updateBranchMut.isPending}
          />
        </div>
      )}

      {/* Tables section */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
              <TableProperties className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Tables</h2>
              <p className="text-sm text-slate-500">
                {tables?.length ?? 0} table{(tables?.length ?? 0) !== 1 ? "s" : ""}{" "}
                in this branch
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAddingTable(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> Add table
          </button>
        </div>

        {addingTable && (
          <div className="border-b border-slate-100 bg-teal-50/30 px-6 py-4">
            <AddTableForm
              onAdd={(number, seats) =>
                createTableMut.mutate({
                  branchId: branch.id,
                  body: {
                    number,
                    seats: seats ? parseInt(seats, 10) : undefined,
                  },
                })
              }
              onCancel={() => setAddingTable(false)}
              isPending={createTableMut.isPending}
            />
          </div>
        )}

        {tablesLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : !tables || tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <TableProperties className="h-8 w-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-700">No tables yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Add a table to generate QR codes for customers.
            </p>
            {!addingTable && (
              <button
                type="button"
                onClick={() => setAddingTable(true)}
                className="btn-primary mt-4"
              >
                <Plus className="h-4 w-4" /> Add table
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tables.map((t) => (
              <div
                key={t.id}
                className="group flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80"
              >
                {editingTableId === t.id ? (
                  <div className="w-full rounded-xl bg-white p-4 shadow-sm">
                    <TableEditForm
                      table={t}
                      onSave={(body) =>
                        updateTableMut.mutate({ tableId: t.id, body })
                      }
                      onCancel={() => setEditingTableId(null)}
                      isPending={updateTableMut.isPending}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-700">
                        #{t.number}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          Table {t.number}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t.seats != null
                            ? `${t.seats} seats`
                            : "Seats not set"}
                        </p>
                      </div>
                      {t.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-neutral">Inactive</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setQrTableId(qrTableId === t.id ? null : t.id)
                        }
                        className="rounded-lg p-2.5 text-teal-600 transition-colors hover:bg-teal-50"
                        title="View QR"
                      >
                        <QrCode className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTableId(t.id)}
                        className="rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this table?"))
                            deleteTableMut.mutate(t.id);
                        }}
                        className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrData && qrTableId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setQrTableId(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
                  <QrCode className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="font-semibold text-slate-800">Table QR Code</h2>
              </div>
              <button
                type="button"
                onClick={() => setQrTableId(null)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-8 text-center">
              {qrData.table_code && (
                <p className="mb-4 text-sm text-slate-500">
                  Code:{" "}
                  <span className="font-mono font-semibold text-slate-700">
                    {qrData.table_code}
                  </span>
                </p>
              )}
              {qrData.qr_svg ? (
                <div
                  className="mx-auto flex h-56 w-56 items-center justify-center rounded-2xl border border-slate-100 bg-white p-3 [&>svg]:h-full [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: qrData.qr_svg }}
                />
              ) : (
                <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-400">
                  No QR image
                </div>
              )}
              {qrData.qr_url && (
                <p className="mt-4 break-all text-xs text-slate-400">
                  <a
                    href={qrData.qr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline"
                  >
                    {qrData.qr_url}
                  </a>
                </p>
              )}
            </div>
            <div className="border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setQrTableId(null)}
                className="btn-secondary w-full justify-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Branch edit form ─── */
function BranchEditForm({
  branch,
  onSubmit,
  onCancel,
  isPending,
}: {
  branch: { name: string; address?: string | null; phone?: string | null; is_active: boolean };
  onSubmit: (data: {
    name: string;
    address?: string | null;
    phone?: string | null;
    is_active?: boolean;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: branch.name,
      address: branch.address ?? "",
      phone: branch.phone ?? "",
      is_active: branch.is_active,
    },
  });
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onSubmit({
          name: d.name,
          address: d.address || null,
          phone: d.phone || null,
          is_active: d.is_active,
        })
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Branch name *</label>
          <input
            className="input-base"
            placeholder="e.g. Downtown"
            {...register("name", { required: true })}
          />
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            className="input-base"
            placeholder="+20 100 000 0000"
            {...register("phone")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Address</label>
          <input
            className="input-base"
            placeholder="Street, City"
            {...register("address")}
          />
        </div>
        <div className="flex items-center gap-2.5 sm:col-span-2">
          <input
            type="checkbox"
            id="branch_active_edit"
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            {...register("is_active")}
          />
          <label
            htmlFor="branch_active_edit"
            className="text-sm font-medium text-slate-700"
          >
            Active
          </label>
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}{" "}
          Save changes
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Add table form ─── */
function AddTableForm({
  onAdd,
  onCancel,
  isPending,
}: {
  onAdd: (number: number, seats?: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<{ number: string; seats: string }>();
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onAdd(parseInt(d.number, 10), d.seats || undefined)
      )}
      className="flex flex-wrap items-end gap-3"
    >
      <div className="w-28">
        <label className="label text-xs">Table # *</label>
        <input
          type="number"
          min={1}
          className="input-base"
          placeholder="e.g. 5"
          {...register("number", { required: true })}
        />
      </div>
      <div className="w-28">
        <label className="label text-xs">Seats</label>
        <input
          type="number"
          min={1}
          className="input-base"
          placeholder="e.g. 4"
          {...register("seats")}
        />
      </div>
      <div className="flex gap-2 pb-0.5">
        <button type="submit" disabled={isPending} className="btn-primary btn-sm">
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}{" "}
          Add
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Edit table form ─── */
function TableEditForm({
  table,
  onSave,
  onCancel,
  isPending,
}: {
  table: { id: string; number: number; seats?: number; is_active: boolean };
  onSave: (body: {
    number?: number;
    seats?: number;
    is_active?: boolean;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<TableEditFormData>({
    defaultValues: {
      number: String(table.number),
      seats: table.seats != null ? String(table.seats) : "",
      is_active: table.is_active,
      qr_code: "",
    },
  });
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onSave({
          number: parseInt(d.number, 10),
          seats: d.seats ? parseInt(d.seats, 10) : undefined,
          is_active: d.is_active,
        })
      )}
      className="flex flex-wrap items-end gap-3"
    >
      <div className="w-28">
        <label className="label text-xs">Table #</label>
        <input
          type="number"
          className="input-base"
          {...register("number", { required: true })}
        />
      </div>
      <div className="w-28">
        <label className="label text-xs">Seats</label>
        <input type="number" className="input-base" {...register("seats")} />
      </div>
      <div className="flex items-center gap-2 pb-2.5">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-teal-600"
          {...register("is_active")}
        />
        <span className="text-sm text-slate-700">Active</span>
      </div>
      <div className="flex gap-2 pb-0.5">
        <button type="submit" disabled={isPending} className="btn-primary btn-sm">
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}{" "}
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
