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

interface StatCardProps {
  title: string;
  value: string;
  hint: string;
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

function StatCard({ title, value, hint }: StatCardProps) {
  return (
    <div className="stat-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
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
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-teal-100 bg-linear-to-r  bg-system-primary  p-5 text-white shadow-sm shadow-teal-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-system-sage">
                Dashboard overview
              </p>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, {user?.name}
              </h1>
                <p className="mt-1 text-sm text-system-sage">
                Monitor orders, sales, tables, and branch activity from one
                place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-system-cream px-3 py-1.5 text-system-primary backdrop-blur">
                {user?.merchant_name ?? "Merchant"}
              </span>
              {user?.branch_name && (
                <span className="rounded-full bg-system-cream px-3 py-1.5 text-system-primary backdrop-blur">
                  {user.branch_name}
                </span>
              )}
              <span className="rounded-full bg-system-cream px-3 py-1.5 capitalize text-system-primary backdrop-blur">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 shadow-sm transition-colors hover:bg-teal-50"
            >
              <ClipboardList className="h-4 w-4" />
              Live orders
            </Link>
            <Link
              href={isOwner ? "/dashboard/branches" : "/dashboard/menu"}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              {isOwner ? (
                <MapPin className="h-4 w-4" />
              ) : (
                <UtensilsCrossed className="h-4 w-4" />
              )}
              {isOwner ? "Manage branches" : "Manage menu"}
            </Link>
            <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-xl font-bold backdrop-blur lg:flex">
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
          <div className="form-card">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-slate-500" />
                  <h2 className="section-title text-sm">Analytics filters</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Narrow the overview to a branch, date range, or leaderboard
                  size.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["today", "Today"],
                    ["last7", "Last 7 days"],
                    ["last30", "Last 30 days"],
                    ["thisMonth", "This month"],
                  ] as const
                ).map(([preset, label]) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyDatePreset(preset)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                  >
                    <CalendarRange className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="label">Branch</label>
                <select
                  className="input-base"
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
              <div>
                <label className="label">From</label>
                <input
                  type="date"
                  className="input-base"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters((current) => ({
                      ...current,
                      from: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="label">To</label>
                <input
                  type="date"
                  className="input-base"
                  value={filters.to}
                  onChange={(e) =>
                    setFilters((current) => ({
                      ...current,
                      to: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="label">Top rows</label>
                <select
                  className="input-base"
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
                      Top {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {statsFilters.branch_id && (
                  <span className="rounded-full bg-teal-50 px-3 py-1 font-medium text-teal-700">
                    Branch filtered
                  </span>
                )}
                {statsFilters.from && statsFilters.to && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                    {statsFilters.from} to {statsFilters.to}
                  </span>
                )}
                {filters.top_limit !== "5" && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                    Top {filters.top_limit}
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
              <div className="flex flex-col gap-1">
                <h2 className="section-title">Performance snapshot</h2>
                <p className="text-sm text-slate-500">
                  Key metrics for the selected branch and timeframe.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Sales"
                  value={formatPrice(salesQuery.data?.summary.total_sales)}
                  hint={`${formatCount(salesQuery.data?.summary.completed_orders_count)} completed orders`}
                />
                <StatCard
                  title="Orders"
                  value={formatCount(salesQuery.data?.summary.orders_count)}
                  hint={`${salesQuery.data?.summary.completed_rate ?? 0}% completion rate`}
                />
                <StatCard
                  title="Average Order"
                  value={formatPrice(
                    salesQuery.data?.summary.average_order_value,
                  )}
                  hint={`${salesQuery.data?.summary.cancelled_rate ?? 0}% cancellation rate`}
                />
                <StatCard
                  title="Active Tables"
                  value={formatCount(
                    operationsQuery.data?.summary.active_tables_count,
                  )}
                  hint={`${formatCount(operationsQuery.data?.summary.tables_count)} total tables`}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <div className="card p-5 xl:col-span-2">
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-system-primary" />
                    <h2 className="section-title">Daily sales</h2>
                  </div>
                  <div className="space-y-3">
                    {dailySales.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No sales data for the selected period.
                      </p>
                    ) : (
                      dailySales.map((item) => (
                        <div key={item.date} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">
                              {item.date}
                            </span>
                            <span className="text-slate-500">
                              {formatPrice(item.total_sales)}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-system-primary"
                              style={{
                                width: `${Math.max((item.total_sales / maxDailySales) * 100, item.total_sales > 0 ? 6 : 0)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-slate-400">
                            {item.orders_count} orders
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="card p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-system-primary" />
                    <h2 className="section-title">Highlights</h2>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-slate-400">Best branch by sales</p>
                      <p className="font-semibold text-slate-800">
                        {branchesQuery.data?.summary.best_branch_by_sales
                          ?.branch_name ?? "—"}
                      </p>
                      <p className="text-slate-500">
                        {formatPrice(
                          branchesQuery.data?.summary.best_branch_by_sales
                            ?.total_sales,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Most used table</p>
                      <p className="font-semibold text-slate-800">
                        {tablesQuery.data?.summary.most_used_table?.table_number
                          ? `Table ${tablesQuery.data.summary.most_used_table.table_number}`
                          : "—"}
                      </p>
                      <p className="text-slate-500">
                        {tablesQuery.data?.summary.most_used_table
                          ?.branch_name ?? "No branch"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Top selling item</p>
                      <p className="font-semibold text-slate-800">
                        {menuQuery.data?.top_selling_items?.[0]?.item_name_en ??
                          menuQuery.data?.top_selling_items?.[0]
                            ?.item_name_ar ??
                          "—"}
                      </p>
                      <p className="text-slate-500">
                        {formatCount(
                          menuQuery.data?.top_selling_items?.[0]?.quantity_sold,
                        )}{" "}
                        sold
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="card p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-system-primary" />
                    <h2 className="section-title">Branch performance</h2>
                  </div>
                  <div className="space-y-3">
                    {topBranches.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No branch stats available.
                      </p>
                    ) : (
                      topBranches.map((branch) => (
                        <div
                          key={String(branch.branch_id)}
                          className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-slate-800">
                              {branch.branch_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {branch.orders_count} orders
                            </p>
                          </div>
                          <p className="font-semibold text-slate-800">
                            {formatPrice(branch.total_sales)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="card p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Table2 className="h-4 w-4 text-system-primary" />
                    <h2 className="section-title">Table activity</h2>
                  </div>
                  <div className="space-y-3">
                    {topTables.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No table stats available.
                      </p>
                    ) : (
                      topTables.map((table) => (
                        <div
                          key={String(table.table_id)}
                          className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-slate-800">
                              Table {table.table_number ?? "—"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {table.branch_name ?? "No branch"} ·{" "}
                              {table.orders_count} orders
                            </p>
                          </div>
                          <p className="font-semibold text-slate-800">
                            {formatPrice(table.total_sales)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="card p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-system-primary" />
                    <h2 className="section-title">Top menu items</h2>
                  </div>
                  <div className="space-y-3">
                    {topItems.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No item sales available.
                      </p>
                    ) : (
                      topItems.map((item) => (
                        <div
                          key={String(item.item_id)}
                          className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-slate-800">
                              {item.item_name_en ??
                                item.item_name_ar ??
                                "Unnamed item"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.category_name_en ??
                                item.category_name_ar ??
                                "No category"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-800">
                              {formatCount(item.quantity_sold)} sold
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatPrice(item.revenue)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="card p-5">
                  <div className="mb-4 flex items-center gap-2">
                      <Store className="h-4 w-4 text-system-primary" />
                    <h2 className="section-title">Operations snapshot</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-100 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Branches
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {formatCount(
                          operationsQuery.data?.summary.branches_count,
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Seats
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {formatCount(operationsQuery.data?.summary.total_seats)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Linked orders
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {formatCount(
                          tablesQuery.data?.summary.linked_orders_count,
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Sold items
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {formatCount(menuQuery.data?.summary.sold_items_count)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {operationsBranches.map((branch) => (
                      <div
                        key={String(branch.branch_id)}
                        className="flex items-center justify-between border-t border-slate-100 pt-3 first:border-t-0 first:pt-0"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {branch.branch_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {branch.active_tables_count}/{branch.tables_count}{" "}
                            active tables
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          {branch.average_orders_per_table} avg/table
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
