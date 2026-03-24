import { FEATURES } from "./data";

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span
            className="inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]"
            style={{
              backgroundColor: "var(--system-primary-soft)",
              color: "var(--system-primary)",
            }}
          >
            Features
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            Everything you need to run a modern restaurant
          </h2>
        </div>

        {/* Feature cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--system-cream)" }}
              >
                <f.icon
                  className="h-4.5 w-4.5"
                  style={{ color: "var(--system-primary)" }}
                />
              </div>

              <h3 className="mt-4 text-base font-bold text-zinc-900">{f.title}</h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
