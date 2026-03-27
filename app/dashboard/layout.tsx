"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts";
import {
  LiveOrdersProvider,
  useLiveOrders,
} from "@/contexts/LiveOrdersContext";
import { LiveOrdersPoller } from "@/components/dashboard/LiveOrdersPoller";
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
  CheckCircle2,
  Loader2,
  Play,
  Square,
  UserCircle2,
  Coins,
  Table2,
  Settings,
} from "lucide-react";
import { QueryProvider } from "@/components/providers/QueryProvider";

const NAV_MAIN = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
] as const;

const NAV_PAGES = [
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/table-sessions", label: "Table Sessions", icon: Table2 },
  {
    href: "/dashboard/table-services",
    label: "Table Services",
    icon: UserCircle2,
  },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  {
    href: "/dashboard/modifiers",
    label: "Modifier Groups",
    icon: Layers,
    roles: ["owner", "manager"],
  },
] as const;

const NAV_SETTINGS = [
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
  {
    href: "/dashboard/currencies",
    label: "Currencies",
    icon: Coins,
    roles: ["owner"],
  },
] as const;

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  indent = false,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 ${
        indent ? "ml-2" : ""
      } ${
        active
          ? "text-white shadow-sm"
          : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
      }`}
      style={active ? { backgroundColor: "var(--system-primary)" } : undefined}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
          active
            ? "bg-white/20"
            : "bg-white text-slate-500 shadow-sm group-hover:text-slate-700"
        }`}
        style={active ? undefined : { border: "1px solid var(--system-sage)" }}
      >
        <Icon className={`h-3.5 w-3.5 ${active ? "text-white" : ""}`} />
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  );
}

function SettingsDropdown({
  path,
  role,
}: {
  path: string | null;
  role: string;
}) {
  const visibleSettings = NAV_SETTINGS.filter((item) =>
    (item.roles as readonly string[]).includes(role),
  );
  const hasActive = visibleSettings.some((item) => path?.startsWith(item.href));
  const [open, setOpen] = React.useState(hasActive);

  React.useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  if (visibleSettings.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 ${
          hasActive
            ? "text-white shadow-sm"
            : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
        }`}
        style={
          hasActive ? { backgroundColor: "var(--system-primary)" } : undefined
        }
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
            hasActive
              ? "bg-white/20"
              : "bg-white text-slate-500 shadow-sm group-hover:text-slate-700"
          }`}
          style={
            hasActive ? undefined : { border: "1px solid var(--system-sage)" }
          }
        >
          <Settings
            className={`h-3.5 w-3.5 ${hasActive ? "text-white" : ""}`}
          />
        </span>
        <span className="min-w-0 flex-1 truncate text-left">Settings</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } ${hasActive ? "text-white/80" : "text-slate-400"}`}
        />
      </button>

      {open && (
        <div
          className="mx-2 mt-1 space-y-0.5 rounded-lg py-1.5"
          style={{
            borderLeft: "2px solid var(--system-sage)",
            paddingLeft: "0.5rem",
            marginLeft: "1rem",
          }}
        >
          {visibleSettings.map((item) => {
            const active = !!path?.startsWith(item.href);
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
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 mt-4 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 first:mt-0">
      {children}
    </p>
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

  const visiblePages = NAV_PAGES.filter((item) => {
    if (!("roles" in item)) return true;
    return (item.roles as readonly string[]).includes(role);
  });

  return (
    <div
      className="flex h-full flex-col"
      style={{
        backgroundColor: "var(--system-cream)",
        borderRight: "1px solid var(--system-sage)",
        boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Logo header */}
      <div
        className="flex h-16 shrink-0 items-center justify-between px-4"
        style={{ borderBottom: "1px solid var(--system-sage)" }}
      >
        <img
          src="/logos/4.svg"
          alt="Qrixa"
          className="h-10 w-auto shrink-0 object-contain"
        />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-600 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-none">
        {/* Main */}
        <SectionLabel>Main</SectionLabel>
        <div className="space-y-0.5">
          {NAV_MAIN.map((item) => {
            const active = path === item.href;
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
        </div>

        {/* Pages */}
        <SectionLabel>Pages</SectionLabel>
        <div className="space-y-0.5">
          {visiblePages.map((item) => {
            const active = !!path?.startsWith(item.href);
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
        </div>

        {/* Settings */}
        {role === "owner" && (
          <>
            <SectionLabel>Config</SectionLabel>
            <div className="space-y-0.5">
              <SettingsDropdown path={path} role={role} />
            </div>
          </>
        )}
      </nav>

      {/* User block */}
      <div
        className="shrink-0 p-3"
        style={{ borderTop: "1px solid var(--system-sage)" }}
      >
        <div
          className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 shadow-sm"
          style={{ border: "1px solid var(--system-sage)" }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
            style={{
              backgroundColor: "var(--system-primary-soft)",
              color: "var(--system-primary)",
              border: "1px solid var(--system-sage)",
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name}
            </p>
            <p className="truncate text-xs capitalize text-slate-400">{role}</p>
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
                style={{ color: "var(--system-primary)" }}
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
  const liveOrders = useLiveOrders();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [path]);

  if (isLoading) {
    return (
      <div className="dashboard-main flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-t-transparent"
            style={{
              borderColor: "var(--system-primary)",
              borderTopColor: "transparent",
            }}
          />
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
    <div className="dashboard-main flex min-h-screen">
      <LiveOrdersPoller />
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
            {/* Live orders */}
            {liveOrders.autoPaused && (
              <span className="hidden text-sm text-amber-600 sm:inline">
                Live paused (3 min). Start live to resume.
              </span>
            )}
            {liveOrders.isPolling && (
              <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              </div>
            )}
            <button
              type="button"
              onClick={() => liveOrders.setLivePollingEnabled((v) => !v)}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
              style={
                liveOrders.livePollingEnabled
                  ? {
                      borderColor: "var(--system-sage)",
                      backgroundColor: "white",
                      color: "var(--system-primary)",
                    }
                  : {
                      backgroundColor: "var(--system-primary)",
                      color: "white",
                      borderColor: "var(--system-primary)",
                    }
              }
            >
              {liveOrders.livePollingEnabled ? (
                <>
                  <Square className="h-4 w-4" />
                  <span className="hidden sm:inline">Stop live</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">Start live updates</span>
                </>
              )}
            </button>
            {/* <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
            </button> */}

            {/* User pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                aria-expanded={userMenuOpen}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--system-primary)" }}
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-tight text-slate-800">
                    {user?.name}
                  </p>
                  <p
                    className="text-[11px] capitalize leading-tight"
                    style={{ color: "var(--system-primary)" }}
                  >
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
                      <p
                        className="text-xs capitalize"
                        style={{ color: "var(--system-primary)" }}
                      >
                        {user?.role}
                      </p>
                      {user?.merchant_name && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {user.merchant_name}
                        </p>
                      )}
                    </div>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <UserCircle2 className="h-4 w-4" />
                      Profile
                    </Link>
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

        {/* Global new order toast */}
        {liveOrders.newOrderToast && (
          <div
            className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 shadow-lg"
            style={{ borderColor: "var(--system-sage)" }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: "var(--system-primary)" }}
            >
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-semibold text-teal-800">New order</p>
              <p className="text-sm font-mono text-teal-600">
                #{liveOrders.newOrderToast.order_number}
              </p>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-50/95 p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
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
        <LiveOrdersProvider>
          <DashboardNav>{children}</DashboardNav>
        </LiveOrdersProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
