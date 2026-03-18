import Link from "next/link";
import { ExternalLink } from "lucide-react";

const FOOTER_LINKS = [
  {
    group: "Product",
    items: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
      { label: "Plans", href: "#plans" },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Sign up", href: "#signup" },
      { label: "Log in", href: "/dashboard/login" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    group: "Built by",
    items: [
      { label: "Code Wars Egypt", href: "https://codewarsegypt.com", external: true },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-900 text-zinc-400">
      {/* Main footer grid */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-white">
              <img src="/logos/3.svg" alt="Qrixa" className="h-9 w-9 object-contain" />
              <span className="text-lg tracking-tight">Qrixa</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Smart QR ordering system for restaurants and cafés. No app download,
              no hardware lock-in.
            </p>

            {/* Powered by Code Wars */}
            <a
              href="https://codewarsegypt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-700 hover:text-white"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black text-white"
                style={{ backgroundColor: "var(--system-green)" }}
              >
                ⚔
              </span>
              Powered by Code Wars Egypt
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>

          {/* Link groups */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.group}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                {group.group}
              </h4>
              <ul className="space-y-3">
                {group.items.map((item) =>
                  "external" in item && item.external ? (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-white"
                      >
                        {item.label}
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </a>
                    </li>
                  ) : (
                    <li key={item.label}>
                      {item.href.startsWith("/") ? (
                        <Link
                          href={item.href}
                          className="text-sm transition-colors hover:text-white"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <a
                          href={item.href}
                          className="text-sm transition-colors hover:text-white"
                        >
                          {item.label}
                        </a>
                      )}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Qrixa. Smart restaurant ordering.
          </p>
          <a
            href="https://codewarsegypt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
          >
            Built by{" "}
            <span
              className="font-semibold"
              style={{ color: "var(--system-green)" }}
            >
              Code Wars Egypt
            </span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
