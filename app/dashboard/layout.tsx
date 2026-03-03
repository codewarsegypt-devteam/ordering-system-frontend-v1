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
} from "lucide-react";
import { QueryProvider } from "@/components/providers/QueryProvider";

function DashboardNav({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [path]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated && !path?.endsWith("/login")) {
    router.replace("/dashboard/login");
    return null;
  }

  if (path?.endsWith("/login")) {
    return <>{children}</>;
  }

  const isOwner = user?.role === "owner";
  const canEditMenu = user?.role === "owner" || user?.role === "manager";
  const nav = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
    { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
    ...(canEditMenu
      ? [{ href: "/dashboard/menu/modifiers", label: "Modifier groups", icon: Layers }]
      : []),
    ...(isOwner
      ? [
          { href: "/dashboard/merchant", label: "Merchant", icon: Store },
          { href: "/dashboard/branches", label: "Branches", icon: MapPin },
          { href: "/dashboard/users", label: "Users", icon: Users },
        ]
      : []),
  ];

  const navContent = (
    <>
      <div className="flex h-14 items-center justify-between gap-3 border-b border-slate-700 px-4 md:h-16 md:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/25">
            <Menu className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Dashboard</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/dashboard" ? path === href : path?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-teal-500/15 text-teal-400"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-700 p-3">
        <div className="mb-2 px-4 py-2 text-xs text-slate-400">
          {user?.name}
          <span className="ml-1.5 rounded-md bg-slate-700 px-1.5 py-0.5 font-medium capitalize text-slate-300">
            {user?.role}
          </span>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-red-500/15 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="Close menu"
        />
      )}
      {/* Sidebar: drawer on mobile, fixed on md+ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col bg-slate-800 shadow-xl transition-transform duration-200 ease-out
          md:relative md:z-auto md:w-60 md:max-w-none md:translate-x-0 md:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {navContent}
      </aside>
      {/* Main: top bar on mobile + content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-zinc-800">Dashboard</span>
        </header>
        <main className="min-h-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
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
