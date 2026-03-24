"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts";
import { useMerchantBaseCurrency } from "@/lib/hooks/useMerchantBaseCurrency";
import {
  fetchBranches,
  fetchBranchesStats,
  fetchMenuStats,
  fetchOperationsStats,
  fetchSalesStats,
  fetchTablesStats,
  getApiError,
} from "@/lib/api";
import { SalesTrendChart } from "@/components/dashboard/SalesTrendChart";
import {
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  ClipboardList,
  Layers,
  Loader2,
  MapPin,
  RotateCcw,
  Settings2,
  Store,
  Table2,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";

interface QuickLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  iconBg: string;
}

type MetricAccent = "revenue" | "orders" | "average" | "floor";

/** FoodDesk-style: white cards, colored icon tiles, strong numerals */
const METRIC_ACCENTS: Record<
  MetricAccent,
  { card: string; icon: string; value: string }
> = {
  revenue: {
    card: "border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]",
    icon: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100/90",
    value: "text-emerald-950",
  },
  orders: {
    card: "border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]",
    icon: "bg-sky-50 text-sky-600 ring-1 ring-sky-100/90",
    value: "text-sky-950",
  },
  average: {
    card: "border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]",
    icon: "bg-amber-50 text-amber-600 ring-1 ring-amber-100/90",
    value: "text-amber-950",
  },
  floor: {
    card: "border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]",
    icon: "bg-violet-50 text-violet-600 ring-1 ring-violet-100/90",
    value: "text-violet-950",
  },
};

type MiniTone = "emerald" | "sky" | "amber" | "violet";

const MINI_TONES: Record<MiniTone, { wrap: string; value: string }> = {
  emerald: {
    wrap: "border-slate-200/70 bg-white shadow-sm",
    value: "text-emerald-800",
  },
  sky: {
    wrap: "border-slate-200/70 bg-white shadow-sm",
    value: "text-sky-800",
  },
  amber: {
    wrap: "border-slate-200/70 bg-white shadow-sm",
    value: "text-amber-800",
  },
  violet: {
    wrap: "border-slate-200/70 bg-white shadow-sm",
    value: "text-violet-800",
  },
};

interface MetricTileProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ElementType;
  accent?: MetricAccent;
}

type DatePreset = "today" | "last7" | "last30" | "thisMonth";


function formatCount(value: number | undefined) {
  return new Intl.NumberFormat().format(Number(value ?? 0));
}

function formatDateInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPresetRange(preset: DatePreset) {
  const today = new Date();
  const from = new Date(today);
  const to = new Date(today);

  switch (preset) {
    case "today":
      break;
    case "last7":
      from.setDate(today.getDate() - 6);
      break;
    case "last30":
      from.setDate(today.getDate() - 29);
      break;
    case "thisMonth":
      from.setDate(1);
      break;
  }

  return {
    from: formatDateInput(from),
    to: formatDateInput(to),
  };
}

function QuickLink({
  href,
  icon: Icon,
  label,
  description,
  color,
  iconBg,
}: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="card group flex items-center gap-4 p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-800 transition-colors group-hover:text-teal-700">
          {label}
        </p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-500" />
    </Link>
  );
}

