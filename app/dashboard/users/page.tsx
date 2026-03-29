"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import {
  fetchUsers, createUser, updateUser,
  updateUserStatus, deleteUser, getApiError,
} from "@/lib/api";
import { fetchBranches } from "@/lib/api";
import type { UserRole } from "@/lib/types";
import { useForm, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  formSelectTriggerClassName,
} from "@/components/ui/select";
import {
  Users as UsersIcon, Loader2, Plus, Pencil, Trash2,
  Check, X, ShieldAlert, UserCircle2, MapPin,
  ToggleLeft, ToggleRight, KeyRound, Mail,
} from "lucide-react";
import { UsersPageSkeleton } from "@/components/dashboard/UsersPageSkeleton";
import { Fragment, useState } from "react";
import { toast } from "sonner";

interface CreateUserFormValues {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branch_id: string;
}

interface EditUserFormValues {
  name: string;
  role: UserRole;
  branch_id: string;
}

const roleBadge: Record<string, string> = {
  owner:   "badge bg-violet-100 text-violet-700",
  manager: "badge bg-sky-100 text-sky-700",
  cashier: "badge bg-amber-100 text-amber-700",
  kitchen: "badge bg-orange-100 text-orange-700",
  waiter:  "badge bg-teal-100 text-teal-800",
};

