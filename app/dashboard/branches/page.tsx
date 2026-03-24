"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/contexts";
import {
  fetchBranches, createBranch, updateBranch, deleteBranch,
  getApiError,
} from "@/lib/api";
import { useForm } from "react-hook-form";
import {
  MapPin, Loader2, Plus, Pencil, Trash2,
  ChevronRight, X, Check,
  Phone, Home, ShieldAlert,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BranchForm { name: string; address: string; phone: string; is_active: boolean; }

export default function BranchesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: branches, isLoading, error } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    enabled: !!user?.merchant_id && user?.role === "owner",
  });

  const createBranchMut = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setCreating(false);
      toast.success("Branch created.");
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const updateBranchMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateBranch>[1] }) => updateBranch(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setEditingBranch(null);
      toast.success("Branch updated.");
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const deleteBranchMut = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch deleted.");
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  if (user?.role !== "owner") {
    return (
      <div className="alert-warning flex items-start gap-3 rounded-xl">
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        Only owners can manage branches.
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--system-primary)" }} />
          <p className="text-sm text-slate-500">Loading branches…</p>
        </div>
      </div>
    );

  if (error) return <div className="alert-error rounded-xl">{getApiError(error)}</div>;

  const branchCount = branches?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "var(--system-primary-soft)" }}
          >
            <MapPin className="h-6 w-6" style={{ color: "var(--system-primary)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Branches</h1>
            <p className="text-sm text-slate-500">
              {branchCount} branch{branchCount !== 1 ? "es" : ""} · Manage locations, tables, and QR codes
            </p>
          </div>
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="btn-primary shrink-0"
          >
            <Plus className="h-4 w-4" /> New branch
          </button>
        )}
      </div>

      {/* Create branch form */}
      {creating && (
        <div className="form-card">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-title flex items-center gap-2" style={{ color: "var(--system-primary)" }}>
              <Building2 className="h-5 w-5" /> New branch
            </h2>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="btn-ghost rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <BranchForm
            onSubmit={(data) => createBranchMut.mutate(data)}
            onCancel={() => setCreating(false)}
            isPending={createBranchMut.isPending}
          />
        </div>
      )}

      {/* Branch list */}
      {!branches || branches.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--system-primary-soft)" }}>
            <MapPin className="h-10 w-10" style={{ color: "var(--system-primary)" }} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">No branches yet</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Create your first branch to manage tables, orders, and QR codes per location.
          </p>
          {!creating && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="btn-primary mt-8"
            >
              <Plus className="h-4 w-4" /> New branch
            </button>
          )}
        </div>
      ) : (
        <div>
          <h2 className="section-title mb-4">All branches</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="card overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <Link
                      href={`/dashboard/branches/${branch.id}`}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: "var(--system-primary-soft)", color: "var(--system-primary)" }}
                      >
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 truncate">{branch.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                          {branch.address && (
                            <span className="flex items-center gap-1 truncate">
                              <Home className="h-3 w-3 shrink-0" /> {branch.address}
                            </span>
                          )}
                          {branch.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 shrink-0" /> {branch.phone}
                            </span>
                          )}
                        </div>
                        {!branch.is_active && (
                          <span className="badge badge-neutral mt-2">Inactive</span>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                    </Link>
                    <div className="flex shrink-0 items-center gap-0.5" onClick={(e) => e.preventDefault()}>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingBranch(editingBranch === branch.id ? null : branch.id); }}
                        className={`rounded-lg p-2 transition-colors ${
                          editingBranch === branch.id ? "text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        }`}
                        style={editingBranch === branch.id ? { backgroundColor: "var(--system-primary)" } : undefined}
                        title="Edit branch"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (confirm("Delete this branch and all its tables?")) deleteBranchMut.mutate(branch.id);
                        }}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete branch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline edit branch */}
                {editingBranch === branch.id && (
                  <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4">
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">Edit branch</h3>
                    <BranchForm
                      defaultValues={{
                        name: branch.name,
                        address: branch.address ?? "",
                        phone: branch.phone ?? "",
                        is_active: branch.is_active,
                      }}
                      onSubmit={(body) => updateBranchMut.mutate({ id: branch.id, body })}
                      onCancel={() => setEditingBranch(null)}
                      isPending={updateBranchMut.isPending}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Branch form (create + edit) ─── */
function BranchForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: {
  defaultValues?: { name: string; address: string; phone: string; is_active: boolean };
  onSubmit: (data: { name: string; address?: string | null; phone?: string | null; is_active?: boolean }) => void;
  onCancel?: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, reset } = useForm<BranchForm>({
    defaultValues: defaultValues ?? { name: "", address: "", phone: "", is_active: true },
  });
  return (
    <form
      onSubmit={handleSubmit((d) => {
        onSubmit({ name: d.name, address: d.address || null, phone: d.phone || null, is_active: d.is_active });
        if (!defaultValues) reset();
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Branch name *</label>
          <input className="input-base" placeholder="e.g. Downtown" {...register("name", { required: true })} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input-base" placeholder="+20 100 000 0000" {...register("phone")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Address</label>
          <input className="input-base" placeholder="Street, City" {...register("address")} />
        </div>
        <div className="flex items-center gap-2.5 sm:col-span-2">
          <input
            type="checkbox"
            id="branch_active"
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            {...register("is_active")}
          />
          <label htmlFor="branch_active" className="text-sm font-medium text-slate-700">
            Active
          </label>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {defaultValues ? "Save changes" : "Create branch"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