function MetricTile({
  label,
  value,
  sublabel,
  icon: Icon,
  accent,
}: MetricTileProps) {
  const a = accent ? METRIC_ACCENTS[accent] : null;
  return (
    <div
      className={`flex gap-4 rounded-2xl border p-5 sm:p-6 ${
        a ? a.card : "border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
          a ? a.icon : "bg-[var(--system-cream)] text-[var(--system-primary)] ring-1 ring-[var(--system-sage)]/40"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p
          className={`mt-1.5 truncate text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl ${
            a ? a.value : "text-zinc-900"
          }`}
        >
          {value}
        </p>
        {sublabel ? (
          <p className="mt-1 text-sm leading-snug text-zinc-500">{sublabel}</p>
        ) : null}
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  tone = "emerald",
}: {
  label: string;
  value: string;
  tone?: MiniTone;
}) {
  const t = MINI_TONES[tone];
  return (
    <div className={`rounded-xl border px-4 py-3 ${t.wrap}`}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-0.5 text-lg font-semibold tabular-nums ${t.value}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { formatPrice } = useMerchantBaseCurrency();
  const isOwner = user?.role === "owner";
  const canViewStats = user?.role === "owner" || user?.role === "manager";

  const [filters, setFilters] = useState({
    branch_id: "",
    from: "",
    to: "",
    top_limit: "5",
  });
  const [leaderboardTab, setLeaderboardTab] = useState<
    "branches" | "tables" | "menu"
  >("branches");

  const statsFilters = {
    branch_id:
      filters.branch_id ||
      (user?.role === "manager" && user?.branch_id != null
        ? String(user.branch_id)
        : undefined),
    from: filters.from || undefined,
    to: filters.to || undefined,
    top_limit: Number(filters.top_limit || 5),
  };

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    enabled: !!user?.merchant_id && isOwner,
  });

  const salesQuery = useQuery({
    queryKey: ["stats", "sales", statsFilters],
    queryFn: () => fetchSalesStats(statsFilters),
    enabled: !!user?.merchant_id && canViewStats,
  });

  const branchesQuery = useQuery({
    queryKey: ["stats", "branches", statsFilters],
    queryFn: () => fetchBranchesStats(statsFilters),
    enabled: !!user?.merchant_id && canViewStats,
  });

  const tablesQuery = useQuery({
    queryKey: ["stats", "tables", statsFilters],
    queryFn: () => fetchTablesStats(statsFilters),
    enabled: !!user?.merchant_id && canViewStats,
  });

  const menuQuery = useQuery({
    queryKey: ["stats", "menu", statsFilters],
    queryFn: () => fetchMenuStats(statsFilters),
    enabled: !!user?.merchant_id && canViewStats,
  });

  const operationsQuery = useQuery({
    queryKey: ["stats", "operations", statsFilters],
    queryFn: () => fetchOperationsStats(statsFilters),
    enabled: !!user?.merchant_id && canViewStats,
  });

  const queries = [
    salesQuery,
    branchesQuery,
    tablesQuery,
    menuQuery,
    operationsQuery,
  ];
  const isLoadingStats =
    canViewStats && queries.some((query) => query.isLoading);
  const statsError = queries.find((query) => query.error)?.error;

  const dailySales = salesQuery.data?.sales_by_day?.slice(-7) ?? [];
  const topBranches = branchesQuery.data?.branches?.slice(0, 5) ?? [];
  const topTables = tablesQuery.data?.tables?.slice(0, 5) ?? [];
  const topItems = menuQuery.data?.top_selling_items?.slice(0, 5) ?? [];
  const operationsBranches = operationsQuery.data?.branches?.slice(0, 5) ?? [];

  const maxDailySales = Math.max(
    ...dailySales.map((item) => item.total_sales),
    1,
  );
  const hasActiveFilters =
    Boolean(filters.branch_id) ||
    Boolean(filters.from) ||
    Boolean(filters.to) ||
    filters.top_limit !== "5";

  const applyDatePreset = (preset: DatePreset) => {
    const range = getPresetRange(preset);
    setFilters((current) => ({
      ...current,
      from: range.from,
      to: range.to,
    }));
  };

  const resetFilters = () => {
    setFilters({
      branch_id: "",
      from: "",
      to: "",
      top_limit: "5",
    });
  };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Restaurant · Overview
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, {user?.name}
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">
                Track orders, revenue, and floor activity in one place — same
                calm layout as modern food admin panels.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                {user?.merchant_name ?? "Merchant"}
              </span>
              {user?.branch_name && (
                <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-900">
                  {user.branch_name}
                </span>
              )}
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium capitalize text-slate-600">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:items-center lg:flex-col xl:flex-row">
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <ClipboardList className="h-4 w-4" />
              Live orders
            </Link>
            <Link
              href={isOwner ? "/dashboard/branches" : "/dashboard/menu"}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              {isOwner ? (
                <MapPin className="h-4 w-4 text-emerald-600" />
              ) : (
                <UtensilsCrossed className="h-4 w-4 text-emerald-600" />
              )}
              {isOwner ? "Manage branches" : "Manage menu"}
            </Link>
            <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-lg font-bold text-slate-700 lg:flex">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* <div>
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title">Quick access</h2>
            <p className="text-sm text-slate-500">
              Jump straight into the areas staff use most.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            href="/dashboard/orders"
            icon={ClipboardList}
            label="Orders"
            description="View and manage live orders"
            color="text-sky-600"
            iconBg="bg-sky-100"
          />
          <QuickLink
            href="/dashboard/menu"
            icon={UtensilsCrossed}
            label="Menu"
            description="Categories, items and prices"
            color="text-amber-600"
            iconBg="bg-amber-100"
          />
          {canViewStats && (
            <QuickLink
              href="/dashboard/modifiers"
              icon={Layers}
              label="Modifiers"
              description="Modifier groups and options"
              color="text-violet-600"
              iconBg="bg-violet-100"
            />
          )}
          {isOwner && (
            <>
              <QuickLink
                href="/dashboard/merchant"
                icon={Store}
                label="Merchant"
                description="Name, logo and branding"
                color="text-teal-600"
                iconBg="bg-teal-100"
              />
              <QuickLink
                href="/dashboard/branches"
                icon={MapPin}
                label="Branches"
                description="Locations and tables"
                color="text-rose-600"
                iconBg="bg-rose-100"
              />
              <QuickLink
                href="/dashboard/users"
                icon={Users}
                label="Users"
                description="Staff accounts and roles"
                color="text-indigo-600"
                iconBg="bg-indigo-100"
              />
            </>
          )}
        </div>
      </div> */}

      {!canViewStats ? (
        <div className="card px-5 py-4">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <TrendingUp className="h-4 w-4 shrink-0 text-teal-500" />
            <span>
              Analytics are available for owners and managers. You can still
              manage live orders and daily operations from the sections above.
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-2">
                <Settings2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                <div>
                  <h2 className="text-sm font-semibold text-zinc-800">
                    Report period
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Presets update dates; refine with branch and custom range.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["today", "Today"],
                    ["last7", "7 days"],
                    ["last30", "30 days"],
                    ["thisMonth", "Month"],
                  ] as const
                ).map(([preset, label]) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyDatePreset(preset)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/80 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-[var(--system-primary)]/30 hover:bg-[var(--system-cream)] hover:text-zinc-900"
                  >
                    <CalendarRange className="h-3 w-3 opacity-70" />
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-3">
              <div className="lg:col-span-3">
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  Branch
                </label>
                <select
                  className="input-base py-2 text-sm"
                  value={
                    isOwner ? filters.branch_id : String(user?.branch_id ?? "")
                  }
                  onChange={(e) =>
                    setFilters((current) => ({
                      ...current,
                      branch_id: e.target.value,
                    }))
                  }
                  disabled={!isOwner}
                >
                  <option value="">
                    {isOwner ? "All branches" : "Your branch"}
                  </option>
                  {branches?.map((branch) => (
                    <option key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-3">
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  From
                </label>
                <input
                  type="date"
                  className="input-base py-2 text-sm"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters((current) => ({
                      ...current,
                      from: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="lg:col-span-3">
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  To
                </label>
                <input
                  type="date"
                  className="input-base py-2 text-sm"
                  value={filters.to}
                  onChange={(e) =>
                    setFilters((current) => ({
                      ...current,
                      to: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="lg:col-span-3">
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  List size
                </label>
                <select
                  className="input-base py-2 text-sm"
                  value={filters.top_limit}
                  onChange={(e) =>
                    setFilters((current) => ({
                      ...current,
                      top_limit: e.target.value,
                    }))
                  }
                >
                  {[5, 10, 15, 20].map((value) => (
                    <option key={value} value={String(value)}>
                      Top {value} rows
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-zinc-100 pt-3 text-[11px]">
                {statsFilters.branch_id && (
                  <span className="rounded-md bg-[var(--system-cream)] px-2 py-0.5 font-medium text-[var(--system-primary)]">
                    Branch filter
                  </span>
                )}
                {statsFilters.from && statsFilters.to && (
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600">
                    {statsFilters.from} → {statsFilters.to}
                  </span>
                )}
                {filters.top_limit !== "5" && (
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600">
                    {filters.top_limit} rows
                  </span>
                )}
              </div>
            )}
          </div>

          {isLoadingStats ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <p className="text-sm text-slate-500">Loading analytics…</p>
            </div>
          ) : statsError ? (
            <div className="alert-error">{getApiError(statsError)}</div>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  At a glance
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Revenue and operations for the period above.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricTile
                  label="Total sales"
                  icon={TrendingUp}
                  accent="revenue"
                  value={formatPrice(salesQuery.data?.summary.total_sales)}
                  sublabel={`${formatCount(salesQuery.data?.summary.completed_orders_count)} completed · ${salesQuery.data?.summary.completed_rate ?? 0}% of orders`}
                />
                <MetricTile
                  label="Orders"
                  icon={ClipboardList}
                  accent="orders"
                  value={formatCount(salesQuery.data?.summary.orders_count)}
                  sublabel={`${salesQuery.data?.summary.completed_rate ?? 0}% completed`}
                />
                <MetricTile
                  label="Avg order value"
                  icon={BarChart3}
                  accent="average"
                  value={formatPrice(salesQuery.data?.summary.average_order_value)}
                  sublabel={`${salesQuery.data?.summary.cancelled_rate ?? 0}% cancelled`}
                />
                <MetricTile
                  label="Floor in use"
                  icon={Table2}
                  accent="floor"
                  value={formatCount(
                    operationsQuery.data?.summary.active_tables_count,
                  )}
                  sublabel={`${formatCount(operationsQuery.data?.summary.tables_count)} tables · ${formatCount(operationsQuery.data?.summary.branches_count)} branches`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:gap-3">
                <MiniMetric
                  label="Seats"
                  tone="emerald"
                  value={formatCount(
                    operationsQuery.data?.summary.total_seats,
                  )}
                />
                <MiniMetric
                  label="Linked orders"
                  tone="sky"
                  value={formatCount(
                    tablesQuery.data?.summary.linked_orders_count,
                  )}
                />
                <MiniMetric
                  label="Units sold"
                  tone="amber"
                  value={formatCount(menuQuery.data?.summary.sold_items_count)}
                />
                <MiniMetric
                  label="Branches"
                  tone="violet"
                  value={formatCount(
                    operationsQuery.data?.summary.branches_count,
                  )}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:p-6 lg:col-span-3">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100/80">
                        <BarChart3 className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Sales trend
                        </h3>
                        <p className="text-xs text-slate-500">
                          Daily total in selected range (up to 7 days)
                        </p>
                      </div>
                    </div>
                  </div>
                  {dailySales.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-500">
                      No sales for this period.
                    </p>
                  ) : (
                    <>
                      <div className="-mx-1 mb-5 rounded-xl bg-linear-to-b from-slate-50/80 to-transparent px-1 py-2">
                        <SalesTrendChart series={dailySales} />
                        <div className="mt-2 flex justify-between gap-1 text-[10px] font-medium text-slate-400">
                          {dailySales.map((item) => (
                            <span
                              key={item.date ?? ""}
                              className="min-w-0 flex-1 truncate text-center tabular-nums"
                              title={item.date}
                            >
                              {(item.date ?? "").slice(5)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3 border-t border-slate-100 pt-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Breakdown
                        </p>
                        {dailySales.map((item) => (
                          <div key={item.date}>
                            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                              <span className="font-medium text-slate-700 tabular-nums">
                                {item.date}
                              </span>
                              <div className="text-right">
                                <span className="font-semibold tabular-nums text-emerald-800">
                                  {formatPrice(item.total_sales)}
                                </span>
                                <span className="ml-2 text-xs tabular-nums text-sky-600/90">
                                  {item.orders_count} orders
                                </span>
                              </div>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                                style={{
                                  width: `${Math.max((item.total_sales / maxDailySales) * 100, item.total_sales > 0 ? 4 : 0)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:p-6 lg:col-span-2">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100/80">
                      <TrendingUp className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Highlights
                    </h3>
                  </div>
                  <ul className="space-y-4 text-sm">
                    <li className="border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                        Top branch
                      </p>
                      <p className="mt-1 font-semibold text-zinc-900">
                        {branchesQuery.data?.summary.best_branch_by_sales
                          ?.branch_name ?? "—"}
                      </p>
                      <p className="mt-0.5 tabular-nums font-medium text-emerald-800">
                        {formatPrice(
                          branchesQuery.data?.summary.best_branch_by_sales
                            ?.total_sales,
                        )}
                      </p>
                    </li>
                    <li className="border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                        Busiest table
                      </p>
                      <p className="mt-1 font-semibold text-violet-900">
                        {tablesQuery.data?.summary.most_used_table
                          ?.table_number != null
                          ? `Table ${tablesQuery.data.summary.most_used_table.table_number}`
                          : "—"}
                      </p>
                      <p className="mt-0.5 text-zinc-600">
                        {tablesQuery.data?.summary.most_used_table
                          ?.branch_name ?? "—"}
                      </p>
                    </li>
                    <li>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                        Best seller
                      </p>
                      <p className="mt-1 font-semibold text-zinc-900">
                        {menuQuery.data?.top_selling_items?.[0]?.item_name_en ??
                          menuQuery.data?.top_selling_items?.[0]
                            ?.item_name_ar ??
                          "—"}
                      </p>
                      <p className="mt-0.5 tabular-nums font-medium text-amber-800">
                        {formatCount(
                          menuQuery.data?.top_selling_items?.[0]
                            ?.quantity_sold,
                        )}{" "}
                        units
                      </p>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/80">
                      <Layers className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Rankings
                      </h3>
                      <p className="text-xs text-slate-500">
                        Switch tab to focus on one leaderboard.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 rounded-xl bg-slate-200/60 p-1">
                    {(
                      [
                        ["branches", "Branches", MapPin] as const,
                        ["tables", "Tables", Table2] as const,
                        ["menu", "Menu", UtensilsCrossed] as const,
                      ]
                    ).map(([id, label, TabIcon]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setLeaderboardTab(id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          leaderboardTab === id
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-white/90 hover:text-slate-900"
                        }`}
                      >
                        <TabIcon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {leaderboardTab === "branches" && (
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-xl border border-zinc-100">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50/90">
                              <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                Branch
                              </th>
                              <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                Orders
                              </th>
                              <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                Sales
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {topBranches.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={3}
                                  className="px-4 py-8 text-center text-zinc-500"
                                >
                                  No branch data.
                                </td>
                              </tr>
                            ) : (
                              topBranches.map((branch) => (
                                <tr
                                  key={String(branch.branch_id)}
                                  className="hover:bg-zinc-50/50"
                                >
                                  <td className="px-4 py-3 font-medium text-zinc-900">
                                    {branch.branch_name}
                                  </td>
                                  <td className="px-4 py-3 text-right tabular-nums font-medium text-sky-800">
                                    {formatCount(branch.orders_count)}
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-800">
                                    {formatPrice(branch.total_sales)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      {operationsBranches.length > 0 && (
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <Store className="h-3.5 w-3.5 text-zinc-400" />
                            <p className="text-xs font-medium text-zinc-500">
                              Utilization & throughput
                            </p>
                          </div>
                          <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-100">
                            {operationsBranches.map((branch) => (
                              <div
                                key={String(branch.branch_id)}
                                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  <p className="font-medium text-zinc-900">
                                    {branch.branch_name}
                                  </p>
                                  <p className="text-xs tabular-nums text-zinc-500">
                                    <span className="font-medium text-violet-800">
                                      {formatCount(branch.active_tables_count)}
                                    </span>
                                    <span className="text-zinc-400"> / </span>
                                    <span className="tabular-nums text-zinc-600">
                                      {formatCount(branch.tables_count)}
                                    </span>{" "}
                                    tables active
                                  </p>
                                </div>
                                <p className="text-sm font-semibold tabular-nums text-sky-800">
                                  {branch.average_orders_per_table}{" "}
                                  <span className="font-normal text-zinc-400">
                                    orders / table
                                  </span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {leaderboardTab === "tables" && (
                    <div className="overflow-hidden rounded-xl border border-zinc-100">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-zinc-100 bg-zinc-50/90">
                            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                              Table
                            </th>
                            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                              Branch
                            </th>
                            <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                              Orders
                            </th>
                            <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                              Sales
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {topTables.length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-8 text-center text-zinc-500"
                              >
                                No table data.
                              </td>
                            </tr>
                          ) : (
                            topTables.map((table) => (
                              <tr
                                key={String(table.table_id)}
                                className="hover:bg-zinc-50/50"
                              >
                                <td className="px-4 py-3 font-medium tabular-nums text-zinc-900">
                                  {table.table_number ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-zinc-600">
                                  {table.branch_name ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums font-medium text-sky-800">
                                  {formatCount(table.orders_count)}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-800">
                                  {formatPrice(table.total_sales)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {leaderboardTab === "menu" && (
                    <div className="overflow-hidden rounded-xl border border-zinc-100">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-zinc-100 bg-zinc-50/90">
                            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                              Item
                            </th>
                            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                              Category
                            </th>
                            <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                              Units
                            </th>
                            <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                              Revenue
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {topItems.length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-8 text-center text-zinc-500"
                              >
                                No menu sales data.
                              </td>
                            </tr>
                          ) : (
                            topItems.map((item) => (
                              <tr
                                key={String(item.item_id)}
                                className="hover:bg-zinc-50/50"
                              >
                                <td className="px-4 py-3 font-medium text-zinc-900">
                                  {item.item_name_en ??
                                    item.item_name_ar ??
                                    "—"}
                                </td>
                                <td className="max-w-[min(160px,28vw)] truncate px-4 py-3 text-zinc-500">
                                  {item.category_name_en ??
                                    item.category_name_ar ??
                                    "—"}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums font-medium text-amber-800">
                                  {formatCount(item.quantity_sold)}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-800">
                                  {formatPrice(item.revenue)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
