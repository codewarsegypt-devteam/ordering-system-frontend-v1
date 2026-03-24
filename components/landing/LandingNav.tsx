"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Plans", href: "#plans" },
  { label: "Sign up", href: "/signup" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const homePrefix = pathname === "/" ? "" : "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow ${
        scrolled
          ? "border-b border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-zinc-900"
        >
          <img
            src="/logos/4.svg"
            alt="Qrixa"
            className="h-9 w-20 object-contain"
          />
          {/* <span className="text-lg tracking-tight">Qrixa</span> */}
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href.startsWith("#") ? `${homePrefix}${l.href}` : l.href}
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              {l.label}
            </a>
          ))}
          <div className="ml-2 h-5 w-px bg-zinc-200" />
          <Link
            href="/dashboard/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg"
            style={{ backgroundColor: "var(--system-primary)" }}
          >
            Get started free
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? (
            <X className="h-4.5 w-4.5" />
          ) : (
            <Menu className="h-4.5 w-4.5" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-zinc-100 bg-white px-4 pb-4 md:hidden">
          <nav className="mt-3 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href.startsWith("#") ? `${homePrefix}${l.href}` : l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/dashboard/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl px-3 py-3 text-center text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--system-primary)" }}
            >
              Get started free
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
