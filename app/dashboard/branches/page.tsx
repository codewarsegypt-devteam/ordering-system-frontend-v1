"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import {
  fetchBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  fetchBranchTables,
  createTable,
  getApiError,
} from "@/lib/api";
import {
  fetchTableQr,
  updateTable,
  deleteTable,
} from "@/lib/api/tables";
import { useForm } from "react-hook-form";
import {
  MapPin,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  QrCode,
} from "lucide-react";
import { useState } from "react";

interface BranchForm {
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
}

interface TableForm {
  number: string;
  seats: string;
  qr_code: string;
}

interface TableEditFormData {
  number: string;
  seats: string;
  is_active: boolean;
  qr_code: string;
}

export default function BranchesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [addingTableBranch, setAddingTableBranch] = useState<string | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [qrTableId, setQrTableId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data: branches, isLoading, error } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    enabled: !!user?.merchant_id && user?.role === "owner",
  });

  const { data: tables, isLoading: tablesLoading } = useQuery({
    queryKey: ["branchTables", expandedBranch],
    queryFn: () => fetchBranchTables(expandedBranch!),
    enabled: !!expandedBranch,
  });

  const { data: qrData } = useQuery({
    queryKey: ["tableQr", qrTableId],
    queryFn: () => fetchTableQr(qrTableId!),
    enabled: !!qrTableId,
  });

  const createBranchMut = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setMessage({ type: "ok", text: "Branch created." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const updateBranchMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateBranch>[1] }) =>
      updateBranch(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setEditingBranch(null);
      setMessage({ type: "ok", text: "Branch updated." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const deleteBranchMut = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setExpandedBranch(null);
      setMessage({ type: "ok", text: "Branch deleted." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const createTableMut = useMutation({
    mutationFn: ({
      branchId,
      body,
    }: {
      branchId: string;
      body: { number: number; seats?: number; is_active?: boolean; qr_code?: string | null };
    }) => createTable(branchId, { ...body, is_active: true }),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ["branchTables", branchId] });
      setAddingTableBranch(null);
      setMessage({ type: "ok", text: "Table created." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const updateTableMut = useMutation({
    mutationFn: ({
      tableId,
      body,
    }: {
      tableId: string;
      body: { number?: number; seats?: number; is_active?: boolean; qr_code?: string | null };
    }) => updateTable(tableId, body),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: ["branchTables", expandedBranch] });
      setEditingTableId(null);
      setMessage({ type: "ok", text: "Table updated." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const deleteTableMut = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branchTables", expandedBranch] });
      setMessage({ type: "ok", text: "Table deleted." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  if (user?.role !== "owner") {
    return (
      <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
        Only owners can manage branches.
      </div>
    );
  }

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

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-zinc-800">
        <MapPin className="h-7 w-7 text-teal-600" />
        Branches
      </h1>

      {message && (
        <div
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        {branches?.map((branch) => (
          <div
            key={branch.id}
            className="rounded-xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between p-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedBranch(expandedBranch === branch.id ? null : branch.id)
                }
                className="flex items-center gap-2 text-left font-medium text-zinc-800"
              >
                {expandedBranch === branch.id ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {branch.name}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBranch(editingBranch === branch.id ? null : branch.id)}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-teal-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this branch?")) deleteBranchMut.mutate(branch.id);
                  }}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {editingBranch === branch.id && (
              <BranchEditForm
                branch={branch}
                onSave={(body) => updateBranchMut.mutate({ id: branch.id, body })}
                onCancel={() => setEditingBranch(null)}
                isPending={updateBranchMut.isPending}
              />
            )}

            {expandedBranch === branch.id && (
              <div className="border-t border-zinc-100 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-600">Tables</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setAddingTableBranch(addingTableBranch === branch.id ? null : branch.id)
                    }
                    className="flex items-center gap-1 rounded-lg bg-teal-600 px-2 py-1 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add table
                  </button>
                </div>
                {addingTableBranch === branch.id && (
                  <AddTableForm
                    onAdd={(number, seats, qrCode) =>
                      createTableMut.mutate({
                        branchId: branch.id,
                        body: {
                          number,
                          seats: seats ? parseInt(seats, 10) : undefined,
                          qr_code: qrCode || null,
                        },
                      })
                    }
                    onCancel={() => setAddingTableBranch(null)}
                    isPending={createTableMut.isPending}
                  />
                )}
                {tablesLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                ) : (
                  <ul className="space-y-2">
                    {(tables ?? []).map((t) => (
                      <li
                        key={t.id}
                        className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2"
                      >
                        {editingTableId === t.id ? (
                          <TableEditForm
                            table={t}
                            onSave={(body) =>
                              updateTableMut.mutate({ tableId: t.id, body })
                            }
                            onCancel={() => setEditingTableId(null)}
                            isPending={updateTableMut.isPending}
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">Table #{t.number}</span>
                              {t.seats != null && (
                                <span className="text-sm text-zinc-500">
                                  {t.seats} seats
                                </span>
                              )}
                              {t.qr_code && (
                                <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs text-zinc-600">
                                  {t.qr_code}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setQrTableId(qrTableId === t.id ? null : t.id)
                                }
                                className="flex items-center gap-1 rounded p-1.5 text-sm text-teal-600 hover:bg-teal-50"
                                title="View QR code"
                              >
                                <QrCode className="h-4 w-4" />
                                QR
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTableId(t.id)}
                                className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-teal-600"
                                title="Edit table"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("Delete this table?"))
                                    deleteTableMut.mutate(t.id);
                                }}
                                className="rounded p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                                title="Delete table"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                    {(!tables || tables.length === 0) && !addingTableBranch && (
                      <li className="text-sm text-zinc-500">No tables</li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <CreateBranchForm
          onSubmit={(data) => createBranchMut.mutate(data)}
          isPending={createBranchMut.isPending}
        />
      </div>

      {qrData && qrTableId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setQrTableId(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-2 font-medium text-zinc-800">Table QR code</p>
            <p className="mb-3 text-sm text-zinc-500">
              Code: {qrData.table_code || "—"}
            </p>
            {qrData.qr_svg ? (
              <div
                className="mx-auto mb-3 flex justify-center [&>svg]:h-48 [&>svg]:w-48"
                dangerouslySetInnerHTML={{ __html: qrData.qr_svg }}
              />
            ) : (
              <div className="mx-auto mb-3 flex h-48 w-48 items-center justify-center rounded border border-zinc-200 bg-zinc-50 text-sm text-zinc-500">
                No QR image
              </div>
            )}
            {qrData.qr_url && (
              <p className="mb-2 break-all text-xs text-zinc-500">
                Link:{" "}
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
            <button
              type="button"
              onClick={() => setQrTableId(null)}
              className="mt-4 w-full rounded-lg border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BranchEditForm({
  branch,
  onSave,
  onCancel,
  isPending,
}: {
  branch: { name: string; address?: string | null; phone?: string | null; is_active: boolean };
  onSave: (body: { name?: string; address?: string | null; phone?: string | null; is_active?: boolean }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<BranchForm>({
    defaultValues: {
      name: branch.name,
      address: branch.address ?? "",
      phone: branch.phone ?? "",
      is_active: branch.is_active,
    },
  });
  return (
    <form
      onSubmit={handleSubmit((d) => onSave({ name: d.name, address: d.address || null, phone: d.phone || null, is_active: d.is_active }))}
      className="border-t border-zinc-100 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Name</label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("name")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Phone</label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("phone")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-700">Address</label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("address")}
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("is_active")} />
          <label className="text-sm text-zinc-700">Active</label>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm">
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
  table: { id: string; number: number; seats?: number; is_active: boolean; qr_code?: string | null };
  onSave: (body: {
    number?: number;
    seats?: number;
    is_active?: boolean;
    qr_code?: string | null;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<TableEditFormData>({
    defaultValues: {
      number: String(table.number),
      seats: table.seats != null ? String(table.seats) : "",
      is_active: table.is_active,
      qr_code: table.qr_code ?? "",
    },
  });
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onSave({
          number: parseInt(d.number, 10),
          seats: d.seats ? parseInt(d.seats, 10) : undefined,
          is_active: d.is_active,
          qr_code: d.qr_code || null,
        })
      )}
      className="space-y-2 py-1"
    >
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Number</label>
          <input
            type="number"
            className="w-20 rounded border border-zinc-300 px-2 py-1.5 text-sm"
            {...register("number", { required: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Seats</label>
          <input
            type="number"
            className="w-20 rounded border border-zinc-300 px-2 py-1.5 text-sm"
            {...register("seats")}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">QR code</label>
          <input
            className="w-28 rounded border border-zinc-300 px-2 py-1.5 text-sm"
            placeholder="e.g. T1"
            {...register("qr_code")}
          />
        </div>
        <div className="flex items-center gap-1">
          <input type="checkbox" {...register("is_active")} />
          <label className="text-xs text-zinc-600">Active</label>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-teal-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm"
        >
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
  onAdd: (number: number, seats?: string, qrCode?: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<TableForm>();
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onAdd(
          parseInt(d.number, 10),
          d.seats || undefined,
          d.qr_code?.trim() || undefined
        )
      )}
      className="mb-3 flex flex-wrap items-end gap-2 rounded-lg bg-teal-50 p-3"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Number</label>
        <input
          type="number"
          className="w-24 rounded border border-zinc-300 px-2 py-1.5 text-sm"
          {...register("number", { required: true })}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Seats</label>
        <input
          type="number"
          className="w-20 rounded border border-zinc-300 px-2 py-1.5 text-sm"
          {...register("seats")}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">QR code</label>
        <input
          className="w-24 rounded border border-zinc-300 px-2 py-1.5 text-sm"
          placeholder="e.g. T1"
          {...register("qr_code")}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-teal-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Add
      </button>
      <button type="button" onClick={onCancel} className="rounded border border-zinc-300 px-3 py-1.5 text-sm">
        Cancel
      </button>
    </form>
  );
}

function CreateBranchForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: { name: string; address?: string; phone?: string; is_active?: boolean }) => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, reset } = useForm<BranchForm>();
  return (
    <form
      onSubmit={handleSubmit((d) => {
        onSubmit({
          name: d.name,
          address: d.address || undefined,
          phone: d.phone || undefined,
          is_active: d.is_active,
        });
        reset();
      })}
      className="rounded-xl border border-dashed border-zinc-300 bg-white p-4"
    >
      <h3 className="mb-3 font-medium text-zinc-800">Create branch</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Name *</label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("name", { required: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Phone</label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("phone")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-700">Address</label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("address")}
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("is_active")} defaultChecked />
          <label className="text-sm text-zinc-700">Active</label>
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Create branch
      </button>
    </form>
  );
}
