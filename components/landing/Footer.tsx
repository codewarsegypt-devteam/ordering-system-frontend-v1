"use client";
import React from "react";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("Footer");

  return (
    <div>
      {" "}
      <footer className="border-t border-slate-200 bg-white px-8 py-12 text-sm text-slate-600">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2">
            <p className="mb-3 text-xl font-bold text-slate-900">Qrixa</p>
            <p className="max-w-xs">{t("tagline")}</p>
          </div>
          <div>
            <p className="mb-3 font-bold text-slate-900">{t("product")}</p>
            <ul className="space-y-2">
              <li>{t("features")}</li>
              <li>{t("pricing")}</li>
              <li>{t("integrations")}</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-bold text-slate-900">{t("resources")}</p>
            <ul className="space-y-2">
              <li>{t("documentation")}</li>
              <li>{t("helpCenter")}</li>
              <li>{t("community")}</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-bold text-slate-900">{t("company")}</p>
            <ul className="space-y-2">
              <li>{t("aboutUs")}</li>
              <li>{t("careers")}</li>
              <li>{t("contact")}</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-bold text-slate-900">{t("legal")}</p>
            <ul className="space-y-2">
              <li>{t("privacy")}</li>
              <li>{t("terms")}</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-200 pt-6 text-xs text-slate-500">
          {t("copyright")}
        </div>
      </footer>
    </div>
  );
};

export default Footer;
