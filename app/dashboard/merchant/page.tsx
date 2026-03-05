"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import { fetchMerchants, updateMerchant, getApiError } from "@/lib/api";
import { useForm } from "react-hook-form";
import { Store, Loader2 } from "lucide-react";
import { useState } from "react";

interface MerchantForm {
  name: string;
  logo: string;
  has_color_1: string;
  has_color_2: string;
  status: string;
}

export default function MerchantPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const {
    data: merchants,
    isLoading,
    error,
  } = useQuery({
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
      setMessage({ type: "ok", text: "Merchant updated." });
    },
    onError: (err) => setMessage({ type: "err", text: getApiError(err) }),
  });

  const { register, handleSubmit, reset } = useForm<MerchantForm>({
    values: merchant
      ? {
          name: merchant.name ?? "",
          logo: merchant.logo ?? "",
          has_color_1: merchant.has_color_1 ?? "",
          has_color_2: merchant.has_color_2 ?? "",
          status: merchant.status ?? "active",
        }
      : undefined,
  });

  if (user?.role !== "owner") {
    return (
      <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
        Only owners can manage merchant settings.
      </div>
    );
  }

  if (isLoading || !merchant) {
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
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-zinc-800">
        <Store className="h-7 w-7 text-teal-600" />
        Merchant
      </h1>
      <form
        onSubmit={handleSubmit((data) => {
          setMessage(null);
          update.mutate({
            name: data.name || undefined,
            logo: data.logo || null,
            has_color_1: data.has_color_1 || null,
            has_color_2: data.has_color_2 || null,
            status: data.status || undefined,
          });
        })}
        className="max-w-xl space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        {message && (
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              message.type === "ok"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Name
          </label>
          <input
            type="text"
            className="w-full text-zinc-700 rounded-lg border border-zinc-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            {...register("name")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Logo URL
          </label>
          <input
            type="url"
            className="w-full text-zinc-700 rounded-lg border border-zinc-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            {...register("logo")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Primary color (hex)
            </label>
            <input
              type="text"
              placeholder="#0f766e"
              className="w-full text-zinc-700 rounded-lg border border-zinc-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              {...register("has_color_1")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Secondary color (hex)
            </label>
            <input
              type="text"
              placeholder="#14b8a6"
              className="w-full text-zinc-700 rounded-lg border border-zinc-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              {...register("has_color_2")}
            />
          </div>
        </div>
        {/* <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Status
          </label>
          <select
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            {...register("status")}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div> */}
        <button
          type="submit"
          disabled={update.isPending}
          className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {update.isPending ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
