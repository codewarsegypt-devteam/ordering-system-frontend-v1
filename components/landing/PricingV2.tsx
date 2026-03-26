"use client";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

// function PricingTopBar() {
//   return (
//     <nav className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
//       <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
//         <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900">
//           Qrixa
//         </Link>
//         <div className="hidden items-center space-x-8 text-sm font-semibold md:flex">
//           <Link href="/#features" className="text-slate-500 hover:text-slate-900">
//             Features
//           </Link>
//           <Link href="/pricing" className="border-b-2 border-emerald-500 pb-1 text-slate-900">
//             Pricing
//           </Link>
//           <Link href="/solutions" className="text-slate-500 hover:text-slate-900">
//             Solutions
//           </Link>
//           <Link href="/about" className="text-slate-500 hover:text-slate-900">
//             About
//           </Link>
//         </div>
//         <Link
//           href="/signup"
//           className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white"
//           style={{ backgroundColor: "var(--system-primary)" }}
//         >
//           Get Started
//         </Link>
//       </div>
//     </nav>
//   );
// }

function PlanCard({
  title,
  price,
  subtitle,
  features,
  cta,
  highlighted = false,
}: {
  title: string;
  price: string;
  subtitle: string;
  features: Array<{ text: string; disabled?: boolean }>;
  cta: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl p-8 transition-all ${
        highlighted
          ? "scale-[1.01] border border-emerald-300/40 shadow-xl"
          : "bg-white hover:-translate-y-1"
      }`}
      style={highlighted ? { backgroundColor: "var(--system-primary)" } : undefined}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-950">
          Popular
        </span>
      )}

      <div>
        <div className="mb-6">
          <p className={`text-xs font-bold uppercase tracking-wider ${highlighted ? "text-slate-300" : "text-slate-500"}`}>
            {title}
          </p>
          <h2 className={`mt-2 text-4xl font-extrabold ${highlighted ? "text-white" : "text-slate-900"}`}>
            {price}
          </h2>
        </div>

        <p className={`mb-7 text-sm leading-relaxed ${highlighted ? "text-slate-300" : "text-slate-600"}`}>
          {subtitle}
        </p>

        <ul className="space-y-3">
          {features.map((item) => (
            <li
              key={item.text}
              className={`flex items-center gap-2.5 text-sm ${
                item.disabled ? "opacity-40" : highlighted ? "text-white" : "text-slate-700"
              }`}
            >
              {item.disabled ? (
                <XCircle className="h-4.5 w-4.5" />
              ) : (
                <CheckCircle2 className={`h-4.5 w-4.5 ${highlighted ? "text-emerald-300" : "text-emerald-600"}`} />
              )}
              <span className={item.disabled ? "line-through" : ""}>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        className={`mt-8 w-full rounded-lg px-5 py-3 text-sm font-bold transition-colors ${
          highlighted
            ? "bg-emerald-300 text-emerald-950 hover:bg-emerald-200"
            : "bg-slate-100 text-slate-900 hover:bg-slate-200"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

export function PricingV2() {
  const t = useTranslations("PricingV2");
  return (
    <div className="bg-slate-50 text-slate-900">

      <main className="pb-24 pt-32">
        <header className="mx-auto mb-16 max-w-7xl px-8 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            {t("heroDescription")}
          </p>
        </header>

        <section className="mx-auto mb-20 grid max-w-7xl grid-cols-1 gap-6 px-8 md:grid-cols-3">
          <PlanCard
            title="Starter"
            price="$10/mo"
            subtitle={t("starter.subtitle")}
            cta={t("starter.cta")}
            features={[
              { text: t("starter.feature1") },
              { text: t("starter.feature2") },
              { text: t("starter.feature3") },
              { text: t("starter.feature4"), disabled: true },
            ]}
          />
          <PlanCard
            title="Professional"
            price="$20/mo"
            subtitle={t("professional.subtitle")}
            cta={t("professional.cta")}
            highlighted
            features={[
              { text: t("professional.feature1") },
              { text: t("professional.feature2") },
              { text: t("professional.feature3") },
              { text: t("professional.feature4") },
            ]}
          />
          <PlanCard
            title="Enterprise"
            price="Custom"
            subtitle={t("enterprise.subtitle")}
            cta={t("enterprise.cta")}
            features={[
              { text: t("enterprise.feature1") },
              { text: t("enterprise.feature2") },
              { text: t("enterprise.feature3") },
              { text: t("enterprise.feature4") },
            ]}
          />
        </section>

        <section className="mx-auto mb-20 max-w-5xl px-8">
          <h3 className="mb-8 text-center text-3xl font-bold tracking-tight">
            {t("technicalSpecifications")}
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 font-bold">{t("table.feature")}</th>
                  <th className="px-5 py-4 text-center font-bold">Starter</th>
                  <th className="bg-emerald-50 px-5 py-4 text-center font-bold text-emerald-800">
                    Professional
                  </th>
                  <th className="px-5 py-4 text-center font-bold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ["Branch Limits", "1 Branch", "Up to 5", "Unlimited"],
                  ["Currency Support", "Local Only", "Multi-currency", "Global Settlement"],
                  ["Support Level", "Community", "Priority Email", "Dedicated Agent"],
                  ["Analytics", "Standard", "Advanced", "Predictive AI"],
                  ["API Access", "—", "—", "Full Access"],
                ].map((row) => (
                  <tr key={row[0]}>
                    <td className="px-5 py-4 font-medium">{row[0]}</td>
                    <td className="px-5 py-4 text-center">{row[1]}</td>
                    <td className="bg-emerald-50/50 px-5 py-4 text-center">{row[2]}</td>
                    <td className="px-5 py-4 text-center">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto mb-20 max-w-4xl px-8">
          <h3 className="mb-8 text-center text-3xl font-bold tracking-tight">
            {t("faqTitle")}
          </h3>
          <div className="grid gap-4">
            {[
              t("faq.question1"),
              t("faq.question2"),
              t("faq.question3"),
            ].map((q) => (
              <div key={q} className="rounded-lg bg-white p-6 shadow-sm">
                <h4 className="mb-2 font-bold">{q}</h4>
                <p className="text-sm leading-relaxed text-slate-600">
                  {t("faqAnswer")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-8">
          <div className="relative overflow-hidden rounded-xl bg-emerald-300 p-10 md:p-12">
            <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="text-center md:text-left">
                <h3 className="text-4xl font-extrabold tracking-tight text-emerald-950">
                  {t("ctaTitle")}
                </h3>
                <p className="mt-3 text-lg text-emerald-900/80">
                  {t("ctaDescription")}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/home/signup"
                  className="rounded-lg bg-slate-900 px-7 py-3 text-sm font-bold text-white"
                >
                  {t("startFreeTrial")}
                </Link>
                <button className="rounded-lg border border-emerald-900/20 bg-white/30 px-7 py-3 text-sm font-bold text-emerald-950">
                  {t("bookDemo")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

     
    </div>
  );
}

