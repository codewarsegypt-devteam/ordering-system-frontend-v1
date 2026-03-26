"use client";

import Link from "next/link";
import { CheckCircle2, Globe, Grid3X3, GitBranch } from "lucide-react";
import { useTranslations } from "next-intl";

export function SolutionsV2() {
  const t = useTranslations("SolutionsV2");
  return (
    <div className="bg-slate-50 text-slate-900">
      <main className="pt-24">
        <section className="mx-auto max-w-7xl overflow-hidden px-8  md:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-7">
              <span className="inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-800">
                {t("badge")}
              </span>
              <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
                {t("heroTitle")}
              </h1>
              <p className="max-w-2xl text-xl leading-relaxed text-slate-600">
                {t("heroDescription")}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  className="rounded-xl px-8 py-4 text-base font-bold text-white shadow-xl"
                  style={{ backgroundColor: "var(--system-primary)" }}
                >
                  {t("exploreEnterprise")}
                </button>
                <button className="rounded-xl bg-slate-200 px-8 py-4 text-base font-bold text-slate-900 hover:bg-slate-300">
                  {t("viewDemo")}
                </button>
              </div>
            </div>
            <div className="relative lg:col-span-5">
              <div className="aspect-square rotate-3 overflow-hidden rounded-3xl shadow-2xl">
                <img
                  alt="Luxury restaurant interior"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGslmrbkpi1QK4OLNo2T1YvmLD5aoLMTztSkgkKPCeIKMthUhsKN9GPv48vOyjtlGA_bGVbcrOgutc02o35vCyHd8pl-DoT7geWGV9y6Ue2rX2MdAbGop700dQiSe61hifuoC_r7jni_oJoW3O1PUdijA53Rb2Kr1U9N5lPkGOzbT60YbmI02O5_kSnkmSeZD7r6YmX75NJ1hzQeukGL1vZDnyFKrVYm9Ep5NzFwHtAzmoHn5tqx09SHK0vaqKb_d8dxblznCtLfto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 max-w-[240px] rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-xl backdrop-blur-md">
                <div className="mb-2 flex items-center gap-3">
                  <Globe className="h-5 w-5 text-emerald-700" />
                  <span className="text-sm font-bold text-slate-900">
                    {t("activeCurrency")}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  USD, EUR, GBP
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-100 px-8 py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <img
                  className="rounded-2xl shadow-lg"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8uKSJyXpPf03MaSJ99qVRJ0Cg9ipkiMFz1FZ2gbo2F8Q-84yB0yAS8I_kILT5x9hB-tsYEa_9FfE6ZXxH5W-TADpCqQEpJRQJBq3glITJ4wxfSwyAD7FrV3ubZqsg2Xysd4ya79vCI9OYI-qTPG9De7rHCe2n_y6k_O2dCcgLqhFufO2GnnJanbKBzgCFADObXOvKUds5c50w0OI_sQvByttoxhQWya7JjZio0squNDHopufOjz4H8342BNvXoaH87kAgde_dmKip"
                  alt="branch 1"
                />
                <img
                  className="rounded-2xl shadow-lg"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjw_SoE6JJFhS05Fmbwqvzb37N6gdZ9VBMim8S6_SbTwh1-ViZl5wz9fzN8vVqzhCYafnTC0laPrVmw8rEKTfC6zNnSMxNw7sGqlG3gtdTJl9aL-pimBY3Xpb6MBWraMeWG93akyOPZEgViBD8Zq8Yo2_xMdim6nRQer6Al_OWmQSPH9jwbnvUw17-sS1z85esFj-xh2jgM5PYI6wJFwCP1GDyAlxUkt4Ns9ZHsdpuNUZ6VQARMIbDVUx0xaIiOUIEei712eRT-7k8"
                  alt="branch 2"
                />
                <img
                  className="rounded-2xl shadow-lg"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2NRLmavG3lvsDxPNbns7XEY6BTvVR_CjP_pT18u2cB9-E6p7lrd2zNJMa5h9-xqp-F9y80QTQWIUFchCVQIXtTp67X-zMDV-BhvkuI2H9SQLb0X-D1C9YVUQgQu7AuBdPPi-sKTHYn1tPQMZEVCW_H8aHXzSmxHxwJDFw6sVMX3VVPVxv8evdfs6amaI5PymtIOn2ouQZTeDIA_PeKUqE26aBlQqSMhrxhjDKp4UYZ4qepNSiC8RywlMcbXXc9PPs7bvqj8SdRr8K"
                  alt="branch 3"
                />
                <img
                  className="rounded-2xl shadow-lg"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEpUQxoQxyjylTcUdnjNeF0fsb2LJyu7K8Y2PyZxCic0IiV91JtImDjPg6lONmyYomFPSNZdcAj6aAffJ_Bo5gtXfniGmFAZLwkRN_3jfr-RcglRSOljwIObNojVvbhHr511ypELjwXGhJH7zcpV1HTZj4kjkGsw2r6FipYCLfHZLzGvzu1AHtVC5sQ7yAcagoKFjmtMy0clW_-cgQV72sbd3hqGcxslJ1zO8nTLX1agNkukJSuQcSPvMlTnorUTG-aCwRoevaZSHi"
                  alt="branch 4"
                />
              </div>
            </div>
            <div className="order-1 space-y-6 lg:order-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                <GitBranch className="h-6 w-6" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight">
                {t("multiBranchTitle")}
              </h2>
              <p className="text-lg leading-relaxed text-slate-600">
                {t("multiBranchDescription")}
              </p>
              <ul className="space-y-3 pt-3">
                <li className="flex items-center gap-2.5 font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  {t("multiBranchPoint1")}
                </li>
                <li className="flex items-center gap-2.5 font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  {t("multiBranchPoint2")}
                </li>
                <li className="flex items-center gap-2.5 font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  {t("multiBranchPoint3")}
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="px-8 py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-white">
                <Globe className="h-6 w-6" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight">
                {t("globalReadyTitle")}
              </h2>
              <p className="text-lg leading-relaxed text-slate-600">
                {t("globalReadyDescription")}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-3xl font-black text-emerald-700">140+</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("currencies")}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-3xl font-black text-emerald-700">24/7</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("fxSync")}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-linear-to-br from-slate-900 to-black p-8 shadow-2xl">
              <div className="space-y-4">
                {[
                  ["Ribeye Steak - Paris", "€42.00"],
                  ["Ribeye Steak - London", "£38.00"],
                  ["Ribeye Steak - Dubai", "AED 185.00"],
                ].map(([name, price], idx) => (
                  <div
                    key={name}
                    className={`flex items-center justify-between rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm ${idx === 1 ? "ml-8" : idx === 2 ? "ml-16" : ""}`}
                  >
                    <span className="font-medium text-white">{name}</span>
                    <span className="font-bold text-emerald-400">{price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 px-8 py-24 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
            <div className="mx-auto max-w-md">
              <div className="grid aspect-square grid-cols-6 grid-rows-6 gap-3">
                <div className="col-span-2 row-span-2 flex items-center justify-center rounded-2xl bg-emerald-300 font-black text-emerald-950">
                  T1
                </div>
                <div className="col-span-2 col-start-4 row-span-2 flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 font-black text-white/40">
                  T2
                </div>
                <div className="col-span-2 col-start-2 row-span-2 row-start-3 flex items-center justify-center rounded-2xl border border-red-400/40 bg-red-500/20 font-black text-red-300">
                  T3
                </div>
                <div className="col-span-2 row-span-2 row-start-5 flex items-center justify-center rounded-2xl bg-emerald-300 font-black text-emerald-950">
                  T4
                </div>
                <div className="col-span-2 col-start-5 row-span-2 row-start-5 flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 font-black text-white/40">
                  T5
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-900">
                <Grid3X3 className="h-6 w-6" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight">
                {t("tableManagementTitle")}
              </h2>
              <p className="text-lg leading-relaxed text-slate-300">
                {t("tableManagementDescription")}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="rounded-full border border-emerald-300/30 bg-emerald-300/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-200">
                  {t("occupied")}
                </div>
                <div className="rounded-full border border-red-300/30 bg-red-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-200">
                  {t("delayed")}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-8 py-28">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              {t("implementationTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              {t("implementationDescription")}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              [
                "01",
                t("steps.connectTitle"),
                t("steps.connectDescription"),
              ],
              [
                "02",
                t("steps.configureTitle"),
                t("steps.configureDescription"),
              ],
              [
                "03",
                t("steps.scaleTitle"),
                t("steps.scaleDescription"),
              ],
            ].map(([n, t, d]) => (
              <div
                key={n}
                className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <p className="absolute right-6 top-4 text-6xl font-black text-slate-100">
                  {n}
                </p>
                <h3 className="mt-10 text-2xl font-bold">{t}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-8 pb-28">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-4xl bg-emerald-300 p-12 text-center md:p-20">
            <h2 className="text-4xl font-extrabold tracking-tight text-emerald-950 md:text-6xl">
              {t("finalCtaTitle")}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-xl text-emerald-900/80">
              {t("finalCtaDescription")}
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <button className="rounded-2xl bg-slate-900 px-10 py-4 text-lg font-bold text-white shadow-2xl">
                {t("startIntegration")}
              </button>
              <button className="rounded-2xl bg-white/60 px-10 py-4 text-lg font-bold text-emerald-950">
                {t("speakWithArchitect")}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
