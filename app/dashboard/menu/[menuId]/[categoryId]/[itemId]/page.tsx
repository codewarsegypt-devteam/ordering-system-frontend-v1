"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts";
import {
  fetchMenus, fetchMenuCategories, fetchItem, updateItem, updateItemStatus,
  fetchItemVariants, createVariant, updateVariant, deleteVariant,
  fetchItemModifierGroups, attachModifierGroup, updateItemModifierGroup, detachModifierGroup,
  uploadItemImages,
  getApiError,
} from "@/lib/api";
import { fetchModifierGroups } from "@/lib/api/modifiers";
import type { ItemDto, ItemVariantDto, ItemModifierGroupLinkDto } from "@/lib/api/items";
import type { ModifierGroupDto } from "@/lib/api/modifiers";
import { useForm } from "react-hook-form";
import {
  Loader2, Plus, Trash2, Package, ChevronRight,
  Pencil, Check, X, Layers, Tag, DollarSign, Settings2, ImageIcon, Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { useMerchantBaseCurrency } from "@/lib/hooks/useMerchantBaseCurrency";
import { toast } from "sonner";

const canEdit = (role: string) => role === "owner" || role === "manager";

const statusBadge: Record<string, string> = {
  active:       "badge badge-success",
  hidden:       "badge badge-neutral",
  out_of_stock: "badge badge-error",
};

export default function ItemDetailPage() {
  const params = useParams();
  const menuId    = params?.menuId as string;
  const categoryId = params?.categoryId as string;
  const itemId    = params?.itemId as string;
  const { user } = useAuth();
  const { formatPrice, currencyCode } = useMerchantBaseCurrency();
  const queryClient = useQueryClient();
  const [editForm, setEditForm] = useState(false);
  const [addVariant, setAddVariant] = useState(false);
  const [addModGrp, setAddModGrp] = useState(false);

  const { data: menus } = useQuery({ queryKey: ["menus", user?.merchant_id], queryFn: fetchMenus, enabled: !!user?.merchant_id });
  const { data: categories } = useQuery({ queryKey: ["menuCategories", menuId], queryFn: () => fetchMenuCategories(menuId), enabled: !!menuId });
  const { data: item, isLoading, error } = useQuery({ queryKey: ["item", itemId], queryFn: () => fetchItem(itemId), enabled: !!itemId });
  const { data: links } = useQuery({ queryKey: ["itemModifierGroups", itemId], queryFn: () => fetchItemModifierGroups(itemId), enabled: !!itemId });
  const { data: allGroups } = useQuery({ queryKey: ["modifierGroups"], queryFn: fetchModifierGroups, enabled: !!user?.merchant_id });

  const menu = menus?.find((m) => m.id === menuId);
  const category = categories?.find((c) => c.id === categoryId);
  const menuName = menu?.name_en ?? menu?.name_ar ?? "Menu";
  const categoryName = category?.name_en ?? category?.name_ar ?? "Category";
  const editable = canEdit(user?.role ?? "");

  if (isLoading || !item) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  );
  if (error) return <div className="alert-error">{getApiError(error)}</div>;

  return (
    <div className="space-y-5">
      {/* Breadcrumb + title */}
      <div>
        <nav className="breadcrumb mb-1.5">
          <Link href="/dashboard/menu" className="hover:text-teal-600">Menus</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href={`/dashboard/menu/${menuId}`} className="hover:text-teal-600">{menuName}</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href={`/dashboard/menu/${menuId}/${categoryId}`} className="hover:text-teal-600">{categoryName}</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="font-medium text-slate-700">{item.name_en ?? item.name_ar ?? "Item"}</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100">
            <Package className="h-5 w-5 text-teal-600" />
          </div>
          <h1 className="page-title">{item.name_en ?? item.name_ar ?? item.id}</h1>
        </div>
      </div>

      {/* ── Item info card ── */}
      <div className="form-card">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-slate-400" />
            <h2 className="section-title">Item details</h2>
          </div>
          {editable && !editForm && (
            <button type="button" onClick={() => setEditForm(true)} className="btn-secondary btn-sm">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>

        {!editForm ? (
          /* Read view */
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500 mb-1">Name (EN)</p>
              <p className="font-semibold text-slate-800">{item.name_en ?? "—"}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500 mb-1">Name (AR)</p>
              <p className="font-semibold text-slate-800" dir="rtl">{item.name_ar ?? "—"}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500 mb-1">Base price</p>
              <p className="flex items-center gap-1 font-bold text-teal-700">
                <DollarSign className="h-4 w-4" />
                {formatPrice(item.base_price)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 sm:col-span-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
                <span className={statusBadge[item.status] ?? "badge badge-neutral"}>
                  {item.status.replace("_", " ")}
                </span>
              </div>
              {editable && (
                <ItemStatusButtons item={item} queryClient={queryClient} />
              )}
            </div>
            <div className="rounded-lg bg-slate-50 p-3 sm:col-span-3">
              <p className="text-xs font-medium text-slate-500 mb-1">Description (EN)</p>
              <p className="font-medium text-slate-800 whitespace-pre-wrap">{item.description_en?.trim() || "—"}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 sm:col-span-3">
              <p className="text-xs font-medium text-slate-500 mb-1">Description (AR)</p>
              <p className="font-medium text-slate-800 whitespace-pre-wrap" dir="rtl">{item.description_ar?.trim() || "—"}</p>
            </div>
          </div>
        ) : (
          /* Edit form */
          <ItemEditForm
            item={item}
            onSave={() => { queryClient.invalidateQueries({ queryKey: ["item", itemId] }); setEditForm(false); toast.success("Item updated."); }}
            onCancel={() => setEditForm(false)}
            onError={(e) => toast.error(getApiError(e))}
          />
        )}
      </div>

      {/* ── Item images ── */}
      <ItemImagesCard
        itemId={itemId}
        categoryId={categoryId}
        images={item.images ?? { img_url_1: null, img_url_2: null }}
        editable={editable}
      />

      {/* ── Variants card ── */}
      <VariantsCard
        itemId={itemId}
        editable={editable}
        addVariant={addVariant}
        setAddVariant={setAddVariant}
      />

      {/* ── Modifier groups card ── */}
      <ModifierGroupsCard
        itemId={itemId}
        links={links ?? []}
        allGroups={allGroups ?? []}
        editable={editable}
        addModGrp={addModGrp}
        setAddModGrp={setAddModGrp}
      />
    </div>
  );
}

/* ─── Item images card ─── */
function ItemImagesCard({
  itemId,
  categoryId,
  images,
  editable,
}: {
  itemId: string;
  categoryId: string;
  images: { img_url_1: string | null; img_url_2: string | null };
  editable: boolean;
}) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const uploadMut = useMutation({
    mutationFn: (formData: FormData) => uploadItemImages(itemId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      queryClient.invalidateQueries({ queryKey: ["categoryItems", categoryId] });
      toast.success("Images updated.");
      setUploading(false);
      formRef.current?.reset();
    },
    onError: (e) => {
      toast.error(getApiError(e));
      setUploading(false);
    },
  });

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input1 = form.querySelector<HTMLInputElement>('input[name="image1"]');
    const input2 = form.querySelector<HTMLInputElement>('input[name="image2"]');
    const file1 = input1?.files?.[0];
    const file2 = input2?.files?.[0];
    if (!file1 && !file2) {
      toast.error("Choose at least one image.");
      return;
    }
    const formData = new FormData();
    if (file1) formData.append("image1", file1);
    if (file2) formData.append("image2", file2);
    setUploading(true);
    uploadMut.mutate(formData);
  };

  return (
    <div className="form-card">
      <div className="mb-4 flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-slate-400" />
        <h2 className="section-title">Item images</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-medium text-slate-500">Image 1</p>
          {images.img_url_1 ? (
            <Image
              src={images.img_url_1}
              alt="Item 1"
              width={400}
              height={160}
              className="h-40 w-full rounded-lg object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-medium text-slate-500">Image 2</p>
          {images.img_url_2 ? (
            <Image
              src={images.img_url_2}
              alt="Item 2"
              width={400}
              height={160}
              className="h-40 w-full rounded-lg object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
        </div>
      </div>
      {editable && (
        <form ref={formRef} onSubmit={handleUpload} className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="label text-xs">Image 1</label>
            <input
              type="file"
              name="image1"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="block w-full text-sm text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>
          <div>
            <label className="label text-xs">Image 2</label>
            <input
              type="file"
              name="image2"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="block w-full text-sm text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>
          <button type="submit" disabled={uploading} className="btn-primary">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ─── Quick status buttons ─── */
function ItemStatusButtons({ item, queryClient }: { item: ItemDto; queryClient: ReturnType<typeof useQueryClient> }) {
  const mut = useMutation({
    mutationFn: (status: "active" | "hidden" | "out_of_stock") => updateItemStatus(item.id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["item", item.id] }); toast.success("Status updated."); },
    onError: (e) => toast.error(getApiError(e)),
  });
  return (
    <div className="flex flex-wrap gap-2">
      {item.status !== "active" && (
        <button type="button" onClick={() => mut.mutate("active")} disabled={mut.isPending}
          className="btn-primary btn-sm">
          Set active
        </button>
      )}
      {item.status === "active" && (
        <button type="button" onClick={() => mut.mutate("out_of_stock")} disabled={mut.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
          Out of stock
        </button>
      )}
      {item.status !== "hidden" && (
        <button type="button" onClick={() => mut.mutate("hidden")} disabled={mut.isPending}
          className="btn-secondary btn-sm">
          Hide
        </button>
      )}
    </div>
  );
}

/* ─── Edit form ─── */
function ItemEditForm({ item, onSave, onCancel, onError }: {
  item: ItemDto;
  onSave: () => void;
  onCancel: () => void;
  onError: (e: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { currencyCode } = useMerchantBaseCurrency();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name_en: item.name_en ?? "",
      name_ar: item.name_ar ?? "",
      description_en: item.description_en ?? "",
      description_ar: item.description_ar ?? "",
      base_price: item.base_price,
      status: item.status,
    },
  });
  const mut = useMutation({
    mutationFn: (body: Parameters<typeof updateItem>[1]) => updateItem(item.id, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["item", item.id] }); onSave(); },
    onError,
  });
  return (
    <form onSubmit={handleSubmit((d) => mut.mutate({
      name_en: d.name_en,
      name_ar: d.name_ar,
      description_en: d.description_en?.trim() || null,
      description_ar: d.description_ar?.trim() || null,
      base_price: Number(d.base_price),
      status: d.status as "active" | "hidden" | "out_of_stock",
    }))}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name (EN)</label>
          <input className="input-base" {...register("name_en")} />
        </div>
        <div>
          <label className="label">Name (AR)</label>
          <input className="input-base" dir="rtl" {...register("name_ar")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description (EN)</label>
          <textarea className="input-base min-h-[80px] resize-y" {...register("description_en")} placeholder="Short description in English" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description (AR)</label>
          <textarea className="input-base min-h-[80px] resize-y" dir="rtl" {...register("description_ar")} placeholder="وصف قصير بالعربية" />
        </div>
        <div>
          <label className="label">Base price ({currencyCode})</label>
          <input type="number" step="0.01" min="0" className="input-base" {...register("base_price", { valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input-base" {...register("status")}>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={mut.isPending} className="btn-primary btn-sm">
          {mut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary btn-sm">Cancel</button>
      </div>
    </form>
  );
}

/* ─── Variants card ─── */
function VariantsCard({ itemId, editable, addVariant, setAddVariant }: {
  itemId: string; editable: boolean;
  addVariant: boolean; setAddVariant: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { formatPrice } = useMerchantBaseCurrency();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: variants, isLoading } = useQuery({
    queryKey: ["itemVariants", itemId],
    queryFn: () => fetchItemVariants(itemId),
    enabled: !!itemId,
  });

  const createMut = useMutation({
    mutationFn: (body: { name_ar: string; name_en: string; price: number }) => createVariant(itemId, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["itemVariants", itemId] }); setAddVariant(false); toast.success("Variant added."); },
    onError: (e) => toast.error(getApiError(e)),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<{ name_en: string; name_ar: string; price: number }> }) => updateVariant(id, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["itemVariants", itemId] }); setEditingId(null); toast.success("Variant updated."); },
    onError: (e) => toast.error(getApiError(e)),
  });

  const deleteMut = useMutation({
    mutationFn: deleteVariant,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["itemVariants", itemId] }); toast.success("Variant deleted."); },
    onError: (e) => toast.error(getApiError(e)),
  });

  return (
    <div className="form-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-slate-400" />
          <h2 className="section-title">Variants</h2>
          <span className="badge badge-neutral">{variants?.length ?? 0}</span>
        </div>
        {editable && !addVariant && (
          <button type="button" onClick={() => setAddVariant(true)} className="btn-primary btn-sm">
            <Plus className="h-3.5 w-3.5" /> Add variant
          </button>
        )}
      </div>
      <p className="mb-4 text-xs text-slate-500">Use variants for sizes or versions (e.g. Small, Large). If no variants, the base price applies.</p>

      {addVariant && (
        <VariantForm
          onSubmit={(b) => createMut.mutate(b)}
          onCancel={() => setAddVariant(false)}
          isPending={createMut.isPending}
        />
      )}

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
      ) : !variants || variants.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No variants — item uses base price.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Variant</th>
                <th>Price</th>
                {editable && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id}>
                  {editingId === v.id ? (
                    <td colSpan={editable ? 3 : 2} className="p-0">
                      <div className="px-4 py-3 bg-slate-50">
                        <VariantForm
                          defaultValues={{ name_en: v.name_en ?? "", name_ar: v.name_ar ?? "", price: v.price }}
                          onSubmit={(b) => updateMut.mutate({ id: v.id, body: b })}
                          onCancel={() => setEditingId(null)}
                          isPending={updateMut.isPending}
                        />
                      </div>
                    </td>
                  ) : (
                    <>
                      <td>
                        <span className="font-medium text-slate-700">{v.name_en ?? v.name_ar}</span>
                        {v.name_ar && v.name_en && <span className="ml-2 text-xs text-slate-400" dir="rtl">{v.name_ar}</span>}
                      </td>
                      <td className="font-semibold text-teal-700">{formatPrice(v.price)}</td>
                      {editable && (
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" onClick={() => setEditingId(v.id)} className="btn-ghost p-1.5">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button type="button"
                              onClick={() => { if (confirm("Delete this variant?")) deleteMut.mutate(v.id); }}
                              className="btn-ghost p-1.5 text-red-500 hover:bg-red-50">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function VariantForm({ defaultValues, onSubmit, onCancel, isPending }: {
  defaultValues?: { name_en?: string; name_ar?: string; price?: number };
  onSubmit: (b: { name_en: string; name_ar: string; price: number }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { currencyCode } = useMerchantBaseCurrency();
  const { register, handleSubmit } = useForm<{ name_en: string; name_ar: string; price: number }>({
    defaultValues: { name_en: defaultValues?.name_en ?? "", name_ar: defaultValues?.name_ar ?? "", price: defaultValues?.price ?? 0 },
  });
  return (
    <form onSubmit={handleSubmit((d) => onSubmit({ name_en: d.name_en, name_ar: d.name_ar, price: Number(d.price) }))}
      className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-28">
        <label className="label text-xs">Name (EN) *</label>
        <input className="input-base" placeholder="e.g. Large" {...register("name_en", { required: true })} />
      </div>
      <div className="flex-1 min-w-28">
        <label className="label text-xs">Name (AR)</label>
        <input className="input-base" dir="rtl" placeholder="كبير" {...register("name_ar")} />
      </div>
      <div className="w-28">
        <label className="label text-xs">Price ({currencyCode}) *</label>
        <input type="number" step="0.01" min="0" className="input-base" {...register("price", { valueAsNumber: true })} />
      </div>
      <div className="flex gap-2 pb-0.5">
        <button type="submit" disabled={isPending} className="btn-primary btn-sm">
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary btn-sm">Cancel</button>
      </div>
    </form>
  );
}

/* ─── Modifier groups card ─── */
function ModifierGroupsCard({ itemId, links, allGroups, editable, addModGrp, setAddModGrp }: {
  itemId: string;
  links: ItemModifierGroupLinkDto[];
  allGroups: ModifierGroupDto[];
  editable: boolean;
  addModGrp: boolean;
  setAddModGrp: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const inv = () => {
    queryClient.invalidateQueries({ queryKey: ["item", itemId] });
    queryClient.invalidateQueries({ queryKey: ["itemModifierGroups", itemId] });
  };

  const attachMut = useMutation({
    mutationFn: (body: { modifier_group_id: string; min_select: number; max_select: number }) => attachModifierGroup(itemId, body),
    onSuccess: () => { inv(); setAddModGrp(false); toast.success("Modifier group attached."); },
    onError: (e) => toast.error(getApiError(e)),
  });
  const updateLinkMut = useMutation({
    mutationFn: ({ groupId, body }: { groupId: string; body: { min_select: number; max_select: number } }) => updateItemModifierGroup(itemId, groupId, body),
    onSuccess: () => { inv(); setEditingLinkId(null); toast.success("Updated."); },
    onError: (e) => toast.error(getApiError(e)),
  });
  const detachMut = useMutation({
    mutationFn: (groupId: string) => detachModifierGroup(itemId, groupId),
    onSuccess: () => { inv(); toast.success("Detached."); },
    onError: (e) => toast.error(getApiError(e)),
  });

  const groupById = new Map(allGroups.map((g) => [g.id, g]));
  const safeLinks = links.filter((l) => l?.modifier_group_id);
  const available = allGroups.filter((g) => !safeLinks.some((l) => l.modifier_group_id === g.id));

  return (
    <div className="form-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-400" />
          <h2 className="section-title">Modifier groups</h2>
          <span className="badge badge-neutral">{safeLinks.length}</span>
        </div>
        {editable && !addModGrp && (
          <button type="button" onClick={() => setAddModGrp(true)} className="btn-primary btn-sm">
            <Plus className="h-3.5 w-3.5" /> Attach group
          </button>
        )}
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Attach modifier groups so customers can add extras (e.g. sauce, toppings).{" "}
        <Link href="/dashboard/modifiers" className="font-medium text-teal-600 hover:underline">
          Manage groups →
        </Link>
      </p>

      {addModGrp && (
        <div className="mb-4 rounded-lg border border-teal-100 bg-teal-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-teal-800">Attach modifier group</h3>
          {available.length === 0 ? (
            <p className="text-sm text-amber-600">All groups are already attached. <Link href="/dashboard/modifiers" className="underline">Create more groups.</Link></p>
          ) : (
            <AttachForm available={available} onAttach={(b) => attachMut.mutate(b)} onCancel={() => setAddModGrp(false)} isPending={attachMut.isPending} />
          )}
        </div>
      )}

      {safeLinks.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No modifier groups attached.</p>
      ) : (
        <div className="card overflow-hidden divide-y divide-slate-100">
          {safeLinks.map((link) => {
            const group = groupById.get(link.modifier_group_id);
            const name = group ? (group.name_en ?? group.name_ar ?? group.id) : link.modifier_group_id?.slice(0, 8) + "…";
            return (
              <div key={link.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                    <Layers className="h-4 w-4 text-violet-500" />
                  </div>
                  <span className="flex-1 font-medium text-slate-800">{name}</span>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs">min {link.min_select}</span>
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs">max {link.max_select}</span>
                  </div>
                  {editable && !editingLinkId && (
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setEditingLinkId(link.id)} className="btn-ghost p-1.5" title="Edit min/max">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button"
                        onClick={() => { if (confirm("Detach this modifier group?")) detachMut.mutate(link.modifier_group_id); }}
                        className="btn-ghost p-1.5 text-red-500 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                {editingLinkId === link.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <MinMaxForm
                      min={link.min_select}
                      max={link.max_select}
                      onSave={(min, max) => updateLinkMut.mutate({ groupId: link.modifier_group_id, body: { min_select: min, max_select: max } })}
                      onCancel={() => setEditingLinkId(null)}
                      isPending={updateLinkMut.isPending}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AttachForm({ available, onAttach, onCancel, isPending }: {
  available: ModifierGroupDto[];
  onAttach: (b: { modifier_group_id: string; min_select: number; max_select: number }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<{ modifier_group_id: string; min_select: number; max_select: number }>({
    defaultValues: { min_select: 0, max_select: 1 },
  });
  return (
    <form onSubmit={handleSubmit(onAttach)} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-36">
        <label className="label text-xs">Modifier group</label>
        <select className="input-base" {...register("modifier_group_id", { required: true })}>
          <option value="">Select group…</option>
          {available.map((g) => (
            <option key={g.id} value={g.id}>{g.name_en ?? g.name_ar ?? g.id}</option>
          ))}
        </select>
      </div>
      <div className="w-20">
        <label className="label text-xs">Min select</label>
        <input type="number" min={0} className="input-base" {...register("min_select", { valueAsNumber: true })} />
      </div>
      <div className="w-20">
        <label className="label text-xs">Max select</label>
        <input type="number" min={0} className="input-base" {...register("max_select", { valueAsNumber: true })} />
      </div>
      <div className="flex gap-2 pb-0.5">
        <button type="submit" disabled={isPending} className="btn-primary btn-sm">
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Attach
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary btn-sm">Cancel</button>
      </div>
    </form>
  );
}

function MinMaxForm({ min, max, onSave, onCancel, isPending }: {
  min: number; max: number;
  onSave: (min: number, max: number) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit } = useForm<{ min_select: number; max_select: number }>({
    defaultValues: { min_select: min, max_select: max },
  });
  return (
    <form onSubmit={handleSubmit((d) => onSave(d.min_select, d.max_select))} className="flex flex-wrap items-end gap-3">
      <div className="w-24">
        <label className="label text-xs">Min select</label>
        <input type="number" min={0} className="input-base" {...register("min_select", { valueAsNumber: true })} />
      </div>
      <div className="w-24">
        <label className="label text-xs">Max select</label>
        <input type="number" min={0} className="input-base" {...register("max_select", { valueAsNumber: true })} />
      </div>
      <div className="flex gap-2 pb-0.5">
        <button type="submit" disabled={isPending} className="btn-primary btn-sm">
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary btn-sm">Cancel</button>
      </div>
    </form>
  );
}
