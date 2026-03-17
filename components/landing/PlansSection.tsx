import { Check, Sparkles } from "lucide-react";
import { PLANS } from "./data";

export function PlansSection() {
  return (
    <section id="plans" className="border-b border-zinc-100 bg-zinc-50 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest"
            style={{
              backgroundColor: "var(--system-green-soft)",
              color: "var(--system-green)",
            }}
          >
            Pricing
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
            Simple, honest pricing
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-600">
            Start free with everything you need. Upgrade when your business grows.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 flex flex-wrap items-start justify-center gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm transition-all ${
                plan.highlighted
                  ? "ring-2"
                  : "border-2 border-zinc-100"
              }`}
              style={
                plan.highlighted
                  ? {
                      border: "2px solid var(--system-green)",
                      ["--tw-ring-color" as string]: "var(--system-green)",
                    }
                  : undefined
              }
            >
              {/* Popular badge */}
              {"badge" in plan && plan.badge && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--system-green)" }}
                >
                  <Sparkles className="mr-1 inline-block h-3 w-3" />
                  {plan.badge}
                </div>
              )}

              <h3 className="text-xl font-bold text-zinc-900">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-zinc-900">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-zinc-500">/{plan.period}</span>
                )}
              </div>
              <p className="mt-3 text-sm text-zinc-600">{plan.description}</p>

              <ul className="mt-7 space-y-3">
                {plan.features.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-700">
                    <span
                      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: "var(--system-green-soft)" }}
                    >
                      <Check
                        className="h-2.5 w-2.5"
                        strokeWidth={3}
                        style={{ color: "var(--system-green)" }}
                      />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.ctaHref ? (
                  <a
                    href={plan.ctaHref}
                    className="block w-full rounded-xl py-3.5 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "var(--system-green)" }}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="block w-full cursor-not-allowed rounded-xl border-2 border-dashed border-zinc-200 py-3.5 text-center text-sm font-semibold text-zinc-400"
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-zinc-500">
          All plans include QR ordering, dashboard, and multi-currency display.
          No hidden fees.
        </p>
      </div>
    </section>
  );
}
