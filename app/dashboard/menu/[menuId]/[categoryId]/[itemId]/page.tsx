"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts";
import {
  fetchMenus,
  fetchMenuCategories,
  fetchItem,
  updateItem,
  updateItemStatus,
  fetchItemVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  fetchItemModifierGroups,
  attachModifierGroup,
  updateItemModifierGroup,
  detachModifierGroup,
  getApiError,
} from "@/lib/api";
import { fetchModifierGroups } from "@/lib/api/modifiers";
import type { ItemDto, ItemVariantDto, ItemModifierGroupLinkDto } from "@/lib/api/items";
import type { ModifierGroupDto } from "@/lib/api/modifiers";
import { useForm } from "react-hook-form";
import {
  Loader2,
  Plus,
  Trash2,
  Package,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const canEditMenu = (role: string) => role === "owner" || role === "manager";

export default function ItemDetailPage() {
  const params = useParams();
  const menuId = params?.menuId as string;
  const categoryId = params?.categoryId as string;
  const itemId = params?.itemId as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editForm, setEditForm] = useState(false);
  const [addVariant, setAddVariant] = useState(false);
  const [addModifierGroup, setAddModifierGroup] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data: menus } = useQuery({
    queryKey: ["menus", user?.merchant_id],
    queryFn: fetchMenus,
    enabled: !!user?.merchant_id,
  });

  const { data: categories } = useQuery({
    queryKey: ["menuCategories", menuId],
    queryFn: () => fetchMenuCategories(menuId),
    enabled: !!menuId,
  });

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => fetchItem(itemId),
    enabled: !!itemId,
  });

  const { data: itemModifierGroupLinks } = useQuery({
    queryKey: ["itemModifierGroups", itemId],
    queryFn: () => fetchItemModifierGroups(itemId),
    enabled: !!itemId,
  });

  const { data: modifierGroups } = useQuery({
    queryKey: ["modifierGroups"],
    queryFn: fetchModifierGroups,
    enabled: !!user?.merchant_id,
  });

  const menu = menus?.find((m) => m.id === menuId);
  const category = categories?.find((c) => c.id === categoryId);
  const menuName = menu?.name_en ?? menu?.name_ar ?? "Menu";
  const categoryName = category?.name_en ?? category?.name_ar ?? "Category";
  const editable = canEditMenu(user?.role ?? "");

  if (isLoading || !item) {
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
      <nav className="mb-4 flex items-center gap-1 text-sm text-zinc-500">
        <Link href="/dashboard/menu" className="hover:text-teal-600">
          Menus
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/dashboard/menu/${menuId}`} className="hover:text-teal-600">
          {menuName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/dashboard/menu/${menuId}/${categoryId}`} className="hover:text-teal-600">
          {categoryName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-800">{item.name_en ?? item.name_ar ?? "Item"}</span>
      </nav>

      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-zinc-800">
        <Package className="h-7 w-7 text-teal-600" />
        {item.name_en ?? item.name_ar ?? item.id}
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

      <ItemEditSection
        item={item}
        editable={editable}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["item", itemId] });
          setMessage({ type: "ok", text: "Item updated." });
        }}
        onError={(err) => setMessage({ type: "err", text: getApiError(err) })}
        editForm={editForm}
        setEditForm={setEditForm}
      />

      <VariantsSection
        itemId={itemId}
        editable={editable}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["item", itemId] });
          setMessage({ type: "ok", text: "Variant saved." });
        }}
        onError={(err) => setMessage({ type: "err", text: getApiError(err) })}
        addVariant={addVariant}
        setAddVariant={setAddVariant}
      />

      <ItemModifierGroupsSection
        itemId={itemId}
        itemModifierGroups={itemModifierGroupLinks ?? []}
        editable={editable}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["item", itemId] });
          queryClient.invalidateQueries({ queryKey: ["itemModifierGroups", itemId] });
          setMessage({ type: "ok", text: "Modifier group updated." });
        }}
        onError={(err) => setMessage({ type: "err", text: getApiError(err) })}
        addModifierGroup={addModifierGroup}
        setAddModifierGroup={setAddModifierGroup}
        modifierGroups={modifierGroups ?? []}
      />
    </div>
  );
}

/* ─── Item edit ─── */

