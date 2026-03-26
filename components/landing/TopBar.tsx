"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { locales } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const items = [
  { label: "EN", value: "en" },
  { label: "AR", value: "ar" },
  { label: "DE", value: "de" },
  { label: "RU", value: "ru" },
];

const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("TopBar");
  const locale = useLocale();
  const router = useRouter();

  const closeMenu = () => setIsMenuOpen(false);
  const localeLabel: Record<(typeof locales)[number], string> = {
    en: "EN",
    ar: "AR",
    de: "DE",
    ru: "RU",
  };

  const setLanguage = (nextLocale: (typeof locales)[number]) => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return (
    <div className="relative">
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/home"
            className="text-2xl font-black tracking-tight text-slate-900"
            onClick={closeMenu}
          >
            <Image src="/logos/4.svg" alt="Qrixa" width={100} height={100} />
          </Link>
          <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <Link href="/home/#features" className="hover:text-slate-900">
              {t("features")}
            </Link>
            <Link href="/home/pricing" className="hover:text-slate-900">
              {t("pricing")}
            </Link>
            <Link href="/home/solutions" className="hover:text-slate-900">
              {t("solutions")}
            </Link>
            <Link href="/home/about" className="hover:text-slate-900">
              {t("about")}
            </Link>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Select
              value={locale}
              onValueChange={(value) =>
                setLanguage(value as (typeof locales)[number])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Link
              href="/dashboard/login"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t("signIn")}
            </Link>
            <Link
              href="/home/signup"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--system-primary)" }}
            >
              {t("getStarted")}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 md:hidden"
            aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        <div
          className={`overflow-hidden border-t border-slate-200 bg-white px-4 transition-all duration-300 md:hidden ${
            isMenuOpen
              ? "max-h-[380px] py-4 opacity-100"
              : "max-h-0 py-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            <Link
              href="/home/#features"
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
              onClick={closeMenu}
            >
              {t("features")}
            </Link>
            <Link
              href="/home/pricing"
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
              onClick={closeMenu}
            >
              {t("pricing")}
            </Link>
            <Link
              href="/home/solutions"
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
              onClick={closeMenu}
            >
              {t("solutions")}
            </Link>
            <Link
              href="/home/about"
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
              onClick={closeMenu}
            >
              {t("about")}
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
          <Select
              value={locale}
              onValueChange={(value) =>
                setLanguage(value as (typeof locales)[number])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Link
              href="/dashboard/login"
              className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              onClick={closeMenu}
            >
              {t("signIn")}
            </Link>
            <Link
              href="/home/signup"
              className="rounded-lg px-3 py-2 text-center text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--system-primary)" }}
              onClick={closeMenu}
            >
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default TopBar;
