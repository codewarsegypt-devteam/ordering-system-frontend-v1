"use client";

import { useAuth } from "@/contexts";
import { LayoutDashboard, ClipboardList, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="page-title mb-2 text-xl sm:text-2xl lg:text-3xl">
        Welcome, {user?.name}
      </h1>
      <p className="mb-6 text-sm text-zinc-600 sm:mb-8">
        Role: <span className="font-semibold capitalize text-zinc-800">{user?.role}</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        <Link
          href="/dashboard/orders"
          className="card flex items-center gap-4 p-4 sm:gap-5 sm:p-6"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
            <ClipboardList className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h2 className="section-title">Orders</h2>
            <p className="text-sm text-zinc-500">View and manage orders</p>
          </div>
        </Link>
        <Link
          href="/dashboard/menu"
          className="card flex items-center gap-4 p-4 sm:gap-5 sm:p-6"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h2 className="section-title">Menu</h2>
            <p className="text-sm text-zinc-500">Categories and items</p>
          </div>
        </Link>
        <div className="card flex items-center gap-4 border-teal-200 bg-teal-50/50 p-4 sm:gap-5 sm:p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-200 text-teal-700">
            <LayoutDashboard className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h2 className="section-title">Overview</h2>
            <p className="text-sm text-zinc-500">You are here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
