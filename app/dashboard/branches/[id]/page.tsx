"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts";
import {
  createTable,
  deleteBranch,
  fetchBranches,
  fetchBranchTables,
  getApiError,
  updateBranch,
} from "@/lib/api";
import { deleteTable, fetchTableQr, updateTable } from "@/lib/api/tables";
import type { BranchDto, TableDto } from "@/lib/api/branches";
import {
  ArrowLeft,
  Check,
  Download,
  Home,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  QrCode,
  ShieldAlert,
  TableProperties,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface BranchFormData {
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
}

interface TableFormData {
  number: string;
  seats: string;
}

interface TableEditFormData {
  number: string;
  seats: string;
  is_active: boolean;
}

export default function BranchTablesPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const branchId = String(params?.id ?? "");

  const [editingBranch, setEditingBranch] = useState(false);
  const [addingTable, setAddingTable] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [qrTableId, setQrTableId] = useState<string | null>(null);

  const {
    data: branches,
    isLoading: branchesLoading,
    error: branchesError,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    enabled: !!user?.merchant_id && user?.role === "owner",
  });

  const branch = branches?.find((item) => String(item.id) === branchId);

  const {
    data: tables,
    isLoading: tablesLoading,
    error: tablesError,
  } = useQuery({
    queryKey: ["branchTables", branchId],
    queryFn: () => fetchBranchTables(branchId),
    enabled: !!branchId && !!branch,
  });
  console.log(tables);
  const { data: qrData } = useQuery({
    queryKey: ["tableQr", qrTableId],
    queryFn: () => fetchTableQr(qrTableId!),
    enabled: !!qrTableId,
  });

  const setBranchesCache = (
    updater: (current: BranchDto[] | undefined) => BranchDto[] | undefined,
  ) => {
    queryClient.setQueryData<BranchDto[]>(["branches"], updater);
  };

  const setTablesCache = (
    updater: (current: TableDto[] | undefined) => TableDto[] | undefined,
  ) => {
    queryClient.setQueryData<TableDto[]>(["branchTables", branchId], updater);
  };

  const updateBranchMut = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof updateBranch>[1];
    }) => updateBranch(id, body),
    onSuccess: (updatedBranch) => {
      setBranchesCache(
        (current) =>
          current?.map((item) =>
            String(item.id) === String(updatedBranch.id) ? updatedBranch : item,
          ) ?? current,
      );
      setEditingBranch(false);
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch updated.");
    },
    onError: (error) => toast.error(getApiError(error)),
  });

  const deleteBranchMut = useMutation({
    mutationFn: deleteBranch,
    onSuccess: (_, deletedId) => {
      setBranchesCache(
        (current) =>
          current?.filter((item) => String(item.id) !== String(deletedId)) ??
          current,
      );
      queryClient.removeQueries({
        queryKey: ["branchTables", String(deletedId)],
      });
      toast.success("Branch deleted.");
      router.push("/dashboard/branches");
    },
    onError: (error) => toast.error(getApiError(error)),
  });

  const createTableMut = useMutation({
    mutationFn: ({
      branchId,
      body,
    }: {
      branchId: string;
      body: {
        number: string;
        seats?: number;
        is_active?: boolean;
        qr_code?: string | null;
      };
    }) => createTable(branchId, { ...body, is_active: true }),
    onSuccess: (createdTable) => {
      setTablesCache((current) =>
        current ? [...current, createdTable] : [createdTable],
      );
      setAddingTable(false);
      queryClient.invalidateQueries({ queryKey: ["branchTables", branchId] });
      toast.success("Table created.");
    },
    onError: (error) => toast.error(getApiError(error)),
  });

  const updateTableMut = useMutation({
    mutationFn: ({
      tableId,
      body,
    }: {
      tableId: string;
      body: {
        number?: string;
        seats?: number;
        is_active?: boolean;
        qr_code?: string | null;
      };
    }) => updateTable(tableId, body),
    onSuccess: (updatedTable) => {
      setTablesCache(
        (current) =>
          current?.map((item) =>
            String(item.id) === String(updatedTable.id) ? updatedTable : item,
          ) ?? current,
      );
      setEditingTableId(null);
      queryClient.invalidateQueries({ queryKey: ["branchTables", branchId] });
      toast.success("Table updated.");
    },
    onError: (error) => toast.error(getApiError(error)),
  });

  const deleteTableMut = useMutation({
    mutationFn: deleteTable,
    onSuccess: (_, deletedId) => {
      setTablesCache(
        (current) =>
          current?.filter((item) => String(item.id) !== String(deletedId)) ??
          current,
      );
      setEditingTableId((current) =>
        String(current) === String(deletedId) ? null : current,
      );
      setQrTableId((current) =>
        String(current) === String(deletedId) ? null : current,
      );
      queryClient.invalidateQueries({ queryKey: ["branchTables", branchId] });
      toast.success("Table deleted.");
    },
    onError: (error) => toast.error(getApiError(error)),
  });

  if (user?.role !== "owner") {
    return (
      <div className="alert-warning flex items-start gap-3 rounded-xl">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        Only owners can manage branches and tables.
      </div>
    );
  }

  if (branchesLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (branchesError) {
    return (
      <div className="alert-error rounded-xl">{getApiError(branchesError)}</div>
    );
  }

  if (!branchId || !branch) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/branches"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-teal-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to branches
        </Link>
        <div className="alert-error rounded-xl">Branch not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/branches"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to branches
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-teal-200/60 bg-linear-to-br from-system-primary to-system-primary  px-6 py-8 text-white shadow-lg shadow-teal-900/10 sm:px-8">
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
              onClick={() => setEditingBranch((current) => !current)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-medium backdrop-blur transition-colors hover:bg-white/20"
            >
              <Pencil className="h-4 w-4" /> Edit branch
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this branch and all its tables?")) {
                  deleteBranchMut.mutate(String(branch.id));
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500/90 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-red-500"
            >
              <Trash2 className="h-4 w-4" /> Delete branch
            </button>
          </div>
        </div>
      </div>

      {editingBranch && (
        <div className="form-card border-teal-200/60 bg-slate-50/50">
          <h2 className="section-title mb-4">Edit branch</h2>
          <BranchEditForm
            branch={branch}
            isPending={updateBranchMut.isPending}
            onCancel={() => setEditingBranch(false)}
            onSubmit={(body) =>
              updateBranchMut.mutate({ id: String(branch.id), body })
            }
          />
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
              <TableProperties className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Tables</h2>
              <p className="text-sm text-slate-500">
                {tables?.length ?? 0} table
                {(tables?.length ?? 0) === 1 ? "" : "s"} in this branch
              </p>
            </div>
          </div>

          {!addingTable && (
            <button
              type="button"
              onClick={() => setAddingTable(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" /> Add table
            </button>
          )}
        </div>

        {addingTable && (
          <div className="border-b border-slate-100 bg-teal-50/30 px-6 py-4">
            <AddTableForm
              isPending={createTableMut.isPending}
              onCancel={() => setAddingTable(false)}
              onAdd={(number, seats) =>
                createTableMut.mutate({
                  branchId: String(branch.id),
                  body: {
                    number,
                    seats: seats ? parseInt(seats, 10) : undefined,
                  },
                })
              }
            />
          </div>
        )}

        {tablesLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-system-primary" />
          </div>
        ) : tablesError ? (
          <div className="px-6 py-8">
            <div className="alert-error rounded-xl">
              {getApiError(tablesError)}
            </div>
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
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tables.map((table) => (
              <div
                key={table.id}
                className="group flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80"
              >
                {editingTableId === String(table.id) ? (
                  <div className="w-full rounded-xl bg-white p-4 shadow-sm">
                    <TableEditForm
                      table={table}
                      isPending={updateTableMut.isPending}
                      onCancel={() => setEditingTableId(null)}
                      onSave={(body) =>
                        updateTableMut.mutate({
                          tableId: String(table.id),
                          body,
                        })
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-700">
                        #{table.number}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          Table {table.number}
                        </p>
                        <p className="text-sm text-slate-500">
                          {table.seats != null
                            ? `${table.seats} seats`
                            : "Seats not set"}
                        </p>
                      </div>
                      {table.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-neutral">Inactive</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setQrTableId((current) =>
                            String(current) === String(table.id)
                              ? null
                              : String(table.id),
                          )
                        }
                        className="rounded-lg p-2.5 text-system-primary transition-colors hover:bg-teal-50"
                        title="View QR"
                      >
                        <QrCode className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTableId(String(table.id))}
                        className="rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this table?")) {
                            deleteTableMut.mutate(String(table.id));
                          }
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

      {qrData && qrTableId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setQrTableId(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
                  <QrCode className="h-5 w-5 text-system-primary" />
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
                    className="text-system-primary hover:underline"
                  >
                    {qrData.qr_url}
                  </a>
                </p>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              {qrData.qr_svg && (
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([qrData.qr_svg!], {
                      type: "image/svg+xml",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `table-${qrData.table_code || qrTableId}-qr.svg`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("QR code downloaded");
                  }}
                  className="btn-primary flex-1 justify-center"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              )}
              <button
                type="button"
                onClick={() => setQrTableId(null)}
                className="btn-secondary flex-1 justify-center"
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

function BranchEditForm({
  branch,
  onSubmit,
  onCancel,
  isPending,
}: {
  branch: {
    name: string;
    address?: string | null;
    phone?: string | null;
    is_active: boolean;
  };
  onSubmit: (data: {
    name: string;
    address?: string | null;
    phone?: string | null;
    is_active?: boolean;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<BranchFormData>({
    defaultValues: {
      name: branch.name,
      address: branch.address ?? "",
      phone: branch.phone ?? "",
      is_active: branch.is_active,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit({
          name: data.name,
          address: data.address || null,
          phone: data.phone || null,
          is_active: data.is_active,
        }),
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
            id="branch_active_edit"
            type="checkbox"
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
          )}
          Save changes
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddTableForm({
  onAdd,
  onCancel,
  isPending,
}: {
  onAdd: (number: string, seats?: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, reset } = useForm<TableFormData>({
    defaultValues: {
      number: "",
      seats: "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onAdd(data.number, data.seats || undefined);
        reset();
      })}
      className="flex flex-wrap items-end gap-3"
    >
      <div className="w-28">
        <label className="label text-xs">Table # *</label>
        <input
          type="text"
          className="input-base"
          placeholder="e.g. 5 or A1"
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
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary btn-sm"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary btn-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function TableEditForm({
  table,
  onSave,
  onCancel,
  isPending,
}: {
  table: { id: string; number: string; seats?: number; is_active: boolean };
  onSave: (body: {
    number?: string;
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
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSave({
          number: data.number,
          seats: data.seats ? parseInt(data.seats, 10) : undefined,
          is_active: data.is_active,
        }),
      )}
      className="flex flex-wrap items-end gap-3"
    >
      <div className="w-28">
        <label className="label text-xs">Table #</label>
        <input
          type="text"
          className="input-base"
          placeholder="e.g. 5 or A1"
          {...register("number", { required: true })}
        />
      </div>
      <div className="w-28">
        <label className="label text-xs">Seats</label>
        <input
          type="number"
          min={1}
          className="input-base"
          {...register("seats")}
        />
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
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary btn-sm"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary btn-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
