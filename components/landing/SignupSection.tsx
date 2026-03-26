import Link from "next/link";
import { SignupForm } from "./SignupForm";
import { ShieldCheck, Clock, Zap, Sparkles } from "lucide-react";

const REASSURANCES = [
  { icon: Zap, text: "Set up in under 10 minutes" },
  { icon: ShieldCheck, text: "No credit card required" },
  { icon: Clock, text: "Free forever on the Starter plan" },
];

export function SignupSection() {
  return (
    <section id="signup" className="px-4 py-16 sm:py-20 h-screen">
      <div
        className="mx-auto max-w-7xl rounded-3xl  px-4 py-10 "
       
      >
        <div className="flex  items-stretch justify-center  lg:flex-row lg:items-start ">
          {/* Left: minimal pitch (keep it side-by-side, but remove the long text) */}
          {/* <div className="hidden flex-1 px-2 lg:block lg:max-w-[360px]">
            <div
              className="rounded-3xl border border-slate-200/80 bg-white/60 p-6 shadow-sm"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,243,225,0.55) 100%)",
              }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 shadow-sm">
                <Sparkles
                  className="h-4 w-4"
                  style={{ color: "var(--system-primary)" }}
                />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Fast setup
                </span>
              </div>

              <h3 className="mt-5 text-base font-extrabold text-zinc-900">
                Secure owner access
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Email verification required before signing in to the dashboard.
              </p>

        
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <ShieldCheck className="h-4 w-4 text-[var(--system-primary)]" />
                  <span>No vendor lock-in</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Clock className="h-4 w-4 text-[var(--system-primary)]" />
                  <span>Set up in minutes</span>
                </div>
              </div>
            </div>
          </div> */}

          {/* Right: form */}
          <div className="w-full max-w-md lg:self-start">
            <div
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              style={{ boxShadow: "0 6px 30px rgba(2, 6, 23, 0.04)" }}
            >
              <div className="mb-2">
                <h3 className="text-xl font-extrabold text-zinc-900">
                  Create your account
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Set up in minutes. We’ll send a verification link to your email.
                </p>
              </div>

              {/* <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Tip:</span>{" "}
                Use the owner email you want to manage your restaurant.
              </div> */}

              <SignupForm />

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/dashboard/login"
                  className="font-semibold hover:underline"
                  style={{ color: "blue" }}
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