function ItemEditSection({
  item,
  editable,
  onSuccess,
  onError,
  editForm,
  setEditForm,
}: {
  item: ItemDto;
  editable: boolean;
  onSuccess: () => void;
  onError: (err: unknown) => void;
  editForm: boolean;
  setEditForm: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name_en: item.name_en ?? "",
      name_ar: item.name_ar ?? "",
      base_price: item.base_price,
      status: item.status,
    },
  });

  const updateMut = useMutation({
    mutationFn: (body: Parameters<typeof updateItem>[1]) => updateItem(item.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item", item.id] });
      setEditForm(false);
      onSuccess();
    },
    onError,
  });

  const statusMut = useMutation({
    mutationFn: (status: "active" | "hidden" | "out_of_stock") =>
      updateItemStatus(item.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item", item.id] });
      onSuccess();
    },
    onError,
  });

  if (!editable) {
    return (
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-zinc-600">{item.name_en ?? item.name_ar}</p>
        <p className="font-semibold text-teal-600">{item.base_price.toFixed(2)} EGP</p>
        <p className="text-sm text-zinc-500">Status: {item.status}</p>
      </div>
    );
  }

  if (!editForm) {
    return (
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-zinc-800">{item.name_en ?? item.name_ar}</p>
            <p className="text-teal-600">{item.base_price.toFixed(2)} EGP</p>
            <span className={`rounded px-2 py-0.5 text-xs ${item.status === "active" ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"}`}>
              {item.status}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditForm(true)}
              className="rounded-lg text-zinc-700 border border-zinc-300 px-3 py-1.5 text-sm font-medium"
            >
              Edit
            </button>
            {item.status !== "active" && (
              <button
                type="button"
                onClick={() => statusMut.mutate("active")}
                className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white"
              >
                Set active
              </button>
            )}
            {item.status === "active" && (
              <button
                type="button"
                onClick={() => statusMut.mutate("out_of_stock")}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white"
              >
                Out of stock
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((d) =>
        updateMut.mutate({
          name_en: d.name_en,
          name_ar: d.name_ar,
          base_price: Number(d.base_price),
          status: d.status as "active" | "hidden" | "out_of_stock",
        })
      )}
      className="mb-6 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <h3 className="mb-3 font-medium text-zinc-800">Edit item</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Name (EN)</label>
          <input className="w-full text-zinc-700 rounded border border-zinc-300 px-3 py-2 text-sm" {...register("name_en")} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Name (AR)</label>
          <input className="w-full text-zinc-700 rounded border border-zinc-300 px-3 py-2 text-sm" {...register("name_ar")} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Base price</label>
          <input type="number" step="0.01" className="w-full text-zinc-700 rounded border border-zinc-300 px-3 py-2 text-sm" {...register("base_price", { valueAsNumber: true })} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Status</label>
          <select className="w-full text-zinc-700 rounded border border-zinc-300 px-3 py-2 text-sm" {...register("status")}>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={updateMut.isPending} className="rounded bg-teal-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">
          Save
        </button>
        <button type="button" onClick={() => setEditForm(false)} className="text-zinc-700 rounded border border-zinc-300 px-3 py-1.5 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Variants ─── */

function VariantsSection({
  itemId,
  editable,
  onSuccess,
  onError,
  addVariant,
  setAddVariant,
}: {
  itemId: string;
  editable: boolean;
  onSuccess: () => void;
  onError: (err: unknown) => void;
  addVariant: boolean;
  setAddVariant: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { data: variants, isLoading } = useQuery({
    queryKey: ["itemVariants", itemId],
    queryFn: () => fetchItemVariants(itemId),
    enabled: !!itemId,
  });

  const createMut = useMutation({
    mutationFn: (body: { name_ar: string; name_en: string; price: number }) =>
      createVariant(itemId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemVariants", itemId] });
      queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      setAddVariant(false);
      onSuccess();
    },
    onError,
  });

  const deleteMut = useMutation({
    mutationFn: deleteVariant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itemVariants", itemId] });
      queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      onSuccess();
    },
    onError,
  });

  return (
    <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 font-medium text-zinc-800">Variants</h3>
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
      ) : (
        <ul className="space-y-2">
          {(variants ?? []).map((v) => (
            <li key={v.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
              <span className="text-zinc-700">{v.name_en ?? v.name_ar}</span>
              <span className="font-medium text-zinc-700">{v.price.toFixed(2)} EGP</span>
              {editable && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this variant?")) deleteMut.mutate(v.id);
                  }}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {editable && (
        <>
          {!addVariant ? (
            <button
              type="button"
              onClick={() => setAddVariant(true)}
              className="mt-3 flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add variant
            </button>
          ) : (
            <AddVariantForm
              onSubmit={(body) => createMut.mutate(body)}
              onCancel={() => setAddVariant(false)}
              isPending={createMut.isPending}
            />
          )}
        </>
      )}
    </div>
  );
}

function AddVariantForm({
  onSubmit,
  onCancel,
  isPending,
}: {
  onSubmit: (body: { name_ar: string; name_en: string; price: number }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<{ name_ar: string; name_en: string; price: number }>();
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-teal-50 p-3">
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Name (EN) *</label>
        <input className="w-32 text-zinc-700 rounded border border-zinc-300 px-2 py-1.5 text-sm" {...register("name_en", { required: true })} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Name (AR)</label>
        <input className="w-32 text-zinc-700 rounded border border-zinc-300 px-2 py-1.5 text-sm" {...register("name_ar")} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Price *</label>
        <input type="number" step="0.01" className="w-24 text-zinc-700 rounded border border-zinc-300 px-2 py-1.5 text-sm" {...register("price", { valueAsNumber: true })} />
      </div>
      <button type="submit" disabled={isPending} className="rounded bg-teal-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">
        Add
      </button>
      <button type="button" onClick={onCancel} className="text-zinc-700 rounded border border-zinc-300 px-3 py-1.5 text-sm">
        Cancel
      </button>
    </form>
  );
}

/* ─── Modifier groups ─── */

function ItemModifierGroupsSection({
  itemId,
  itemModifierGroups,
  editable,
  onSuccess,
  onError,
  addModifierGroup,
  setAddModifierGroup,
  modifierGroups,
}: {
  itemId: string;
  itemModifierGroups: ItemModifierGroupLinkDto[];
  editable: boolean;
  onSuccess: () => void;
  onError: (err: unknown) => void;
  addModifierGroup: boolean;
  setAddModifierGroup: (v: boolean) => void;
  modifierGroups: ModifierGroupDto[];
}) {
  const queryClient = useQueryClient();
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["item", itemId] });
    queryClient.invalidateQueries({ queryKey: ["itemModifierGroups", itemId] });
  };

  const attachMut = useMutation({
    mutationFn: (body: { modifier_group_id: string; min_select: number; max_select: number }) =>
      attachModifierGroup(itemId, body),
    onSuccess: () => {
      invalidateAll();
      setAddModifierGroup(false);
      onSuccess();
    },
    onError,
  });

  const updateLinkMut = useMutation({
    mutationFn: ({ groupId, body }: { groupId: string; body: { min_select: number; max_select: number } }) =>
      updateItemModifierGroup(itemId, groupId, body),
    onSuccess: () => {
      invalidateAll();
      setEditingLinkId(null);
      onSuccess();
    },
    onError,
  });

  const detachMut = useMutation({
    mutationFn: (groupId: string) => detachModifierGroup(itemId, groupId),
    onSuccess: () => {
      invalidateAll();
      onSuccess();
    },
    onError,
  });

  const groupById = new Map(modifierGroups.map((g) => [g.id, g]));
  const safeLinks = itemModifierGroups.filter((l) => l && l.modifier_group_id);
  const availableGroups = modifierGroups.filter(
    (g) => !safeLinks.some((l) => l.modifier_group_id === g.id)
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 font-medium text-zinc-800">Modifier groups on this item</h3>
      <p className="mb-3 text-sm text-zinc-500">
        Attach modifier groups so customers can choose add-ons (e.g. extras, size). Create groups and modifiers under{" "}
        <Link href="/dashboard/menu/modifiers" className="font-medium text-teal-600 hover:underline">
          Modifier groups
        </Link>
        .
      </p>
      <ul className="space-y-2">
        {safeLinks.map((link) => {
          const group = groupById.get(link.modifier_group_id);
          const name = group
            ? (group.name_en ?? group.name_ar ?? group.id)
            : (link.modifier_group_id ?? link.id ?? "Unknown").slice(0, 8) + "\u2026";
          const isEditing = editingLinkId === link.id;
          return (
            <li key={link.id} className="rounded-lg bg-zinc-50 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-zinc-800">{name}</span>
                <span className="text-sm text-zinc-500">
                  min {link.min_select} / max {link.max_select}
                </span>
                {editable && !isEditing && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingLinkId(link.id)}
                      className="text-sm text-teal-600 hover:underline"
                    >
                      Edit min/max
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Detach this modifier group from the item?")) detachMut.mutate(link.modifier_group_id);
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Detach
                    </button>
                  </div>
                )}
              </div>
              {isEditing && (
                <EditMinMaxForm
                  min={link.min_select}
                  max={link.max_select}
                  onSave={(min, max) => updateLinkMut.mutate({ groupId: link.modifier_group_id, body: { min_select: min, max_select: max } })}
                  onCancel={() => setEditingLinkId(null)}
                  isPending={updateLinkMut.isPending}
                />
              )}
            </li>
          );
        })}
      </ul>
      {editable && (
        <>
          {!addModifierGroup ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setAddModifierGroup(true)}
                className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline"
              >
                <Plus className="h-4 w-4" />
                Add modifier group to item
              </button>
              {modifierGroups.length === 0 && (
                <Link href="/dashboard/menu/modifiers" className="text-sm text-zinc-500 hover:text-teal-600">
                  Create modifier groups first &rarr;
                </Link>
              )}
            </div>
          ) : (
            <AttachModifierGroupForm
              availableGroups={availableGroups}
              onAttach={(body) => attachMut.mutate(body)}
              onCancel={() => setAddModifierGroup(false)}
              isPending={attachMut.isPending}
            />
          )}
        </>
      )}
    </div>
  );
}

