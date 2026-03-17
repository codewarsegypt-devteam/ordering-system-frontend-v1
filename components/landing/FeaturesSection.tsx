import { FEATURES } from "./data";
import { CheckCircle2 } from "lucide-react";

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Core: { bg: "var(--system-cream)", text: "var(--system-green)" },
  Pro: { bg: "var(--system-green)", text: "#fff" },
};

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span
            className="inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]"
            style={{
              backgroundColor: "var(--system-green-soft)",
              color: "var(--system-green)",
            }}
          >
            Features
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            Everything you need to run
            <span
              className="block"
              style={{ color: "var(--system-green)" }}
            >
              QR ordering smoothly
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
            Give guests an easy ordering experience and give your team the tools
            to manage menus, orders, branches, and staff without complexity.
          </p>
        </div>

        {/* Sales cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const badge = BADGE_COLORS[f.badge] ?? BADGE_COLORS.Core;

            return (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: "var(--system-green)" }}
                  >
                    <f.icon className="h-6 w-6" />
                  </div>

                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {f.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-zinc-900">
                  {f.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-zinc-600">
                  {f.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2
                    className="h-4 w-4"
                    style={{ color: "var(--system-green)" }}
                  />
                  <span className="text-zinc-700">Built for daily restaurant use</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}