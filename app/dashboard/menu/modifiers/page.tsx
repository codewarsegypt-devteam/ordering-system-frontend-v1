"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import {
  fetchModifierGroups,
  fetchModifiers,
  createModifierGroup,
  updateModifierGroup,
  deleteModifierGroup,
  createModifier,
  updateModifier,
  deleteModifier,
  getApiError,
} from "@/lib/api";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Plus, Pencil, Trash2, Layers } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const canEditMenu = (role: string) => role === "owner" || role === "manager";

export default function ModifiersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [addingModifierGroupId, setAddingModifierGroupId] = useState<
    string | null
  >(null);
  const [addingModifierGroup, setAddingModifierGroup] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const {
    data: groups,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["modifierGroups"],
    queryFn: fetchModifierGroups,
    enabled: !!user?.merchant_id,
  });

  const { data: modifiers } = useQuery({
    queryKey: ["modifiers", expandedGroupId],
    queryFn: () => fetchModifiers(expandedGroupId!),
    enabled: !!expandedGroupId,
  });

  const createGroupMut = useMutation({
    mutationFn: createModifierGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modifierGroups"] });
      setAddingModifierGroup(false);
      setMessage({ type: "ok", text: "Group created." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const updateGroupMut = useMutation({
    mutationFn: ({
      groupId,
      body,
    }: {
      groupId: string;
      body: Parameters<typeof updateModifierGroup>[1];
    }) => updateModifierGroup(groupId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modifierGroups"] });
      setEditingGroupId(null);
      setMessage({ type: "ok", text: "Group updated." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const deleteGroupMut = useMutation({
    mutationFn: deleteModifierGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modifierGroups"] });
      setExpandedGroupId(null);
      setMessage({ type: "ok", text: "Group deleted." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const [editingModifierId, setEditingModifierId] = useState<string | null>(
    null,
  );

  const createModifierMut = useMutation({
    mutationFn: ({
      groupId,
      body,
    }: {
      groupId: string;
      body: Parameters<typeof createModifier>[1];
    }) => createModifier(groupId, body),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["modifiers", groupId] });
      setAddingModifierGroupId(null);
      setMessage({ type: "ok", text: "Modifier added." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const updateModifierMut = useMutation({
    mutationFn: ({
      modifierId,
      body,
    }: {
      modifierId: string;
      body: Parameters<typeof updateModifier>[1];
    }) => updateModifier(modifierId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["modifiers", expandedGroupId],
      });
      setEditingModifierId(null);
      setMessage({ type: "ok", text: "Modifier updated." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const deleteModifierMut = useMutation({
    mutationFn: deleteModifier,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["modifiers", expandedGroupId],
      }),
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const editable = canEditMenu(user?.role ?? "");

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
      <Link
        href="/dashboard/menu"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to menu
      </Link>
      <h1 className="mb-2 flex items-center gap-2 text-2xl font-semibold text-zinc-800">
        <Layers className="h-7 w-7 text-teal-600" />
        Modifier groups
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Create groups (e.g. &quot;Add-ons&quot;, &quot;Extras&quot;), add
        modifiers with names and prices, then attach groups to items from the
        item detail page (Menu → Category → Item).
      </p>

      {message && (
        <div
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            message.type === "ok"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {editable && !addingModifierGroup && (
        <button
          type="button"
          onClick={() => setAddingModifierGroup(true)}
          className="mb-4 flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          New modifier group
        </button>
      )}

      {addingModifierGroup && (
        <CreateGroupForm
          onSubmit={(body) => createGroupMut.mutate(body)}
          onCancel={() => setAddingModifierGroup(false)}
          isPending={createGroupMut.isPending}
        />
      )}

      <ul className="space-y-2">
        {groups?.map((g) => (
          <li
            key={g.id}
            className="rounded-xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between p-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedGroupId(expandedGroupId === g.id ? null : g.id)
                }
                className="text-left font-medium text-zinc-800"
              >
                {g.name_en ?? g.name_ar ?? g.id}
              </button>
              {editable && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingGroupId(editingGroupId === g.id ? null : g.id)
                    }
                    className="rounded p-2 text-zinc-500 hover:bg-zinc-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this group and its modifiers?"))
                        deleteGroupMut.mutate(g.id);
                    }}
                    className="rounded p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {editingGroupId === g.id && (
              <EditGroupForm
                group={g}
                onSave={(body) =>
                  updateGroupMut.mutate({ groupId: g.id, body })
                }
                onCancel={() => setEditingGroupId(null)}
                isPending={updateGroupMut.isPending}
              />
            )}
            {expandedGroupId === g.id && (
              <div className="border-t border-zinc-100 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-600">
                    Modifiers
                  </h3>
                  {editable && (
                    <button
                      type="button"
                      onClick={() =>
                        setAddingModifierGroupId(
                          addingModifierGroupId === g.id ? null : g.id,
                        )
                      }
                      className="flex items-center gap-1 rounded bg-teal-600 px-2 py-1 text-sm font-medium text-white hover:bg-teal-700"
                    >
                      <Plus className="h-3 w-3" />
                      Add modifier
                    </button>
                  )}
                </div>
                {addingModifierGroupId === g.id && (
                  <AddModifierForm
                    onAdd={(body) =>
                      createModifierMut.mutate({ groupId: g.id, body })
                    }
                    onCancel={() => setAddingModifierGroupId(null)}
                    isPending={createModifierMut.isPending}
                  />
                )}
                <ul className="space-y-2">
                  {(modifiers ?? []).map((m) => (
                    <li key={m.id} className="rounded-lg bg-zinc-50 px-3 py-2">
                      {editingModifierId === m.id ? (
                        <EditModifierForm
                          modifier={m}
                          onSave={(body) =>
                            updateModifierMut.mutate({ modifierId: m.id, body })
                          }
                          onCancel={() => setEditingModifierId(null)}
                          isPending={updateModifierMut.isPending}
                        />
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span>{m.name_en ?? m.name_ar}</span>
                          <span className="font-medium text-teal-600">
                            {m.price.toFixed(2)} EGP
                          </span>
                          {editable && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingModifierId(m.id)}
                                className="text-sm text-teal-600 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("Delete this modifier?"))
                                    deleteModifierMut.mutate(m.id);
                                }}
                                className="text-sm text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {(!modifiers || modifiers.length === 0) &&
                  !addingModifierGroupId && (
                    <p className="text-sm text-zinc-500">No modifiers</p>
                  )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreateGroupForm({
  onSubmit,
  onCancel,
  isPending,
}: {
  onSubmit: (body: { name_ar: string; name_en: string }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<{
    name_ar: string;
    name_en: string;
  }>();
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-4 rounded-xl border border-dashed border-zinc-300 bg-white p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Name (EN) *
          </label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("name_en", { required: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Name (AR)
          </label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("name_ar")}
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Create group
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function EditGroupForm({
  group,
  onSave,
  onCancel,
  isPending,
}: {
  group: { name_ar?: string; name_en?: string };
  onSave: (body: { name_ar?: string; name_en?: string }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name_en: group.name_en ?? "",
      name_ar: group.name_ar ?? "",
    },
  });
  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="border-t border-zinc-100 p-4"
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          className="rounded border px-2 py-1.5 text-sm"
          placeholder="Name EN"
          {...register("name_en")}
        />
        <input
          className="rounded border px-2 py-1.5 text-sm"
          placeholder="Name AR"
          {...register("name_ar")}
        />
      </div>
      <div className="mt-2 flex gap-2">
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

function EditModifierForm({
  modifier,
  onSave,
  onCancel,
  isPending,
}: {
  modifier: { name_ar?: string; name_en?: string; price: number };
  onSave: (body: {
    name_ar?: string;
    name_en?: string;
    price?: number;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name_en: modifier.name_en ?? "",
      name_ar: modifier.name_ar ?? "",
      price: modifier.price,
    },
  });
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onSave({
          name_en: d.name_en,
          name_ar: d.name_ar,
          price: Number(d.price),
        }),
      )}
      className="flex flex-wrap items-end gap-2"
    >
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Name (EN)</label>
        <input
          className="w-32 rounded border border-zinc-300 px-2 py-1.5 text-sm"
          {...register("name_en")}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Name (AR)</label>
        <input
          className="w-32 rounded border border-zinc-300 px-2 py-1.5 text-sm"
          {...register("name_ar")}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Price</label>
        <input
          type="number"
          step="0.01"
          className="w-20 rounded border border-zinc-300 px-2 py-1.5 text-sm"
          {...register("price", { valueAsNumber: true })}
        />
      </div>
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
    </form>
  );
}

function AddModifierForm({
  onAdd,
  onCancel,
  isPending,
}: {
  onAdd: (body: { name_ar: string; name_en: string; price: number }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<{
    name_ar: string;
    name_en: string;
    price: number;
  }>({
    defaultValues: { price: 0 },
  });
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onAdd({
          name_ar: d.name_ar,
          name_en: d.name_en,
          price: Number(d.price),
        }),
      )}
      className="mb-3 flex flex-wrap items-end gap-2 rounded-lg bg-teal-50 p-3"
    >
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Name (EN) *</label>
        <input
          className="w-36 rounded border border-zinc-300 px-2 py-1.5 text-sm"
          {...register("name_en", { required: true })}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Name (AR)</label>
        <input
          className="w-36 rounded border border-zinc-300 px-2 py-1.5 text-sm"
          {...register("name_ar")}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Price *</label>
        <input
          type="number"
          step="0.01"
          className="w-24 rounded border border-zinc-300 px-2 py-1.5 text-sm"
          {...register("price", { valueAsNumber: true })}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-teal-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Add
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded border border-zinc-300 px-3 py-1.5 text-sm"
      >
        Cancel
      </button>
    </form>
  );
}
