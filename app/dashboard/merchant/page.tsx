"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import {
  Store,
  Loader2,
  Save,
  Palette,
  ShieldAlert,
  Upload,
  ImageIcon,
} from "lucide-react";

import { useAuth } from "@/contexts";
import {
  fetchMerchants,
  updateMerchant,
  uploadMerchantLogo,
  getApiError,
} from "@/lib/api";

interface MerchantForm {
  name: string;
  logo: string;
  hexa_color_1: string;
  hexa_color_2: string;
  status: string;
}

function toColorInputValue(
  hex: string | undefined,
  fallback = "#e2e8f0"
): string {
  const raw = (hex || "").trim();
  if (!raw) return fallback;
  const normalized = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9A-Fa-f]{6}$/.test(normalized) ? normalized : fallback;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-black">
      {children}
    </label>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <div className="text-black">{icon}</div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function MerchantPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const { data: merchants, isLoading, error } = useQuery({
    queryKey: ["merchants"],
    queryFn: fetchMerchants,
    enabled: !!user?.merchant_id,
  });

  const merchant = merchants?.[0];

  const update = useMutation({
    mutationFn: (body: Parameters<typeof updateMerchant>[1]) =>
      updateMerchant(merchant!.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      setMessage({ type: "ok", text: "Merchant updated successfully." });
    },
    onError: (err) => {
      setMessage({ type: "err", text: getApiError(err) });
    },
  });

  const uploadLogo = useMutation({
    mutationFn: (file: File) => uploadMerchantLogo(merchant!.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      setMessage({ type: "ok", text: "Logo uploaded successfully." });
    },
    onError: (err) => {
      setMessage({ type: "err", text: getApiError(err) });
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
  } = useForm<MerchantForm>({
    defaultValues: {
      name: "",
      logo: "",
      hexa_color_1: "",
      hexa_color_2: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (!merchant) return;
    reset({
      name: merchant.name ?? "",
      logo: merchant.logo ?? "",
      hexa_color_1: merchant.hexa_color_1 ?? "",
      hexa_color_2: merchant.hexa_color_2 ?? "",
      status: merchant.status ?? "active",
    });
  }, [merchant, reset]);

  const color1 = watch("hexa_color_1");
  const color2 = watch("hexa_color_2");
  const logoPreview = watch("logo") || merchant?.logo || "";

  const brandPreviewStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${toColorInputValue(
        color1,
        "#0f172a"
      )}, ${toColorInputValue(color2, "#cbd5e1")})`,
    }),
    [color1, color2]
  );

  if (user?.role !== "owner") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-slate-700">
            Only owners can manage merchant settings.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !merchant) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-7 w-7 animate-spin text-slate-500" />
        <p className="text-sm text-slate-500">Loading merchant...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {getApiError(error)}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <Store className="h-6 w-6 text-slate-700" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Merchant Settings
          </h1>
          <p className="text-sm text-slate-500">
            Manage your business details and brand colors
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            message.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => {
          setMessage(null);
          update.mutate({
            name: data.name || undefined,
            logo: data.logo || null,
            hexa_color_1: data.hexa_color_1 || null,
            hexa_color_2: data.hexa_color_2 || null,
            status: data.status || undefined,
          });
        })}
        className="space-y-6"
      >
        <Card title="General" icon={<Store className="h-4 w-4" />}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel>Merchant name</FieldLabel>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 text-black"
                placeholder="e.g. My Restaurant"
                {...register("name")}
              />
            </div>

            {/* <div>
              <FieldLabel>Status</FieldLabel>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                {...register("status")}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div> */}

            {/* <div>
              <FieldLabel>Logo URL</FieldLabel>
              <input
                type="url"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                placeholder="https://example.com/logo.png"
                {...register("logo")}
              />
            </div> */}

            <div className="md:col-span-2">
              <FieldLabel>Logo</FieldLabel>
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Merchant logo"
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    <Upload className="h-4 w-4" />
                    Upload image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      disabled={uploadLogo.isPending}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setMessage({
                              type: "err",
                              text: "Logo must be 5 MB or smaller.",
                            });
                            e.target.value = "";
                            return;
                          }

                          setMessage(null);
                          uploadLogo.mutate(file);
                        }

                        e.target.value = "";
                      }}
                    />
                  </label>

                  {uploadLogo.isPending && (
                    <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                  )}

                  <p className="text-xs text-slate-500">
                    JPEG, PNG, WebP or GIF. Max 5 MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Branding" icon={<Palette className="h-4 w-4" />}>
          <div className="space-y-5">
            <div
              className="flex h-28 items-center justify-center rounded-2xl text-sm font-semibold text-white"
              style={brandPreviewStyle}
            >
              Brand Preview
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <FieldLabel>Primary color</FieldLabel>
                <div className="flex items-center gap-3">
                  <Controller
                    name="hexa_color_1"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="color"
                        value={toColorInputValue(field.value, "#0f172a")}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white"
                      />
                    )}
                  />
                  <span className="font-mono text-sm text-slate-700">
                    {toColorInputValue(color1, "#0f172a")}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <FieldLabel>Secondary color</FieldLabel>
                <div className="flex items-center gap-3">
                  <Controller
                    name="hexa_color_2"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="color"
                        value={toColorInputValue(field.value, "#cbd5e1")}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white"
                      />
                    )}
                  />
                  <span className="font-mono text-sm text-slate-700">
                    {toColorInputValue(color2, "#cbd5e1")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={update.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-system-green px-4 py-2.5 text-sm font-medium text-white transition hover:bg-system-green/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
          >
            {update.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save changes
              </>
            )}
          </button>

          {message?.type === "ok" && (
            <span className="text-sm font-medium text-emerald-700">
              Saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}