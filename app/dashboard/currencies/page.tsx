"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import {
  listAllCurrencies,
  getMerchantCurrencies,
  setBaseCurrency,
  addDisplayCurrency,
  updateDisplayCurrency,
  deleteDisplayCurrency,
} from "@/lib/api/currencies";
import type { Currency, AvailableCurrency } from "@/lib/types/currency";
import {
  Coins,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Check,
  Star,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  formSelectTriggerClassName,
} from "@/components/ui/select";

export default function CurrenciesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const isOwner = user?.role === "owner";

  const { data: setup, isLoading: loadingSetup } = useQuery({
    queryKey: ["merchantCurrencies"],
    queryFn: getMerchantCurrencies,
    enabled: isOwner,
  });

  const { data: allCurrencies = [] } = useQuery({
    queryKey: ["allCurrencies"],
    queryFn: listAllCurrencies,
    enabled: isOwner,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["merchantCurrencies"] });

  // ── Base currency ──
  const [showBaseModal, setShowBaseModal] = React.useState(false);
  const [selectedBaseId, setSelectedBaseId] = React.useState<number | null>(null);

  const setBaseMutation = useMutation({
    mutationFn: (id: number) => setBaseCurrency(id),
    onSuccess: () => {
      toast.success("Base currency updated");
      setShowBaseModal(false);
      invalidate();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update base currency";
      toast.error(msg);
    },
  });

  // ── Add display currency ──
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [addForm, setAddForm] = React.useState({
    currency_id: "",
    rate_from_base: "",
    is_default_display: false,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      addDisplayCurrency({
        currency_id: Number(addForm.currency_id),
        rate_from_base: Number(addForm.rate_from_base),
        is_default_display: addForm.is_default_display,
      }),
    onSuccess: () => {
      toast.success("Display currency added");
      setShowAddModal(false);
      setAddForm({ currency_id: "", rate_from_base: "", is_default_display: false });
      invalidate();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to add currency";
      toast.error(msg);
    },
  });

  // ── Edit display currency ──
  const [editEntry, setEditEntry] = React.useState<AvailableCurrency | null>(null);
  const [editForm, setEditForm] = React.useState({
    rate_from_base: "",
    is_active: true,
    is_default_display: false,
  });

  const openEdit = (entry: AvailableCurrency) => {
    setEditEntry(entry);
    setEditForm({
      rate_from_base: String(entry.rate_from_base),
      is_active: entry.is_active,
      is_default_display: entry.is_default_display,
    });
  };

  const editMutation = useMutation({
    mutationFn: () =>
      updateDisplayCurrency(editEntry!.id, {
        rate_from_base: Number(editForm.rate_from_base),
        is_active: editForm.is_active,
        is_default_display: editForm.is_default_display,
      }),
    onSuccess: () => {
      toast.success("Currency updated");
      setEditEntry(null);
      invalidate();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update";
      toast.error(msg);
    },
  });

  // ── Delete display currency ──
  const [deleteConfirm, setDeleteConfirm] = React.useState<AvailableCurrency | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (mcId: number) => deleteDisplayCurrency(mcId),
    onSuccess: () => {
      toast.success("Currency removed");
      setDeleteConfirm(null);
      invalidate();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      toast.error(msg);
    },
  });

  if (!isOwner) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="alert-warning mx-auto max-w-sm">
          <AlertTriangle className="h-5 w-5" />
          <span>Access denied — owner role required.</span>
        </div>
      </div>
    );
  }

  const displayCurrencies = setup?.display_currencies ?? [];
  const addedIds = new Set(displayCurrencies.map((d) => d.currency_id));
  const baseCurrencyId = setup?.base_currency?.id;
  const availableToAdd = allCurrencies.filter((c) => !addedIds.has(c.id));

  React.useEffect(() => {
    const selectedId = Number(addForm.currency_id || 0);
    if (!selectedId || !baseCurrencyId) return;

    if (selectedId === baseCurrencyId && !addForm.rate_from_base) {
      setAddForm((f) => ({ ...f, rate_from_base: "1" }));
    }
  }, [addForm.currency_id, addForm.rate_from_base, baseCurrencyId]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "var(--system-primary-soft)" }}
        >
          <Coins className="h-6 w-6" style={{ color: "var(--system-primary)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Currencies</h1>
          <p className="text-sm text-slate-500">
            Set your base currency and configure display currencies for customers.
          </p>
        </div>
      </div>

      {loadingSetup ? (
        <div className="flex items-center justify-center py-20">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: "var(--system-primary)" }}
          />
        </div>
      ) : (
        <>
          {/* ── Base Currency Card ── */}
          <div className="card">
            <div
              className="flex items-center gap-3 rounded-t-xl px-5 py-4"
              style={{
                backgroundColor: "var(--system-cream)",
                borderBottom: "1px solid var(--system-sage)",
              }}
            >
              <Coins className="h-5 w-5" style={{ color: "var(--system-primary)" }} />
              <h2 className="text-sm font-semibold text-slate-900">Base Currency</h2>
            </div>

            <div className="px-5 py-5">
              <p className="mb-4 text-sm text-slate-500">
                The single source of truth for all item prices. All other currencies are
                display-only conversions.
              </p>

              {setup?.base_currency ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {setup.base_currency.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {setup.base_currency.symbol} · {setup.base_currency.code}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBaseId(setup.base_currency!.id);
                      setShowBaseModal(true);
                    }}
                    className="btn-secondary text-sm"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Change
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-sm text-slate-400">No base currency set</p>
                  <button
                    type="button"
                    onClick={() => setShowBaseModal(true)}
                    className="btn-primary text-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Set Base Currency
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Display Currencies Card ── */}
          <div className="card">
            <div
              className="flex items-center justify-between rounded-t-xl px-5 py-4"
              style={{
                backgroundColor: "var(--system-cream)",
                borderBottom: "1px solid var(--system-sage)",
              }}
            >
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5" style={{ color: "var(--system-primary)" }} />
                <h2 className="text-sm font-semibold text-slate-900">Display Currencies</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                disabled={availableToAdd.length === 0}
                className="btn-primary text-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Currency
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="mb-4 text-sm text-slate-500">
                Customers can view prices in these currencies. Prices are converted from
                the base currency using the rates you set.
              </p>

              {displayCurrencies.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                  <Coins className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">No display currencies configured.</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Add display currencies so customers can switch currency views.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Currency</th>
                        <th>Code</th>
                        <th>Symbol</th>
                        <th>Rate from Base</th>
                        <th>Active</th>
                        <th>Default</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayCurrencies.map((entry) => (
                        <tr key={entry.id}>
                          <td className="font-medium">{entry.currency.name}</td>
                          <td>
                            <span className="badge-info">{entry.currency.code}</span>
                          </td>
                          <td className="font-semibold text-gray-700">
                            {entry.currency.symbol}
                          </td>
                          <td>{entry.rate_from_base}</td>
                          <td>
                            {entry.is_active ? (
                              <span className="badge-success">Active</span>
                            ) : (
                              <span className="badge-warning">Inactive</span>
                            )}
                          </td>
                          <td>
                            {entry.is_default_display && (
                              <Star
                                className="h-4 w-4"
                                style={{ color: "var(--system-primary)" }}
                                fill="currentColor"
                              />
                            )}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(entry)}
                                className="btn-secondary text-xs px-2.5 py-1"
                              >
                                <Pencil className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirm(entry)}
                                className="btn-danger text-xs px-2.5 py-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Set Base Currency Modal ── */}
      {showBaseModal && (
        <Modal title="Set Base Currency" onClose={() => setShowBaseModal(false)}>
          <div
            className="mb-4 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: "var(--system-cream)",
              border: "1px solid var(--system-sage)",
              color: "#7a6a00",
            }}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Changing the base currency means all item prices are interpreted in the new
              currency. Ensure your item prices already reflect the new currency before
              making this change.
            </p>
          </div>

          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Select Base Currency
          </label>
          <Select
            value={
              selectedBaseId != null ? String(selectedBaseId) : "__none__"
            }
            onValueChange={(v) =>
              setSelectedBaseId(v === "__none__" ? null : Number(v))
            }
          >
            <SelectTrigger className={formSelectTriggerClassName}>
              <SelectValue placeholder="— choose currency —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— choose currency —</SelectItem>
              {allCurrencies.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name} ({c.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowBaseModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedBaseId || setBaseMutation.isPending}
              onClick={() => selectedBaseId && setBaseMutation.mutate(selectedBaseId)}
              className="btn-primary"
            >
              {setBaseMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* ── Add Display Currency Modal ── */}
      {showAddModal && (
        <Modal title="Add Display Currency" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Currency
              </label>
              <Select
                value={addForm.currency_id ? String(addForm.currency_id) : "__none__"}
                onValueChange={(v) =>
                  setAddForm((f) => ({
                    ...f,
                    currency_id:
                      v == null || v === "__none__" ? "" : v,
                  }))
                }
                required
              >
                <SelectTrigger className={formSelectTriggerClassName}>
                  <SelectValue placeholder="— select currency —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— select currency —</SelectItem>
                  {availableToAdd.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Exchange Rate from Base
              </label>
              <input
                type="number"
                step="0.000001"
                min="0.000001"
                placeholder="e.g. 0.021"
                value={addForm.rate_from_base}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, rate_from_base: e.target.value }))
                }
                className="input-base w-full"
                required
              />
              {setup?.base_currency && addForm.currency_id && (
                <p className="mt-1 text-xs text-slate-400">
                  {Number(addForm.currency_id) === baseCurrencyId ? (
                    <>
                      Same as base currency — rate is usually <strong>1</strong>.
                    </>
                  ) : (
                    <>
                      How many{" "}
                      {availableToAdd.find((c) => c.id === Number(addForm.currency_id))
                        ?.code ?? "?"}{" "}
                      = 1 {setup.base_currency.code}
                    </>
                  )}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={addForm.is_default_display}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, is_default_display: e.target.checked }))
                }
                className="h-4 w-4 rounded"
              />
              Set as default display currency for customers
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={
                !addForm.currency_id ||
                !addForm.rate_from_base ||
                Number(addForm.rate_from_base) <= 0 ||
                addMutation.isPending
              }
              onClick={() => addMutation.mutate()}
              className="btn-primary"
            >
              {addMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Currency
            </button>
          </div>
        </Modal>
      )}

      {/* ── Edit Display Currency Modal ── */}
      {editEntry && (
        <Modal
          title={`Edit ${editEntry.currency.name} (${editEntry.currency.code})`}
          onClose={() => setEditEntry(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Exchange Rate from Base
              </label>
              <input
                type="number"
                step="0.000001"
                min="0.000001"
                value={editForm.rate_from_base}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, rate_from_base: e.target.value }))
                }
                className="input-base w-full"
              />
              {setup?.base_currency && (
                <p className="mt-1 text-xs text-slate-400">
                  How many {editEntry.currency.code} = 1 {setup.base_currency.code}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={editForm.is_active}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, is_active: e.target.checked }))
                }
                className="h-4 w-4 rounded"
              />
              Active (visible to customers)
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={editForm.is_default_display}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, is_default_display: e.target.checked }))
                }
                className="h-4 w-4 rounded"
              />
              Default display currency for customers
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditEntry(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={
                !editForm.rate_from_base ||
                Number(editForm.rate_from_base) <= 0 ||
                editMutation.isPending
              }
              onClick={() => editMutation.mutate()}
              className="btn-primary"
            >
              {editMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <Modal
          title="Remove Currency"
          onClose={() => setDeleteConfirm(null)}
        >
          <p className="text-sm text-slate-700">
            Remove{" "}
            <strong>
              {deleteConfirm.currency.name} ({deleteConfirm.currency.code})
            </strong>{" "}
            as a display currency? Customers will no longer be able to view prices in{" "}
            {deleteConfirm.currency.code}.
          </p>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteConfirm(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteConfirm.id)}
              className="btn-danger"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remove
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
