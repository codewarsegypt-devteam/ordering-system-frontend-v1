import { TESTIMONIALS } from "./data";

export function TestimonialsSection() {
  return (
    <section
      className="border-b px-4 py-20"
      style={{
        borderColor: "var(--system-sage)",
        backgroundColor: "var(--system-cream)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest"
            style={{
              backgroundColor: "var(--system-primary-soft)",
              color: "var(--system-primary)",
            }}
          >
            Testimonials
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
            Loved by restaurant teams
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border bg-white p-7 shadow-sm"
              style={{ borderColor: "var(--system-sage)" }}
            >
              {/* Quote */}
              <p className="text-sm leading-relaxed text-zinc-700">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: "var(--system-primary)" }}
                >
                  {t.avatar}
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
