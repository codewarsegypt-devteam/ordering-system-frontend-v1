"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts";
import {
  fetchMenus,
  fetchMenuCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getApiError,
} from "@/lib/api";
import type { CategoryDto } from "@/lib/api/menus";
import { useForm } from "react-hook-form";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const canEditMenu = (role: string) => role === "owner" || role === "manager";

export default function MenuDetailPage() {
  const params = useParams();
  const menuId = params?.menuId as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data: menus } = useQuery({
    queryKey: ["menus", user?.merchant_id],
    queryFn: fetchMenus,
    enabled: !!user?.merchant_id,
  });

  const menu = menus?.find((m) => m.id === menuId);

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["menuCategories", menuId],
    queryFn: () => fetchMenuCategories(menuId),
    enabled: !!menuId,
  });

  const createCategoryMut = useMutation({
    mutationFn: (body: Parameters<typeof createCategory>[1]) =>
      createCategory(menuId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuCategories", menuId] });
      setAdding(false);
      setMessage({ type: "ok", text: "Category created." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const updateCategoryMut = useMutation({
    mutationFn: ({ categoryId, body }: { categoryId: string; body: Parameters<typeof updateCategory>[1] }) =>
      updateCategory(categoryId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuCategories", menuId] });
      setEditingCategoryId(null);
      setMessage({ type: "ok", text: "Category updated." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const deleteCategoryMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuCategories", menuId] });
      setMessage({ type: "ok", text: "Category deleted." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const editable = canEditMenu(user?.role ?? "");
  const menuName = menu?.name_en ?? menu?.name_ar ?? "Menu";

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
        <span className="font-medium text-zinc-800">{menuName}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-semibold text-zinc-800">{menuName}</h1>

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
              Add category
            </button>
          ) : (
            <CreateCategoryForm
              onAdd={(body) => createCategoryMut.mutate(body)}
              onCancel={() => setAdding(false)}
              isPending={createCategoryMut.isPending}
            />
          )}
        </div>
      )}

      <ul className="space-y-2">
        {(categories ?? []).map((c) => (
          <li key={c.id} className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between p-4">
              <Link
                href={`/dashboard/menu/${menuId}/${c.id}`}
                className="flex flex-1 items-center gap-2 font-medium text-zinc-800 hover:text-teal-600"
              >
                <FolderOpen className="h-4 w-4 text-teal-600" />
                {c.name_en ?? c.name_ar}
                <span className="text-sm font-normal text-zinc-500">#{c.sort_order}</span>
                {!c.is_active && (
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                    inactive
                  </span>
                )}
                <ChevronRight className="ml-auto h-4 w-4 text-zinc-400" />
              </Link>
              {editable && (
                <div className="ml-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingCategoryId(editingCategoryId === c.id ? null : c.id)
                    }
                    className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this category and all its items?"))
                        deleteCategoryMut.mutate(c.id);
                    }}
                    className="rounded p-1.5 text-zinc-500 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            {editingCategoryId === c.id && (
              <CategoryEditForm
                category={c}
                onSave={(body) =>
                  updateCategoryMut.mutate({ categoryId: c.id, body })
                }
                onCancel={() => setEditingCategoryId(null)}
                isPending={updateCategoryMut.isPending}
              />
            )}
          </li>
        ))}
      </ul>

      {(!categories || categories.length === 0) && !adding && (
        <p className="mt-4 text-sm text-zinc-500">No categories yet. Add one above.</p>
      )}
    </div>
  );
}

function CreateCategoryForm({
  onAdd,
  onCancel,
  isPending,
}: {
  onAdd: (body: Parameters<typeof createCategory>[1]) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<{
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    sort_order: number;
    is_active: boolean;
  }>({ defaultValues: { sort_order: 0, is_active: true } });
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onAdd({
          name_ar: d.name_ar,
          name_en: d.name_en,
          description_ar: d.description_ar || undefined,
          description_en: d.description_en || undefined,
          sort_order: d.sort_order,
          is_active: d.is_active,
        })
      )}
      className="rounded-xl border border-dashed border-zinc-300 bg-white p-4"
    >
      <h3 className="mb-3 font-medium text-zinc-800">Create category</h3>
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
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Description (EN)</label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("description_en")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Description (AR)</label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("description_ar")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Sort order</label>
          <input
            type="number"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            {...register("sort_order", { valueAsNumber: true })}
          />
        </div>
        <div className="flex items-center gap-2 self-end py-2">
          <input type="checkbox" {...register("is_active")} />
          <label className="text-sm text-zinc-700">Active</label>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={isPending} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          Create category
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

function CategoryEditForm({
  category,
  onSave,
  onCancel,
  isPending,
}: {
  category: CategoryDto;
  onSave: (body: Parameters<typeof updateCategory>[1]) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name_en: category.name_en ?? "",
      name_ar: category.name_ar ?? "",
      sort_order: category.sort_order,
      is_active: category.is_active,
    },
  });
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onSave({ name_en: d.name_en, name_ar: d.name_ar, sort_order: d.sort_order, is_active: d.is_active })
      )}
      className="border-t border-zinc-100 p-4"
    >
      <div className="grid gap-2 sm:grid-cols-4">
        <input className="rounded border border-zinc-300 px-2 py-1.5 text-sm" placeholder="Name EN" {...register("name_en")} />
        <input className="rounded border border-zinc-300 px-2 py-1.5 text-sm" placeholder="Name AR" {...register("name_ar")} />
        <input type="number" className="rounded border border-zinc-300 px-2 py-1.5 text-sm" {...register("sort_order", { valueAsNumber: true })} />
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("is_active")} />
          <span className="text-sm">Active</span>
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button type="submit" disabled={isPending} className="rounded bg-teal-600 px-3 py-1.5 text-sm text-white disabled:opacity-50">
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-zinc-300 px-3 py-1.5 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
