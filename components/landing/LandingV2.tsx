"use client";

import Link from "next/link";
import {
  PlayCircle,
  Utensils,
  Building2,
  Globe,
  BarChart3,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import Image from "next/image";

// function TopBar() {
//   return (

//   );
// }

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-20 md:pb-28 md:pt-25">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
        <div className="z-10 lg:col-span-7">
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
            The future of restaurant management
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
            Qrixa: Powerful Menu Ordering & Table Management
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Seamlessly manage orders, tables, and branches across multiple
            currencies with our intuitive SaaS platform.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/home/signup"
              className="rounded-xl px-7 py-3.5 text-center text-base font-bold text-white shadow-lg"
              style={{ backgroundColor: "var(--system-primary)" }}
            >
              Get Started Now
            </Link>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-bold text-slate-800 hover:bg-slate-50">
              <PlayCircle className="h-5 w-5" />
              Watch Demo
            </button>
          </div>
        </div>
        <div className="relative lg:col-span-5">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <Image
              src="/image2.png"
              alt="Qrixa dashboard preview"
              className="aspect-4/5 w-full object-cover"
              width={500}
              height={500}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueGrid() {
  return (
    <section id="features" className="px-6 py-24 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Designed for Growth. Built for Precision.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything you need to orchestrate a world-class dining experience.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm md:col-span-7">
            <Building2 className="h-10 w-10 text-emerald-700" />
            <h3 className="mt-5 text-2xl font-bold text-slate-900">
              Multi-Branch Management
            </h3>
            <p className="mt-3 text-slate-600">
              Centralize operations across cities with one clean dashboard.
            </p>
          </div>
          <div
            className="rounded-xl p-8 text-white shadow-sm md:col-span-5"
            style={{ backgroundColor: "var(--system-primary)" }}
          >
            <Utensils className="h-10 w-10 text-emerald-200" />
            <h3 className="mt-5 text-2xl font-bold">
              Real-Time Table Ordering
            </h3>
            <p className="mt-3 text-slate-200">
              Sync table-side orders with kitchen displays instantly.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 shadow-sm md:col-span-5">
            <Globe className="h-10 w-10 text-slate-800" />
            <h3 className="mt-5 text-2xl font-bold text-slate-900">
              Multi-Currency Support
            </h3>
            <p className="mt-3 text-slate-600">
              Process payments and reporting in local currencies automatically.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-8 shadow-sm md:col-span-7">
            <BarChart3 className="h-10 w-10 text-emerald-700" />
            <h3 className="mt-5 text-2xl font-bold text-slate-900">
              Insightful Analytics
            </h3>
            <p className="mt-3 text-slate-600">
              Understand peak hours, top items, and service performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function KitchenHighlight() {
  const points = [
    {
      title: "Smart Queue Management",
      text: "Automated load balancing between kitchen stations to prevent bottlenecks.",
    },
    {
      title: "Dynamic Menu Control",
      text: "Update prices or disable items instantly across all digital platforms and physical QR menus.",
    },
    {
      title: "Staff Performance Scoring",
      text: "Identify your top performers and optimize scheduling based on real-world order velocity.",
    },
  ];

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <div className="rounded-3xl bg-slate-100 p-6">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn4js8JbwfvBd4O5prybeLS_7cwX4qdb7xd3-Nj097le3fvA3px3X-jX4gxhwzMSbf6LxmJHOJ_U4eEudUte88zbFRZT-86mZ98ESElY5UBn0TsHYaa1PdLSxZoHBb2ca6B5X-UWutsDbr60PAyHyGDS1zbvgzTFnJfGfiay7tDFpmVtm7DgIQCbHqE1lm8RMk_MByhTKUDGv8bkZwhyGG2IbByYS5oH92GRkRyEM3HidRFvcJwZqfWDHqQ54ZfPnQRN9Y0aqHO8zQ"
              alt="Kitchen operations"
              className="h-full w-full rounded-2xl object-cover shadow-xl"
            />
          </div>
          <div className="absolute -bottom-8 left-10 max-w-xs rounded-2xl bg-emerald-300 px-6 py-5 shadow-xl">
            <p className="text-xl font-bold italic leading-snug text-emerald-950">
              “Qrixa transformed our workflow in the first week. We&apos;ve seen
              a 22% increase in table turnover.”
            </p>
            <p className="mt-3 text-sm font-semibold text-emerald-800">
              — Chef Reyad, Le Marois
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
            The Precision Concierge for Your Kitchen.
          </h2>
          <ul className="mt-9 space-y-7">
            {points.map((point) => (
              <li key={point.title} className="flex gap-4">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-3 font-bold text-slate-900">
                    {point.title}
                  </h4>
                  <p className="mt-1 text-lg leading-relaxed text-slate-600">
                    {point.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div
        className="rounded-3xl px-8 py-16 text-center text-white md:px-16"
        style={{ backgroundColor: "var(--system-primary)" }}
      >
        <h2 className="text-3xl font-extrabold md:text-5xl">
          Ready to scale your restaurant business?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-slate-200">
          Join high-performing restaurants using Qrixa to streamline operations.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/home/signup"
            className="rounded-xl bg-white px-8 py-3.5 text-lg font-bold text-slate-900"
          >
            Join Qrixa Today
          </Link>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-lg font-bold text-white hover:bg-white/20">
            Talk to Sales <ArrowUpRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      id="about"
      className="border-t border-slate-200 bg-slate-50 px-6 py-14 text-sm text-slate-600"
    >
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-xl font-bold text-slate-900">Qrixa</p>
          <p className="mt-3 max-w-xs">
            Precision architecture for the modern hospitality industry.
          </p>
        </div>
        <div>
          <p className="mb-3 font-bold text-slate-800">Product</p>
          <ul className="space-y-2">
            <li>Table Management</li>
            <li>POS Integration</li>
            <li>Multi-Currency</li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-bold text-slate-800">Company</p>
          <ul className="space-y-2">
            <li>About</li>
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-200 pt-6 text-xs text-slate-500">
        © 2024 Qrixa. All rights reserved.
      </div>
    </footer>
  );
}

export function LandingV2() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <main>
        <Hero />
        <ValueGrid />
        <KitchenHighlight />
        <section id="solutions" className="px-6 pb-8">
          {/* <div className="mx-auto max-w-7xl rounded-2xl border border-emerald-200/60 bg-emerald-50/40 p-6 text-sm text-emerald-900 md:text-base">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Built for multi-branch restaurants, fast-moving teams, and growth.
            </span>
          </div> */}
        </section>
        <Cta />
      </main>
    </div>
  );
}
