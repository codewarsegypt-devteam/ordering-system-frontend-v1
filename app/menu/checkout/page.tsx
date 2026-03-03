"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useCart } from "@/contexts";
import {
  fetchPublicMenu,
  createOrder,
  getApiError,
} from "@/lib/api";
import type { OrderType } from "@/lib/types";
import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";

interface CheckoutForm {
  order_type: OrderType;
  customer_name: string;
  customer_phone: string;
  notes: string;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchantId") ?? "";
  const tableCode = searchParams.get("tableCode") ?? "";

  const { lineItems, clearCart, totalItems } = useCart();
  const [orderResult, setOrderResult] = useState<{
    order_number: string;
    total_price: number;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: menuData } = useQuery({
    queryKey: ["publicMenu", merchantId, tableCode],
    queryFn: () => fetchPublicMenu(merchantId, tableCode),
    enabled: !!merchantId,
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CheckoutForm>({
    defaultValues: {
      order_type: menuData?.table_id ? "dine_in" : "pickup",
      customer_name: "",
      customer_phone: "",
      notes: "",
    },
  });

  if (!merchantId || !menuData) {
    return (
      <div className="luxury-page flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--luxury-accent)] border-t-transparent" />
      </div>
    );
  }

  const branchId = menuData.branch_id;
  if (!branchId) {
    return (
      <div className="luxury-page flex min-h-screen flex-col items-center justify-center px-6">
        <p className="text-center text-[var(--luxury-text-muted)]">
          No branch set. Open the menu with a table code to place an order.
        </p>
        <Link
          href={`/menu?merchantId=${merchantId}`}
          className="luxury-accent-btn mt-6 rounded-xl px-5 py-2.5 font-semibold"
        >
          Back to menu
        </Link>
      </div>
    );
  }

  if (totalItems === 0 && !orderResult) {
    return (
      <div className="luxury-page flex min-h-screen flex-col items-center justify-center px-6">
        <p className="text-[var(--luxury-text-muted)]">Your cart is empty.</p>
        <Link
          href={`/menu?merchantId=${merchantId}&tableCode=${tableCode}`}
          className="luxury-accent-btn mt-6 rounded-xl px-5 py-2.5 font-semibold"
        >
          Back to menu
        </Link>
      </div>
    );
  }

  if (orderResult) {
    return (
      <div className="luxury-page flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-[var(--luxury-border)] bg-[var(--luxury-surface)] p-10 text-center shadow-[var(--luxury-shadow-lg)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-[var(--luxury-accent)]">
            <CheckCircle className="h-12 w-12" strokeWidth={2} />
          </div>
          <h1 className="font-luxury text-2xl font-semibold text-[var(--luxury-text)]">
            Order placed
          </h1>
          <p className="mt-3 font-mono text-2xl font-semibold text-[var(--luxury-accent)]">
            #{orderResult.order_number}
          </p>
          <p className="mt-2 text-[var(--luxury-text-muted)]">
            Total: {orderResult.total_price.toFixed(2)} {menuData.menu.currancy}
          </p>
          <Link
            href={`/menu?merchantId=${merchantId}&tableCode=${tableCode}`}
            className="luxury-accent-btn mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold shadow-lg"
          >
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (form: CheckoutForm) => {
    setSubmitError(null);
    try {
      const res = await createOrder({
        merchant_id: merchantId,
        branch_id: branchId,
        table_id: menuData.table_id ?? null,
        order_type: form.order_type,
        customer_name: form.customer_name || undefined,
        customer_phone: form.customer_phone || undefined,
        notes: form.notes || undefined,
        items: lineItems,
      });
      setOrderResult({
        order_number: res.order_number,
        total_price: res.total_price,
      });
      clearCart();
    } catch (err) {
      setSubmitError(getApiError(err));
    }
  };

  return (
    <div className="luxury-page min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--luxury-border)] bg-[var(--luxury-surface)]/98 shadow-[var(--luxury-shadow)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-lg items-center px-4 sm:px-6">
          <Link
            href={`/menu/cart?merchantId=${merchantId}&tableCode=${tableCode}`}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--luxury-text-muted)] transition-colors hover:text-[var(--luxury-accent)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Cart
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <h1 className="font-luxury mb-8 text-2xl font-semibold text-[var(--luxury-text)]">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-2xl border border-[var(--luxury-border)] bg-[var(--luxury-surface)] p-6 shadow-[var(--luxury-shadow)]"
        >
          {submitError && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div>
            <label className="label text-[var(--luxury-text)]">
              Order type
            </label>
            <select
              className="input-base border-[var(--luxury-border)] focus:border-[var(--luxury-accent)] focus:ring-[var(--luxury-accent)]/20"
              {...register("order_type", { required: true })}
            >
              <option value="dine_in">Dine in</option>
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          <div>
            <label className="label text-[var(--luxury-text)]">
              Name (optional)
            </label>
            <input
              type="text"
              className="input-base border-[var(--luxury-border)] focus:border-[var(--luxury-accent)] focus:ring-[var(--luxury-accent)]/20"
              {...register("customer_name")}
            />
          </div>

          <div>
            <label className="label text-[var(--luxury-text)]">
              Phone (optional)
            </label>
            <input
              type="tel"
              className="input-base border-[var(--luxury-border)] focus:border-[var(--luxury-accent)] focus:ring-[var(--luxury-accent)]/20"
              {...register("customer_phone")}
            />
          </div>

          <div>
            <label className="label text-[var(--luxury-text)]">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              className="input-base border-[var(--luxury-border)] focus:border-[var(--luxury-accent)] focus:ring-[var(--luxury-accent)]/20"
              {...register("notes")}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="luxury-accent-btn w-full rounded-xl py-3.5 font-semibold shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Placing order…
              </span>
            ) : (
              "Place order"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