const roleAvatar: Record<string, string> = {
  owner:   "bg-violet-600",
  manager: "bg-sky-600",
  cashier: "bg-amber-500",
  kitchen: "bg-orange-500",
  waiter:  "bg-teal-600",
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: !!currentUser?.merchant_id && currentUser?.role === "owner",
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    enabled: !!currentUser?.merchant_id,
  });

  const createMut = useMutation({
    mutationFn: (body: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      branch_id?: string | null;
    }) =>
      createUser({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        password: body.password,
        role: body.role,
        branch_id: body.branch_id ? Number(body.branch_id) : null,
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); setCreating(false); toast.success("User created."); },
    onError: (e) => toast.error(getApiError(e)),
  });

  const updateMut = useMutation({
    mutationFn: ({ userId, body }: { userId: number; body: { name?: string; role?: UserRole; branch_id?: string | null } }) =>
      updateUser(String(userId), body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); setEditingId(null); toast.success("User updated."); },
    onError: (e) => toast.error(getApiError(e)),
  });

  const statusMut = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "active" | "disabled" }) => updateUserStatus(userId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (e) => toast.error(getApiError(e)),
  });

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); setEditingId(null); toast.success("User deleted."); },
    onError: (e) => toast.error(getApiError(e)),
  });

  if (currentUser?.role !== "owner") {
    return (
      <div className="alert-warning flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        Only owners can manage users.
      </div>
    );
  }

  if (isLoading) return <UsersPageSkeleton />;

  if (error) return <div className="alert-error">{getApiError(error)}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "var(--system-primary-soft)" }}
          >
            <UsersIcon className="h-6 w-6" style={{ color: "var(--system-primary)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Users</h1>
            <p className="text-sm text-slate-500">{users?.length ?? 0} team member{users?.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {!creating && (
          <button type="button" onClick={() => setCreating(true)} className="btn-primary shrink-0">
            <Plus className="h-4 w-4" /> New user
          </button>
        )}
      </div>

      {/* Create user form */}
      {creating && (
        <div className="form-card">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="section-title">New user</h2>
              <p className="mt-0.5 text-xs text-slate-500">Invite a team member to your merchant account.</p>
            </div>
            <button type="button" onClick={() => setCreating(false)} className="btn-ghost p-1.5">
              <X className="h-4 w-4" />
            </button>
          </div>
          <CreateUserForm
            branches={branches ?? []}
            onSubmit={(data) =>
              createMut.mutate({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                branch_id: data.branch_id || null,
              })
            }
            onCancel={() => setCreating(false)}
            isPending={createMut.isPending}
          />
        </div>
      )}

      {/* Users table */}
      {!users || users.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--system-primary-soft)" }}>
            <UsersIcon className="h-8 w-8" style={{ color: "var(--system-primary)" }} />
          </div>
          <p className="font-medium text-slate-700">No users yet</p>
          <p className="mt-1 text-sm text-slate-400">Create your first team member above.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th className="hidden md:table-cell">Branch</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) =>
                u.role !== "owner" ? (
                <Fragment key={u.id}>
                  <tr className={editingId === Number(u.id) ? "bg-slate-50" : ""}>
                    {/* Avatar + name */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${roleAvatar[u.role] ?? "bg-slate-500"}`}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 leading-tight">
                            {u.name}
                            {u.id === currentUser?.id && (
                              <span className="ml-1.5 text-[10px] font-medium text-teal-600">(you)</span>
                            )}
                          </p>
                          {u.email ? (
                            <p className="text-xs text-slate-500">{u.email}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td>
                      <span className={roleBadge[u.role] ?? "badge badge-neutral"}>
                        {u.role}
                      </span>
                    </td>

                    {/* Branch */}
                    <td className="hidden md:table-cell">
                      {u.branch_id != null ? (
                        <span className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {branches?.find((b) => String(b.id) === String(u.branch_id))?.name ?? `#${u.branch_id}`}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      {u.status === "active"
                        ? <span className="badge badge-success">Active</span>
                        : <span className="badge badge-neutral">Disabled</span>
                      }
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle status */}
                        <button
                          type="button"
                          onClick={() => statusMut.mutate({ userId: String(u.id), status: u.status === "active" ? "disabled" : "active" })}
                          disabled={statusMut.isPending}
                          className={`btn-ghost p-1.5 ${u.status === "active" ? "text-amber-500 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                          title={u.status === "active" ? "Disable user" : "Enable user"}
                        >
                          {u.status === "active" ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                        </button>

                        {/* Edit / delete (not for owner or self) */}
                        {u.id !== currentUser?.id && (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingId(editingId === Number(u.id) ? null : Number(u.id))}
                              className={`btn-ghost p-1.5 ${editingId === Number(u.id) ? "bg-slate-100" : ""}`}
                              title="Edit user"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => { if (confirm("Delete this user?")) deleteMut.mutate(String(u.id)); }}
                              className="btn-ghost p-1.5 text-red-500 hover:bg-red-50"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Inline edit row */}
                  {editingId === Number(u.id) && (
                    <tr key={`${u.id}-edit`} className="bg-slate-50">
                      <td colSpan={5} className="p-0">
                        <div className="border-t border-slate-200 px-5 py-4">
                          <div className="mb-3 flex items-center gap-2">
                            <Pencil className="h-4 w-4 text-slate-400" />
                            <h3 className="text-sm font-semibold text-slate-700">Edit {u.name}</h3>
                          </div>
                          <EditUserForm
                            user={{ name: u.name, role: u.role, branch_id: u.branch_id != null ? String(u.branch_id) : null }}
                            branches={branches ?? []}
                            onSave={(body) => updateMut.mutate({ userId: Number(u.id), body })}
                            onCancel={() => setEditingId(null)}
                            isPending={updateMut.isPending}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
                ) : null,
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Create user form ─── */
function CreateUserForm({ branches, onSubmit, onCancel, isPending }: {
  branches: { id: string; name: string }[];
  onSubmit: (data: CreateUserFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, reset, control } = useForm<CreateUserFormValues>({
    defaultValues: { role: "cashier", email: "", branch_id: "" },
  });
  return (
    <form onSubmit={handleSubmit((d) => { onSubmit(d); reset(); })}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">
            <span className="flex items-center gap-1.5">
              <UserCircle2 className="h-3.5 w-3.5" /> Display name *
            </span>
          </label>
          <input className="input-base" placeholder="e.g. John Doe" {...register("name", { required: true })} />
        </div>
        <div>
          <label className="label">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email *
            </span>
          </label>
          <input
            type="email"
            autoComplete="email"
            className="input-base"
            placeholder="staff@restaurant.com"
            {...register("email", { required: true })}
          />
        </div>
        <div>
          <label className="label">
            <span className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" /> Password *
            </span>
          </label>
          <input type="password" className="input-base" placeholder="Min 6 characters" {...register("password", { required: true, minLength: 6 })} />
        </div>
        <div>
          <label className="label">Role *</label>
          <Controller
            name="role"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={formSelectTriggerClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="waiter">Waiter</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <label className="label">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Branch
            </span>
          </label>
          <Controller
            name="branch_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? field.value : "__none__"}
                onValueChange={(v) =>
                  field.onChange(v === "__none__" ? "" : v)
                }
              >
                <SelectTrigger className={formSelectTriggerClassName}>
                  <SelectValue placeholder="— No branch —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— No branch —</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Waiters need a branch to see ready orders for that floor.
      </p>
      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <><Check className="h-4 w-4" /> Create user</>}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

/* ─── Edit user form (inline) ─── */
function EditUserForm({ user, branches, onSave, onCancel, isPending }: {
  user: { name: string; role: UserRole; branch_id: string | null };
  branches: { id: string; name: string }[];
  onSave: (body: { name?: string; role?: UserRole; branch_id?: string | null }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, control } = useForm<EditUserFormValues>({
    defaultValues: { name: user.name, role: user.role, branch_id: user.branch_id ?? "" },
  });
  return (
    <form onSubmit={handleSubmit((d) => onSave({ name: d.name, role: d.role, branch_id: d.branch_id || null }))}>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label text-xs">Name</label>
          <input className="input-base" {...register("name")} />
        </div>
        <div>
          <label className="label text-xs">Role</label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={formSelectTriggerClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="waiter">Waiter</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <label className="label text-xs">Branch</label>
          <Controller
            name="branch_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? field.value : "__none__"}
                onValueChange={(v) =>
                  field.onChange(v === "__none__" ? "" : v)
                }
              >
                <SelectTrigger className={formSelectTriggerClassName}>
                  <SelectValue placeholder="— No branch —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— No branch —</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary btn-sm">
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary btn-sm">Cancel</button>
      </div>
    </form>
  );
}
