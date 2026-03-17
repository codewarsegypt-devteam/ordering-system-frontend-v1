import {
  QrCode,
  Store,
  NotebookPen,
  Users,
  CookingPot,
  CheckCircle2,
} from "lucide-react";
import { HOW_IT_WORKS } from "./data";

const STEP_ICONS = [
  QrCode,
  Store,
  NotebookPen,
  Users,
  CookingPot,
  CheckCircle2,
];

const PREVIEW_ITEMS = [
  "Create your account",
  "Set up your branch",
  "Add menu items",
  "Generate table QR codes",
  "Start receiving orders",
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative overflow-hidden px-4 py-24 sm:py-28"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(120,180,90,0.10), transparent 28%), linear-gradient(180deg, #ffffff 0%, var(--system-cream) 100%)",
      }}
    >
      {/* Decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ backgroundColor: "var(--system-sage)", opacity: 0.18 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full blur-3xl"
        style={{ backgroundColor: "var(--system-green)", opacity: 0.08 }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em]"
            style={{
              backgroundColor: "var(--system-green-soft)",
              color: "var(--system-green)",
            }}
          >
            How it works
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            From empty setup to
            <span
              className="block"
              style={{ color: "var(--system-green)" }}
            >
              live table orders
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
            A simple rollout designed for restaurants and cafés. No complicated
            onboarding, no extra hardware, no friction for guests or staff.
          </p>
        </div>

        {/* Main unique layout */}
        <div className="mt-16 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          {/* Left sticky preview */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-[32px] border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              {/* Fake app chrome */}
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
              </div>

              <div className="mt-5 rounded-[28px] border border-zinc-100 bg-zinc-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      Reyad Setup Flow
                    </p>
                    <p className="text-xs text-zinc-500">
                      Your restaurant launch journey
                    </p>
                  </div>

                  <div
                    className="rounded-full px-3 py-1 text-xs font-bold"
                    style={{
                      backgroundColor: "var(--system-green-soft)",
                      color: "var(--system-green)",
                    }}
                  >
                    Fast setup
                  </div>
                </div>

                {/* Progress steps */}
                <div className="mt-6 space-y-3">
                  {PREVIEW_ITEMS.map((label, i) => {
                    const Icon = STEP_ICONS[i] || CheckCircle2;
                    const active = i < 3;

                    return (
                      <div
                        key={label}
                        className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm"
                        style={{
                          borderColor: active
                            ? "rgba(120,180,90,0.25)"
                            : "rgba(0,0,0,0.06)",
                        }}
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: active
                              ? "var(--system-green-soft)"
                              : "var(--system-cream)",
                          }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{
                              color: active
                                ? "var(--system-green)"
                                : "rgb(113 113 122)",
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-zinc-900">
                            {label}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {active ? "Completed" : "Coming next"}
                          </p>
                        </div>

                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: active
                              ? "var(--system-green)"
                              : "rgb(212 212 216)",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Bottom insight card */}
                <div
                  className="mt-5 rounded-3xl p-5"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--system-green) 0%, #7bb45f 100%)",
                  }}
                >
                  <p className="text-sm font-medium text-white/80">
                    Time to launch
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-white">
                    Minutes, not days
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/85">
                    Set up your restaurant, generate QR codes, and start taking
                    live orders from tables with minimal training.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right narrative timeline */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute bottom-0 left-[23px] top-0 hidden w-px md:block"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, var(--system-sage) 8%, var(--system-sage) 92%, transparent 100%)",
              }}
            />

            <div className="space-y-6">
              {HOW_IT_WORKS.map((item, i) => {
                const Icon = STEP_ICONS[i] || CheckCircle2;

                return (
                  <div key={item.step} className="relative">
                    <div className="grid gap-4 md:grid-cols-[48px_1fr] md:gap-6">
                      {/* Timeline marker */}
                      <div className="relative z-10 hidden md:block">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-white shadow-md"
                          style={{ borderColor: "var(--system-sage)" }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: "var(--system-green)" }}
                          />
                        </div>
                      </div>

                      {/* Content card */}
                      <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] backdrop-blur">
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-extrabold text-white md:hidden"
                            style={{ backgroundColor: "var(--system-green)" }}
                          >
                            {item.step}
                          </span>

                          <span
                            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                            style={{
                              backgroundColor: "var(--system-cream)",
                              color: "var(--system-green)",
                            }}
                          >
                            Step {item.step}
                          </span>
                        </div>

                        <h3 className="mt-4 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                          {item.title}
                        </h3>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
                          {item.description}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                          <div
                            className="rounded-2xl px-4 py-2 text-sm font-semibold"
                            style={{
                              backgroundColor: "var(--system-green-soft)",
                              color: "var(--system-green)",
                            }}
                          >
                            Easy to complete
                          </div>

                          <div className="text-sm text-zinc-500">
                            Built for fast restaurant onboarding
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}