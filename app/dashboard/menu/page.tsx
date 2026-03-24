"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import {
  fetchMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  uploadMenuImage,
  deleteMenuImage,
  getApiError,
} from "@/lib/api";
import type { MenuDto } from "@/lib/api/menus";
import { useForm } from "react-hook-form";
import {
  UtensilsCrossed,
  Loader2,
  Pencil,
  ChevronRight,
  Plus,
  Layers,
  Globe,
  ImagePlus,
  Trash2,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataCard } from "@/components/dashboard/DataCard";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { DashboardListSkeleton } from "@/components/dashboard/DashboardListSkeleton";
import {
  PageToolbar,
  PageToolbarSearch,
} from "@/components/dashboard/PageToolbar";

const canEdit = (role: string) => role === "owner" || role === "manager";

/* ─── Status badge ─── */
function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="badge badge-success">Active</span>
  ) : (
    <span className="badge badge-neutral">Inactive</span>
  );
}

export default function DashboardMenuPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const {
    data: menus,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["menus", user?.merchant_id],
    queryFn: fetchMenus,
    enabled: !!user?.merchant_id,
  });

  const filteredMenus = useMemo(() => {
    if (!menus?.length) return [];
    const q = search.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter((m) => {
      const en = (m.name_en ?? "").toLowerCase();
      const ar = (m.name_ar ?? "").toLowerCase();
      return en.includes(q) || ar.includes(q);
    });
  }, [menus, search]);

  const createMut = useMutation({
    mutationFn: createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setCreating(false);
      toast.success("Menu created.");
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const updateMut = useMutation({
    mutationFn: ({
      menuId,
      body,
    }: {
      menuId: string;
      body: Parameters<typeof updateMenu>[1];
    }) => updateMenu(menuId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setEditingId(null);
      toast.success("Menu updated.");
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const uploadImageMut = useMutation({
    mutationFn: ({
      menuId,
      file,
    }: { menuId: string; file: File }) => uploadMenuImage(menuId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      toast.success("Menu image uploaded.");
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const deleteImageMut = useMutation({
    mutationFn: (menuId: string) => deleteMenuImage(menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      toast.success("Menu image removed.");
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const editable = canEdit(user?.role ?? "");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Menus"
          description="Loading…"
          icon={
            <UtensilsCrossed
              className="h-5 w-5"
              style={{ color: "var(--system-primary)" }}
            />
          }
        />
        <DataCard>
          <DashboardListSkeleton rows={6} />
        </DataCard>
      </div>
    );
  }

  if (error) return <div className="alert-error">{getApiError(error)}</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menus"
        description={`${menus?.length ?? 0} menu${menus?.length !== 1 ? "s" : ""} · Manage lists and categories`}
        icon={
          <UtensilsCrossed
            className="h-5 w-5"
            style={{ color: "var(--system-primary)" }}
          />
        }
        actions={
          <>
            {editable && (
              <Link href="/dashboard/modifiers" className="btn-secondary">
                <Layers className="h-4 w-4" />
                Modifier groups
              </Link>
            )}
            {editable && !creating && (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4" />
                New menu
              </button>
            )}
          </>
        }
      />

      {/* Create form */}
      {creating && (
        <div className="form-card shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-title">Create menu</h2>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="btn-ghost p-1.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <CreateMenuForm
            onSubmit={(data) => createMut.mutate(data)}
            onCancel={() => setCreating(false)}
            isPending={createMut.isPending}
          />
        </div>
      )}

      {/* Menu list */}
      {!menus || menus.length === 0 ? (
        <DataCard>
          <DashboardEmptyState
            icon={<UtensilsCrossed className="h-8 w-8 text-slate-400" />}
            title="No menus yet"
            description="Create your first menu to add categories and items."
            action={
              editable && !creating ? (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4" /> Create menu
                </button>
              ) : undefined
            }
          />
        </DataCard>
      ) : (
        <>
          <PageToolbar>
            <PageToolbarSearch
              value={search}
              onChange={setSearch}
              placeholder="Search menus by name…"
            />
          </PageToolbar>
          <DataCard className="overflow-hidden">
            {filteredMenus.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                No menus match &ldquo;{search.trim()}&rdquo;.
              </div>
            ) : (
              <div
                className="divide-y"
                style={{ borderColor: "var(--dashboard-border)" }}
              >
                {filteredMenus.map((menu) => (
                  <div key={menu.id}>
                    <div className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80">
                {/* Cover image or icon */}
                      <div className="hidden h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 sm:flex sm:items-center sm:justify-center"
                        style={{ borderColor: "var(--dashboard-border)" }}
                      >
                        {menu.img_url_1 ? (
                          <img
                            src={menu.img_url_1}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Globe
                            className="h-6 w-6"
                            style={{ color: "var(--system-primary)" }}
                          />
                        )}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/dashboard/menu/${menu.id}`}
                          className="link-dashboard-primary"
                        >
                          {menu.name_en ?? menu.name_ar ?? menu.id}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-slate-400">
                            {menu.currancy ?? menu.currency ?? "EGP"}
                          </span>
                          <ActiveBadge active={menu.is_active} />
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {editable && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingId(
                                editingId === menu.id ? null : menu.id,
                              )
                            }
                            className={`btn-ghost btn-sm ${editingId === menu.id ? "bg-slate-100" : ""}`}
                            style={
                              editingId === menu.id
                                ? { color: "var(--system-primary)" }
                                : undefined
                            }
                            title="Edit menu"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        <Link
                          href={`/dashboard/menu/${menu.id}`}
                          className="btn-ghost btn-sm"
                          title="View categories"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                    {editingId === menu.id && (
                      <div
                        className="border-t px-5 py-4"
                        style={{
                          borderColor: "var(--dashboard-border)",
                          backgroundColor: "var(--dashboard-canvas)",
                        }}
                      >
                        <h3 className="mb-4 text-sm font-semibold text-slate-700">
                          Edit menu
                        </h3>
                        <MenuEditForm
                          menu={menu}
                          onSave={(body) =>
                            updateMut.mutate({ menuId: menu.id, body })
                          }
                          onCancel={() => setEditingId(null)}
                          isPending={updateMut.isPending}
                          onUploadImage={(file) =>
                            uploadImageMut.mutate({ menuId: menu.id, file })
                          }
                          onDeleteImage={() => deleteImageMut.mutate(menu.id)}
                          isUploadingImage={uploadImageMut.isPending}
                          isDeletingImage={deleteImageMut.isPending}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DataCard>
        </>
      )}
    </div>
  );
}

/* ─── Create form ─── */
function CreateMenuForm({
  onSubmit,
  onCancel,
  isPending,
}: {
  onSubmit: (data: {
    name_ar: string;
    name_en: string;
    currency?: string;
    is_active?: boolean;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<{
    name_ar: string;
    name_en: string;
    currency: string;
    is_active: boolean;
  }>({ defaultValues: { currency: "", is_active: true } });

  return (
    <form
      onSubmit={handleSubmit((d) =>
        onSubmit({
          name_ar: d.name_ar.trim(),
          name_en: d.name_en.trim(),
          currency: d.currency || "",
          is_active: d.is_active,
        }),
      )}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Name (English) *</label>
          <input
            className="input-base"
            placeholder="e.g. Main Menu"
            {...register("name_en", { required: true })}
          />
        </div>
        <div>
          <label className="label">Name (Arabic)</label>
          <input
            className="input-base"
            placeholder="القائمة الرئيسية"
            dir="rtl"
            {...register("name_ar")}
          />
        </div>
        {/* <div>
          <label className="label">Currency</label>
          <input
            className="input-base"
            placeholder="EGP"
            {...register("currency")}
          />
        </div> */}
        <div className="flex items-center gap-2.5 sm:col-span-3">
          <input
            type="checkbox"
            id="is_active_new"
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            {...register("is_active")}
          />
          <label
            htmlFor="is_active_new"
            className="text-sm font-medium text-slate-700"
          >
            Set as active
          </label>
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" /> Create menu
            </>
          )}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Edit form ─── */
const MENU_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MENU_IMAGE_MAX_MB = 5;

function MenuEditForm({
  menu,
  onSave,
  onCancel,
  isPending,
  onUploadImage,
  onDeleteImage,
  isUploadingImage,
  isDeletingImage,
}: {
  menu: MenuDto;
  onSave: (body: Parameters<typeof updateMenu>[1]) => void;
  onCancel: () => void;
  isPending: boolean;
  onUploadImage: (file: File) => void;
  onDeleteImage: () => void;
  isUploadingImage: boolean;
  isDeletingImage: boolean;
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
        }),
      )}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label text-xs">Name (EN)</label>
          <input className="input-base" {...register("name_en")} />
        </div>
        <div>
          <label className="label text-xs">Name (AR)</label>
          <input className="input-base" dir="rtl" {...register("name_ar")} />
        </div>
        <div>
          <label className="label text-xs">Currency</label>
          <input className="input-base" {...register("currency")} />
        </div>
        <div className="flex items-center gap-2 sm:col-span-3">
          <input
            type="checkbox"
            id="is_active_edit"
            className="h-4 w-4 rounded border-slate-300 text-teal-600"
            {...register("is_active")}
          />
          <label htmlFor="is_active_edit" className="text-sm text-slate-700">
            Active
          </label>
        </div>
      </div>

      {/* Cover image */}
      <div className="mt-4 border-t border-slate-200 pt-4">
        <span className="label text-xs block mb-2">Cover image</span>
        <div className="flex flex-wrap items-center gap-3">
          {menu.img_url_1 && (
            <div className="relative">
              <img
                src={menu.img_url_1}
                alt="Menu cover"
                className="h-20 w-20 rounded-lg object-cover border border-slate-200"
              />
              <button
                type="button"
                onClick={() => onDeleteImage()}
                disabled={isDeletingImage}
                className="btn-ghost btn-sm absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-slate-700 text-white hover:bg-slate-800 shadow"
                title="Remove image"
              >
                {isDeletingImage ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </button>
            </div>
          )}
          <label className="btn-secondary btn-sm cursor-pointer inline-flex items-center gap-1.5">
            <input
              type="file"
              accept={MENU_IMAGE_ACCEPT}
              className="sr-only"
              disabled={isUploadingImage}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > MENU_IMAGE_MAX_MB * 1024 * 1024) {
                    toast.error(`Image must be ${MENU_IMAGE_MAX_MB} MB or smaller.`);
                    return;
                  }
                  onUploadImage(file);
                }
                e.target.value = "";
              }}
            />
            {isUploadingImage ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            {menu.img_url_1 ? "Change image" : "Upload image"}
          </label>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
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