function EditMinMaxForm({
  min,
  max,
  onSave,
  onCancel,
  isPending,
}: {
  min: number;
  max: number;
  onSave: (min: number, max: number) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<{ min_select: number; max_select: number }>({
    defaultValues: { min_select: min, max_select: max },
  });
  return (
    <form
      onSubmit={handleSubmit((d) => onSave(d.min_select, d.max_select))}
      className="mt-2 flex flex-wrap items-end gap-2 border-t border-zinc-200 pt-2"
    >
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Min select</label>
        <input type="number" min={0} className="w-20 text-zinc-700 rounded border border-zinc-300 px-2 py-1.5 text-sm" {...register("min_select", { valueAsNumber: true })} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Max select</label>
        <input type="number" min={0} className="w-20 text-zinc-700 rounded border border-zinc-300 px-2 py-1.5 text-sm" {...register("max_select", { valueAsNumber: true })} />
      </div>
      <button type="submit" disabled={isPending} className="rounded bg-teal-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">
        Save
      </button>
      <button type="button" onClick={onCancel} className="text-zinc-700 rounded border border-zinc-300 px-3 py-1.5 text-sm">
        Cancel
      </button>
    </form>
  );
}

function AttachModifierGroupForm({
  availableGroups,
  onAttach,
  onCancel,
  isPending,
}: {
  availableGroups: ModifierGroupDto[];
  onAttach: (body: { modifier_group_id: string; min_select: number; max_select: number }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<{ modifier_group_id: string; min_select: number; max_select: number }>({
    defaultValues: { min_select: 0, max_select: 1 },
  });
  return (
    <form
      onSubmit={handleSubmit(onAttach)}
      className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-teal-50 p-3"
    >
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Modifier group</label>
        <select className="rounded border text-zinc-700 border-zinc-300 px-2 py-1.5 text-sm" {...register("modifier_group_id", { required: true })}>
          <option value="">Select group&hellip;</option>
          {availableGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name_en ?? g.name_ar ?? g.id}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Min</label>
        <input type="number" min={0} className="w-16 text-zinc-700 rounded border border-zinc-300 px-2 py-1.5 text-sm" {...register("min_select", { valueAsNumber: true })} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-600">Max</label>
        <input type="number" min={0} className="w-16 text-zinc-700 rounded border border-zinc-300 px-2 py-1.5 text-sm" {...register("max_select", { valueAsNumber: true })} />
      </div>
      <button type="submit" disabled={isPending || availableGroups.length === 0} className="rounded bg-teal-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">
        Attach
      </button>
      <button type="button" onClick={onCancel} className="text-zinc-700 rounded border border-zinc-300 px-3 py-1.5 text-sm">
        Cancel
      </button>
      {availableGroups.length === 0 && (
        <p className="w-full text-sm text-amber-600">Create modifier groups first in Modifier groups.</p>
      )}
    </form>
  );
}
