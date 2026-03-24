import Link from "next/link";
import { SignupForm } from "./SignupForm";
import { ShieldCheck, Clock, Zap } from "lucide-react";

const REASSURANCES = [
  { icon: Zap, text: "Set up in under 10 minutes" },
  { icon: ShieldCheck, text: "No credit card required" },
  { icon: Clock, text: "Free forever on the Starter plan" },
];

export function SignupSection() {
  return (
    <section
      id="signup"
      className="px-4 py-20"
      style={{
        background:
          "linear-gradient(180deg, #fff 0%, var(--system-cream) 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
          {/* Left: pitch */}
          <div className="flex-1 text-center lg:text-left">
            <span
              className="mb-4 inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest"
              style={{
                backgroundColor: "var(--system-primary-soft)",
                color: "var(--system-primary)",
              }}
            >
              Get started
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl lg:text-4xl">
              Your restaurant,
              <br />
              <span style={{ color: "var(--system-primary)" }}>
                on every table.
              </span>
            </h2>
            <p className="mt-5 max-w-md text-zinc-600">
              Create your account, build your menu, and start accepting QR
              orders today. No complex onboarding. No vendor lock-in.
            </p>
            <ul className="mt-8 space-y-4">
              {REASSURANCES.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 text-sm font-medium text-zinc-700"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "var(--system-primary-soft)" }}
                  >
                    <Icon
                      className="h-4 w-4"
                      style={{ color: "var(--system-primary)" }}
                    />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form */}
          <div className="w-full max-w-md">
            <div
              className="rounded-2xl border bg-white p-8 shadow-md"
              style={{ borderColor: "var(--system-sage)" }}
            >
              <h3 className="mb-1 text-lg font-bold text-zinc-900">
                Create your account
              </h3>
              <p className="mb-6 text-sm text-zinc-500">
                Start accepting orders in minutes.
              </p>
              <SignupForm />
            </div>
            <p className="mt-5 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/dashboard/login"
                className="font-semibold hover:underline"
                style={{ color: "var(--system-primary)" }}
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
