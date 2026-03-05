"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import {
  fetchMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  getApiError,
} from "@/lib/api";
import type { MenuDto } from "@/lib/api/menus";
import { useForm } from "react-hook-form";
import {
  UtensilsCrossed,
  Loader2,
  Pencil,
  Trash2,
  ChevronRight,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const canEditMenu = (role: string) => role === "owner" || role === "manager";

export default function DashboardMenuPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data: menus, isLoading, error } = useQuery({
    queryKey: ["menus", user?.merchant_id],
    queryFn: fetchMenus,
    enabled: !!user?.merchant_id,
  });

  const createMenuMut = useMutation({
    mutationFn: createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setMessage({ type: "ok", text: "Menu created." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const updateMenuMut = useMutation({
    mutationFn: ({ menuId, body }: { menuId: string; body: Parameters<typeof updateMenu>[1] }) =>
      updateMenu(menuId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setEditingMenuId(null);
      setMessage({ type: "ok", text: "Menu updated." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const deleteMenuMut = useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setMessage({ type: "ok", text: "Menu deleted." });
    },
    onError: (e) => setMessage({ type: "err", text: getApiError(e) }),
  });

  const editable = canEditMenu(user?.role ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-5 text-sm font-medium text-red-700">
        {getApiError(error)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="page-title flex items-center gap-3 text-xl sm:text-2xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
            <UtensilsCrossed className="h-5 w-5" />
          </span>
          Menus
        </h1>
        {editable && (
          <Link
            href="/dashboard/menu/modifiers"
            className="btn-secondary flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            Modifier groups
          </Link>
        )}
      </div>

      {message && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {editable && (
        <CreateMenuForm
          onSubmit={(data) => createMenuMut.mutate(data)}
          isPending={createMenuMut.isPending}
        />
      )}

      <div className="mt-8 space-y-3">
        {menus?.map((menu) => (
          <div key={menu.id} className="card overflow-hidden">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <Link
                href={`/dashboard/menu/${menu.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 font-semibold text-zinc-800 transition-colors hover:text-teal-600"
              >
                {menu.name_en ?? menu.name_ar ?? menu.id}
                <span className="text-sm font-normal text-zinc-500">
                  {menu.currancy ?? menu.currency ?? "EGP"}
                </span>
                {!menu.is_active && (
                  <span className="rounded-lg bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
                    Inactive
                  </span>
                )}
                <ChevronRight className="ml-auto h-5 w-5 text-zinc-400" />
              </Link>
              {editable && (
                <div className="ml-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingMenuId(editingMenuId === menu.id ? null : menu.id)}
                    className="btn-ghost rounded-xl p-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {/* <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this menu and all its categories/items?")) deleteMenuMut.mutate(menu.id);
                    }}
                    className="btn-ghost rounded-xl p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button> */}
                </div>
              )}
            </div>

            {editingMenuId === menu.id && (
              <MenuEditForm
                menu={menu}
                onSave={(body) => updateMenuMut.mutate({ menuId: menu.id, body })}
                onCancel={() => setEditingMenuId(null)}
                isPending={updateMenuMut.isPending}
              />
            )}
          </div>
        ))}
      </div>

      {(!menus || menus.length === 0) && (
        <p className="mt-8 text-center text-zinc-500">No menus yet. Create one above.</p>
      )}
    </div>
  );
}

function CreateMenuForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: { name_ar: string; name_en: string; currency?: string; is_active?: boolean }) => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<{
    name_ar: string;
    name_en: string;
    currency: string;
    is_active: boolean;
  }>({ defaultValues: { currency: "EGP", is_active: true } });
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onSubmit({
          name_ar: d.name_ar.trim(),
          name_en: d.name_en.trim(),
          currency: d.currency || "EGP",
          is_active: d.is_active,
        })
      )}
      className="card-flat mb-6 border-dashed p-6"
    >
      <h3 className="section-title mb-4">Create menu</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Name (EN) *</label>
          <input className="input-base" placeholder="e.g. Main Menu" {...register("name_en", { required: true })} />
        </div>
        <div>
          <label className="label">Name (AR) *</label>
          <input className="input-base" placeholder="القائمة الرئيسية" {...register("name_ar", { required: true })} />
        </div>
        <div>
          <label className="label">Currency *</label>
          <input className="input-base" placeholder="EGP" {...register("currency", { required: true })} />
        </div>
        <div className="flex items-center gap-2 sm:col-span-3">
          <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-teal-600" {...register("is_active")} />
          <label className="text-sm font-medium text-zinc-700">Active</label>
        </div>
      </div>
      <button type="submit" disabled={isPending} className="btn-primary mt-4">
        Create menu
      </button>
    </form>
  );
}

function MenuEditForm({
  menu,
  onSave,
  onCancel,
  isPending,
}: {
  menu: MenuDto;
  onSave: (body: Parameters<typeof updateMenu>[1]) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name_en: menu.name_en ?? "",
      name_ar: menu.name_ar ?? "",
      currency: menu.currancy ?? menu.currency ?? "EGP",
      is_active: menu.is_active,
    },
  });
  return (
    <form
      onSubmit={handleSubmit((d) =>
        onSave({
          name_en: d.name_en?.trim(),
          name_ar: d.name_ar?.trim(),
          currency: d.currency || "EGP",
          is_active: d.is_active,
        })
      )}
      className="border-t border-zinc-100 bg-zinc-50/50 p-5"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Name (EN)</label>
          <input className="input-base py-2" {...register("name_en")} />
        </div>
        <div>
          <label className="label">Name (AR)</label>
          <input className="input-base py-2" {...register("name_ar")} />
        </div>
        <div>
          <label className="label">Currency</label>
          <input className="input-base py-2" {...register("currency")} />
        </div>
        <div className="flex items-center gap-2 sm:col-span-3">
          <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500" {...register("is_active")} />
          <label className="text-sm font-medium text-zinc-700">Active</label>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
