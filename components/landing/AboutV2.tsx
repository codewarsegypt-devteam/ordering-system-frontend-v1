"use client";

import Link from "next/link";
import { Cog, Mail, Phone, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";


export function AboutV2() {
  const t = useTranslations("AboutV2");
  return (
    <div className="bg-slate-50 text-slate-900">

      <main className="">
        <section className="mx-auto grid max-w-7xl items-center gap-14 overflow-hidden px-8 py-24 md:py-25 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-800">
              {t("visionBadge")}
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-relaxed text-slate-600">
              {t("heroDescription")}
            </p>
          </div>
          <div className="relative">
            <div className=" h-[500px] overflow-hidden rounded-xl shadow-2xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeL8rt7_TkOKvPTkDii0FZIMwwoSZkERPKCzFm8f8YIiD1f1207lYZJoSoooPRlh4lHvZVahEuKBJHt24atsf3dc8EA4vXPMhMoRSa3L5h6leRHiB5I_PPVxFLwjTpBs11GtNIz_lm2vFHs1t5XtQHJ69QK01V_5kPaJP-iz2HdrPw9evQ7EdMyDbTmdLuC6cC0kAN0DYAaf6ankMUH_HMkJwJQR7K_EGE2SC9E-h--QUtorHl-DwPGd7yujwdly-hWo8vXRAabfuy"
                alt="Qrixa vision"
                className="h-[500px] w-full object-cover "
              />
            </div>
            <div className="absolute -bottom-8 -left-8 hidden max-w-xs rounded-xl bg-white/85 p-6 shadow-xl backdrop-blur-md md:block">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <Cog className="h-5 w-5 text-emerald-700" />
                </div>
                <p className="font-bold text-slate-900">{t("precisionTitle")}</p>
              </div>
              <p className="text-sm text-slate-600">
                {t("precisionText")}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-100 py-24 md:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {t("complexityTitle")}
              </h2>
              <div className="mt-8 h-1 w-20 bg-emerald-600" />
            </div>
            <div className="space-y-8 lg:col-span-7">
              <p className="text-2xl leading-snug text-slate-900">
                {t("originLead")}
              </p>
              <div className="grid gap-8 pt-4 md:grid-cols-2">
                <p className="leading-relaxed text-slate-600">
                  {t("originParagraph1")}
                </p>
                <p className="leading-relaxed text-slate-600">
                  {t("originParagraph2")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-20 px-8 py-24 md:py-32 lg:grid-cols-2">
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                {t("contactTitle")}
              </h2>
              <p className="mt-5 text-lg text-slate-600">
                {t("contactDescription")}
              </p>
            </div>

            <div className="space-y-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Mail className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t("supportArchitecture")}</p>
                  <a href="mailto:codewarsegypt@gmail.com" className="text-emerald-700 hover:underline">
                    codewarsegypt@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Phone className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t("directLine")}</p>
                  <a href="tel:+201225330675" className="text-slate-600">+20 1225330675 (Egypt)</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Share2 className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t("connect")}</p>
                  <div className="mt-2 flex gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <a href="#" className="hover:text-emerald-700">LinkedIn</a>
                    <a href="#" className="hover:text-emerald-700">Twitter</a>
                    <a href="#" className="hover:text-emerald-700">Instagram</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-sm md:p-10">
            <form className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("form.fullName")}
                  </label>
                  <input className="input-base bg-slate-100/90" placeholder={t("form.fullNamePlaceholder")} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("form.emailAddress")}
                  </label>
                  <input className="input-base bg-slate-100/90" placeholder={t("form.emailPlaceholder")} type="email" />
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("form.restaurantName")}
                  </label>
                  <input className="input-base bg-slate-100/90" placeholder={t("form.restaurantPlaceholder")} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("form.numberOfBranches")}
                  </label>
                  <select className="input-base bg-slate-100/90">
                    <option>{t("form.branches1to5")}</option>
                    <option>{t("form.branches6to20")}</option>
                    <option>{t("form.branches21Plus")}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t("form.message")}
                </label>
                <textarea
                  className="input-base min-h-[120px] resize-none bg-slate-100/90"
                  placeholder={t("form.messagePlaceholder")}
                />
              </div>
              <button
                className="w-full rounded-lg px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white"
                style={{ backgroundColor: "var(--system-primary)" }}
                type="button"
              >
                {t("form.initiateConsultation")}
              </button>
              <p className="px-2 text-center text-xs leading-relaxed text-slate-500">
                {t("form.privacyNote")}
              </p>
            </form>
          </div>
        </section>
      </main>

    </div>
  );
}

