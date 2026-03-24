import Link from "next/link";
import {
  ChevronRight,
  LayoutDashboard,
  Sparkles,
  QrCode,
  ChefHat,
  Store,
  ShieldCheck,
} from "lucide-react";
import { STATS } from "./data";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-white px-4 pb-20 pt-16 sm:pb-24 sm:pt-24">
      {/* Background */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(120,180,90,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(180,210,160,0.18),transparent_35%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--system-primary)", opacity: 0.08 }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        {/* Left content */}
        <div className="mx-auto max-w-2xl lg:mx-0">
          {/* Badge */}
          {/* <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm"
            style={{
              borderColor: "var(--system-sage)",
              backgroundColor: "var(--system-cream)",
            }}
          >
            <Sparkles
              className="h-4 w-4"
              style={{ color: "var(--system-primary)" }}
            />
            Smart QR ordering for restaurants &amp; cafés
          </div> */}

          {/* Heading */}
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            Turn every table into
            <span className="block" style={{ color: "var(--system-primary)" }}>
              a self-ordering experience
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 sm:text-xl">
            Guests scan, browse, and order in seconds. You manage menus,
            branches, staff, and orders from one clean dashboard—without apps,
            paper menus, or slow service.
          </p>

          {/* Feature bullets */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              // {
              //   icon: QrCode,
              //   label: "Scan to view menu instantly",
              // },
              // {
              //   icon: ChefHat,
              //   label: "Orders go straight to kitchen",
              // },
              {
                icon: Store,
                label: "Manage multiple branches",
              },
              {
                icon: ShieldCheck,
                label: "Simple, reliable, staff-friendly",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border bg-white/80 px-4 py-3 shadow-sm backdrop-blur"
                  style={{ borderColor: "rgba(0,0,0,0.06)" }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "var(--system-cream)" }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: "var(--system-primary)" }}
                    />
                  </div>
                  <span className="text-sm font-medium text-zinc-700">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:opacity-95"
              style={{ backgroundColor: "var(--system-primary)" }}
            >
              Create free account
              <ChevronRight className="h-5 w-5" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border bg-white px-7 py-4 text-base font-semibold text-zinc-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
              style={{ borderColor: "rgba(0,0,0,0.08)" }}
            >
              <LayoutDashboard className="h-5 w-5" />
              Open dashboard
            </Link>
          </div>

          {/* Mini social proof */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500">
            <span>No app download</span>
            <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block" />
            <span>Launch in minutes</span>
            <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block" />
            <span>Built for modern hospitality</span>
          </div>
        </div>

        {/* Right visual */}
        <div className="relative mx-auto w-full max-w-2xl">
          <div className="relative rounded-[32px] border border-zinc-200 bg-white p-4 shadow-2xl">
            {/* Top bar */}
            <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Qrixa Dashboard
                </p>
                <p className="text-xs text-zinc-500">
                  Live restaurant operations
                </p>
              </div>
              <div
                className="rounded-xl px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: "var(--system-primary)" }}
              >
                Live
              </div>
            </div>

            {/* Main preview grid */}
            <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              {/* Orders panel */}
              <div className="rounded-3xl border border-zinc-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      Incoming orders
                    </p>
                    <p className="text-xs text-zinc-500">
                      Updated in real time
                    </p>
                  </div>
                  <div
                    className="rounded-xl px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: "var(--system-cream)",
                      color: "var(--system-primary)",
                    }}
                  >
                    12 new
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    {
                      table: "Table 04",
                      items: "2 Burgers • 1 Cola",
                      status: "Preparing",
                    },
                    {
                      table: "Table 11",
                      items: "1 Pasta • 2 Coffee",
                      status: "New",
                    },
                    {
                      table: "Takeaway",
                      items: "3 Sandwiches",
                      status: "Ready",
                    },
                  ].map((order) => (
                    <div
                      key={`${order.table}-${order.items}`}
                      className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {order.table}
                        </p>
                        <p className="text-xs text-zinc-500">{order.items}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side cards */}
              <div className="space-y-4">
                <div
                  className="rounded-3xl p-5 text-white shadow-lg"
                  style={{ backgroundColor: "var(--system-primary)" }}
                >
                  <p className="text-sm font-medium text-white/80">
                    Today’s sales
                  </p>
                  <p className="mt-2 text-3xl font-extrabold">$1,284</p>
                  <p className="mt-1 text-xs text-white/80">
                    +18.4% vs yesterday
                  </p>
                </div>

                <div className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-zinc-900">
                    Active branches
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-zinc-900">
                    8
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Menus, tables, and staff managed centrally
                  </p>
                </div>

                <div
                  className="rounded-3xl border p-5 shadow-sm"
                  style={{
                    borderColor: "var(--system-sage)",
                    backgroundColor: "var(--system-cream)",
                  }}
                >
                  <p className="text-sm font-semibold text-zinc-900">
                    QR ordering status
                  </p>
                  <div className="mt-3 h-2 w-full rounded-full bg-white/80">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: "82%",
                        backgroundColor: "var(--system-primary)",
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-600">
                    82% of table orders placed without staff assistance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating card */}
          <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-xl sm:flex sm:items-center sm:gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: "var(--system-cream)" }}
            >
              <QrCode
                className="h-5 w-5"
                style={{ color: "var(--system-primary)" }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                Scan. Order. Serve faster.
              </p>
              <p className="text-xs text-zinc-500">
                Built for high-volume restaurant flow
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {/* <div className="relative mx-auto mt-16 max-w-7xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border px-5 py-6 text-center shadow-sm"
              style={{
                borderColor: "var(--system-sage)",
                backgroundColor: "rgba(255,255,255,0.75)",
              }}
            >
              <p
                className="text-2xl font-extrabold sm:text-3xl"
                style={{ color: "var(--system-primary)" }}
              >
                {s.value}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-600">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div> */}
    </section>
  );
}
