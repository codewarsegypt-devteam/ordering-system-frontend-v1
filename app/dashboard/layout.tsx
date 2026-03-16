"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts";
import {
  LayoutDashboard,
  UtensilsCrossed,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Store,
  MapPin,
  Users,
  Layers,
  ChevronDown,
  ChevronRight,
  Bell,
  UserCircle2,
} from "lucide-react";
import { QueryProvider } from "@/components/providers/QueryProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/table-services", label: "Table Services", icon: UserCircle2 },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  {
    href: "/dashboard/modifiers",
    label: "Modifier Groups",
    icon: Layers,
    roles: ["owner", "manager"],
  },
  {
    href: "/dashboard/merchant",
    label: "Merchant",
    icon: Store,
    roles: ["owner"],
  },
  {
    href: "/dashboard/branches",
    label: "Branches",
    icon: MapPin,
    roles: ["owner"],
  },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: ["owner"] },
] as const;

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "shadow-sm"
          : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
      }`}
      style={
        active
          ? {
              backgroundColor: "var(--system-green)",
              color: "white",
            }
          : undefined
      }
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
          active ? "bg-white/20" : "bg-system-green group-hover:bg-system-green-hover"
        }`}
      >
        <Icon className="h-4 w-4 text-white" />
      </span>
      <span className="min-w-0 truncate">{label}</span>
      {active && (
        <ChevronRight className="ml-auto h-4 w-4 shrink-0 opacity-80" />
      )}
    </Link>
  );
}

function Sidebar({
  user,
  path,
  onClose,
}: {
  user: { role: string; name: string; merchant_name?: string | null } | null;
  path: string | null;
  onClose?: () => void;
}) {
  const role = user?.role ?? "";
  const visibleNav = NAV_ITEMS.filter((item) => {
    if (!("roles" in item)) return true;
    return (item.roles as readonly string[]).includes(role);
  });

  return (
    <div
      className="flex h-full flex-col shadow-lg"
      style={{
        backgroundColor: "var(--system-cream)",
        borderRight: "1px solid var(--system-sage)",
      }}
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: "var(--system-sage)" }}>
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-md"
            style={{ backgroundColor: "var(--system-green)" }}
          >
            T
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">
              Tably
            </p>
            <p className="truncate text-xs font-medium text-slate-500">
              Dashboard
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/80 hover:text-slate-700 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleNav.map((item) => {
          const active =
            "exact" in item && item.exact
              ? path === item.href
              : !!path?.startsWith(item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={active}
            />
          );
        })}
      </nav>

      {/* User block */}
      <div
        className="shrink-0 border-t p-3"
        style={{ borderColor: "var(--system-sage)" }}
      >
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/60 shadow-sm" style={{ border: "1px solid var(--system-sage)" }}>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{
              backgroundColor: "var(--system-green-soft)",
              color: "var(--system-green)",
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name}
            </p>
            <p className="truncate text-xs capitalize text-slate-500">
              {role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageBreadcrumb({ path }: { path: string | null }) {
  if (!path) return null;
  const parts = path.split("/").filter(Boolean);
  return (
    <nav className="breadcrumb hidden sm:flex" aria-label="Breadcrumb">
      {parts.map((part, i) => {
        const isLast = i === parts.length - 1;
        const href = "/" + parts.slice(0, i + 1).join("/");
        const label =
          part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
        return (
          <React.Fragment key={href}>
            {i > 0 && <span className="breadcrumb-sep">/</span>}
            {isLast ? (
              <span className="font-medium text-slate-700">{label}</span>
            ) : (
              <Link
                href={href}
                className="transition-colors hover:opacity-80"
                style={{ color: "var(--system-green)" }}
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

function DashboardNav({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [path]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--system-green)", borderTopColor: "transparent" }} />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !path?.endsWith("/login")) {
    router.replace("/dashboard/login");
    return null;
  }

  if (path?.endsWith("/login")) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar — fixed on desktop so it stays while page scrolls */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 ease-out
        md:sticky md:top-0 md:z-auto md:h-screen md:w-60 md:translate-x-0 md:shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <Sidebar
          user={user}
          path={path}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <PageBreadcrumb path={path} />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Notification bell (cosmetic) */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
            </button>

            {/* User pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                aria-expanded={userMenuOpen}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white" style={{ backgroundColor: "var(--system-green)" }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-tight text-slate-800">
                    {user?.name}
                  </p>
                  <p className="text-[11px] capitalize leading-tight" style={{ color: "var(--system-green)" }}>
                    {user?.role}
                  </p>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(false)}
                    className="fixed inset-0 z-10"
                    aria-label="Close"
                  />
                  <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {user?.name}
                      </p>
                      <p className="text-xs capitalize" style={{ color: "var(--system-green)" }}>
                        {user?.role}
                      </p>
                      {user?.merchant_name && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {user.merchant_name}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <DashboardNav>{children}</DashboardNav>
      </AuthProvider>
    </QueryProvider>
  );
}
