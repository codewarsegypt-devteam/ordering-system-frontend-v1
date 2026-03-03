"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts";
import {
  fetchMenus,
  fetchMenuCategories,
  fetchCategoryItems,
  createItem,
  deleteItem,
  getApiError,
} from "@/lib/api";
import { Loader2, Plus, Pencil, Trash2, ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const canEditMenu = (role: string) => role === "owner" || role === "manager";

export default function CategoryItemsPage() {
  const params = useParams();
  const router = useRouter();
  const menuId = params?.menuId as string;
  const categoryId = params?.categoryId as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
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

  const menu = menus?.find((m) => m.id === menuId);
  const category = categories?.find((c) => c.id === categoryId);
  const menuName = menu?.name_en ?? menu?.name_ar ?? "Menu";
  const categoryName = category?.name_en ?? category?.name_ar ?? "Category";

  const { data: items, isLoading, error } = useQuery({
    queryKey: ["categoryItems", categoryId],
    queryFn: () => fetchCategoryItems(categoryId),
    enabled: !!categoryId && !!user?.merchant_id,
  });

  const createItemMut = useMutation({
    mutationFn: (body: Parameters<typeof createItem>[1]) =>
      createItem(categoryId, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categoryItems", categoryId] });
      setAdding(false);
      setMessage({ type: "ok", text: "Item created. Add variants and modifier groups on the next page." });
      router.push(`/dashboard/menu/${menuId}/${categoryId}/${data.id}`);
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const deleteItemMut = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoryItems", categoryId] });
      setMessage({ type: "ok", text: "Item deleted." });
    },
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
      <nav className="mb-4 flex items-center gap-1 text-sm text-zinc-500">
        <Link href="/dashboard/menu" className="hover:text-teal-600">
          Menus
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/dashboard/menu/${menuId}`} className="hover:text-teal-600">
          {menuName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-800">{categoryName}</span>
      </nav>

      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-zinc-800">
        <Package className="h-7 w-7 text-teal-600" />
        {categoryName}
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

      {editable && (
        <div className="mb-4">
          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              Add item
            </button>
          ) : (
            <CreateItemForm
              onAdd={(body) => createItemMut.mutate(body)}
              onCancel={() => setAdding(false)}
              isPending={createItemMut.isPending}
            />
          )}
        </div>
      )}

      <ul className="space-y-2">
        {items?.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4"
          >
            <Link
              href={`/dashboard/menu/${menuId}/${categoryId}/${item.id}`}
              className="flex flex-1 items-center gap-2 font-medium text-zinc-800 hover:text-teal-600"
            >
              {item.name_en ?? item.name_ar ?? item.id}
              <ChevronRight className="ml-auto h-4 w-4 text-zinc-400" />
            </Link>
            <div className="ml-2 flex items-center gap-2">
              <span className="text-teal-600">{item.base_price.toFixed(2)} EGP</span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  item.status === "active"
                    ? "bg-green-100 text-green-800"
                    : item.status === "out_of_stock"
                      ? "bg-red-100 text-red-800"
                      : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {item.status}
              </span>
              {editable && (
                <>
                  <Link
                    href={`/dashboard/menu/${menuId}/${categoryId}/${item.id}`}
                    className="rounded p-2 text-zinc-500 hover:bg-zinc-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this item?")) deleteItemMut.mutate(item.id);
                    }}
                    className="rounded p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {(!items || items.length === 0) && !adding && (
        <p className="mt-4 text-sm text-zinc-500">No items in this category.</p>
      )}
    </div>
  );
}

function CreateItemForm({
  onAdd,
  onCancel,
  isPending,
}: {
  onAdd: (body: Parameters<typeof createItem>[1]) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<{
    name_ar: string;
    name_en: string;
    base_price: number;
    description_ar: string;
    description_en: string;
    status: string;
  }>({ defaultValues: { base_price: 0, status: "active", description_ar: "", description_en: "" } });
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onAdd({
          name_ar: d.name_ar,
          name_en: d.name_en,
          base_price: Number(d.base_price),
          description_ar: d.description_ar || undefined,
          description_en: d.description_en || undefined,
          status: d.status as "active" | "hidden" | "out_of_stock",
        })
      )}
      className="rounded-xl border border-zinc-200 bg-white p-4"
    >
      <h3 className="mb-3 font-medium text-zinc-800">Create item</h3>
      <p className="mb-3 text-sm text-zinc-500">
        After creating, you can add variants and attach modifier groups on the item page.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Name (EN) *</label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("name_en", { required: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Name (AR)</label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("name_ar")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-700">Description (EN)</label>
          <textarea rows={2} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" {...register("description_en")} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-700">Description (AR)</label>
          <textarea rows={2} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" {...register("description_ar")} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Base price *</label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("base_price", { required: true, valueAsNumber: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Status</label>
          <select
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("status")}
          >
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Create item &amp; add variants / modifiers
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
