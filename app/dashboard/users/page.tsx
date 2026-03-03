"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import {
  fetchUsers,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserPassword,
  deleteUser,
  getApiError,
} from "@/lib/api";
import { fetchBranches } from "@/lib/api";
import type { UserRole } from "@/lib/types";
import { useForm } from "react-hook-form";
import { Users as UsersIcon, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface UserForm {
  name: string;
  password: string;
  role: UserRole;
  branch_id: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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
    mutationFn: (body: { name: string; password: string; role: UserRole; branch_id?: string | null }) =>
      createUser({
        merchant_id: currentUser!.merchant_id,
        name: body.name,
        password: body.password,
        role: body.role,
        branch_id: body.branch_id || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setMessage({ type: "ok", text: "User created." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const updateMut = useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: string;
      body: { name?: string; role?: UserRole; branch_id?: string | null };
    }) => updateUser(userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingId(null);
      setMessage({ type: "ok", text: "User updated." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const statusMut = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "active" | "disabled" }) =>
      updateUserStatus(userId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingId(null);
      setMessage({ type: "ok", text: "User deleted." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  if (currentUser?.role !== "owner") {
    return (
      <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
        Only owners can manage users.
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

  const roles: UserRole[] = ["owner", "manager", "cashier", "kitchen"];

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-zinc-800">
        <UsersIcon className="h-7 w-7 text-teal-600" />
        Users
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

      <div className="mb-6">
        <CreateUserForm
          branches={branches ?? []}
          onSubmit={(data) =>
            createMut.mutate({
              name: data.name,
              password: data.password,
              role: data.role,
              branch_id: data.branch_id || null,
            })
          }
          isPending={createMut.isPending}
        />
      </div>

      <ul className="space-y-2">
        {users?.map((u) => (
          <li
            key={u.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white p-4"
          >
            <div>
              <span className="font-medium text-zinc-800">{u.name}</span>
              <span className="ml-2 rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {u.role}
              </span>
              {u.status !== "active" && (
                <span className="ml-2 text-sm text-amber-600">({u.status})</span>
              )}
              {u.branch_id && (
                <span className="ml-2 text-sm text-zinc-500">
                  Branch: {branches?.find((b) => b.id === u.branch_id)?.name ?? u.branch_id}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {u.status === "active" ? (
                <button
                  type="button"
                  onClick={() => statusMut.mutate({ userId: u.id, status: "disabled" })}
                  className="text-sm text-amber-600 hover:underline"
                >
                  Disable
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => statusMut.mutate({ userId: u.id, status: "active" })}
                  className="text-sm text-green-600 hover:underline"
                >
                  Enable
                </button>
              )}
              {u.role !== "owner" && u.id !== currentUser?.id && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditingId(editingId === u.id ? null : u.id)}
                    className="rounded p-2 text-zinc-500 hover:bg-zinc-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this user?")) deleteMut.mutate(u.id);
                    }}
                    className="rounded p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            {editingId === u.id && (
              <EditUserForm
                user={u}
                branches={branches ?? []}
                onSave={(body) => updateMut.mutate({ userId: u.id, body })}
                onCancel={() => setEditingId(null)}
                isPending={updateMut.isPending}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreateUserForm({
  branches,
  onSubmit,
  isPending,
}: {
  branches: { id: string; name: string }[];
  onSubmit: (data: UserForm) => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<UserForm>({
    defaultValues: { role: "cashier" },
  });
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-dashed border-zinc-300 bg-white p-4"
    >
      <h3 className="mb-3 font-medium text-zinc-800">Create user</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Name *</label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("name", { required: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Password *</label>
          <input
            type="password"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("password", { required: true, minLength: 6 })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Role *</label>
          <select
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("role", { required: true })}
          >
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
            <option value="kitchen">Kitchen</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Branch</label>
          <select
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("branch_id")}
          >
            <option value="">—</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Create user
      </button>
    </form>
  );
}

function EditUserForm({
  user,
  branches,
  onSave,
  onCancel,
  isPending,
}: {
  user: { name: string; role: UserRole; branch_id: string | null };
  branches: { id: string; name: string }[];
  onSave: (body: { name?: string; role?: UserRole; branch_id?: string | null }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<UserForm>({
    defaultValues: {
      name: user.name,
      role: user.role,
      branch_id: user.branch_id ?? "",
      password: "",
    },
  });
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onSave({
          name: d.name,
          role: d.role,
          branch_id: d.branch_id || null,
        })
      )}
      className="mt-3 w-full border-t border-zinc-100 pt-3"
    >
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Name</label>
          <input
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
            {...register("name")}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Role</label>
          <select
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
            {...register("role")}
          >
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
            <option value="kitchen">Kitchen</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Branch</label>
          <select
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
            {...register("branch_id")}
          >
            <option value="">—</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-teal-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-zinc-300 px-3 py-1.5 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
