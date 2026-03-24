import { Check, Sparkles } from "lucide-react";
import { PLANS } from "./data";

export function PlansSection() {
  return (
    <section id="plans" className="border-b border-zinc-100 bg-white px-4 py-20">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-600">
            Start free. Upgrade when you're ready. No hidden fees, cancel
            anytime.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid items-start gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-7 shadow-sm transition-all ${
                plan.highlighted
                  ? "border-zinc-700 bg-zinc-900 text-white shadow-xl"
                  : "border-zinc-200 bg-white"
              }`}
              style={
                plan.highlighted
                  ? {
                      boxShadow: "0 10px 30px rgba(0,0,0,0.16)",
                    }
                  : undefined
              }
            >
              {/* Popular badge */}
              {"badge" in plan && plan.badge && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--system-primary)" }}
                >
                  {/* <Sparkles className="mr-1 inline-block h-3 w-3" /> */}
                  {plan.badge}
                </div>
              )}

              <h3
                className={`text-xl font-bold ${
                  plan.highlighted ? "text-white" : "text-zinc-900"
                }`}
              >
                {plan.name}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span
                  className={`text-4xl font-extrabold ${
                    plan.highlighted ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={`text-sm ${
                      plan.highlighted ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    /{plan.period}
                  </span>
                )}
              </div>
              <p
                className={`mt-3 text-sm ${
                  plan.highlighted ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                {plan.description}
              </p>

              <ul className="mt-7 space-y-3">
                {plan.features.map((item) => (
                  <li
                    key={item}
                    className={`flex items-start gap-2.5 text-sm ${
                      plan.highlighted ? "text-zinc-300" : "text-zinc-700"
                    }`}
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: "var(--system-primary)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <a
                  href={plan.ctaHref ?? "/signup"}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "text-white"
                      : "border border-zinc-300 text-zinc-800 hover:bg-zinc-50"
                  }`}
                  style={
                    plan.highlighted
                      ? { backgroundColor: "var(--system-primary)" }
                      : undefined
                  }
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
