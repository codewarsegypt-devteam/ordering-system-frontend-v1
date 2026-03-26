import Link from "next/link";
import { SignupForm } from "./SignupForm";
import { ShieldCheck, Clock3, Zap, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function SignupSection() {
  const t = useTranslations("SignupSection");
  const REASSURANCES = [
    { icon: Zap, text: t("reassurances.setupFast") },
    { icon: ShieldCheck, text: t("reassurances.noCard") },
    { icon: Clock3, text: t("reassurances.startFree") },
  ];
  return (
    <section
      id="signup"
      className="relative overflow-hidden bg-[#F8FAFC] px-4 pb-16 pt-8 sm:pb-20 sm:pt-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_1fr]">
          <div
            className="rounded-3xl border border-slate-200/70 p-6 sm:p-8"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.92))",
              boxShadow: "0 10px 35px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("badge")}
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-600 sm:text-base">
              {t("description")}
            </p>

            <div className="mt-6 space-y-3">
              {REASSURANCES.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                >
                  <Icon className="h-4.5 w-4.5 shrink-0 text-(--system-primary)" />
                  <span className="text-sm font-medium text-zinc-700">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3">
              <p className="flex items-start gap-2 text-sm text-zinc-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {t("verificationNote")}
              </p>
            </div>
          </div>

          <div className="w-full lg:self-start">
            <div
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8"
              style={{ boxShadow: "0 12px 34px rgba(2, 6, 23, 0.07)" }}
            >
              <div className="mb-5">
                <h3 className="text-xl font-extrabold text-zinc-900">
                  {t("formTitle")}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {t("formDescription")}
                </p>
              </div>

              <SignupForm />

              <p className="mt-5 text-center text-sm text-slate-500">
                {t("alreadyHaveAccount")}{" "}
                <Link
                  href="/dashboard/login"
                  className="font-semibold text-(--system-primary) hover:underline"
                >
                  {t("logIn")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
