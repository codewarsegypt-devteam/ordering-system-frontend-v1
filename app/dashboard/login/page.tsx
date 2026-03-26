"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { getApiError, resendVerification } from "@/lib/api";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
}

export default function DashboardLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const signedUp = searchParams.get("signedup") === "1";
  const pendingVerify = searchParams.get("pending") === "1";
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<LoginForm>();

  const emailValue = watch("email");

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setResendMsg(null);
    try {
      await login(data.email.trim(), data.password, redirectTo);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleResend = async () => {
    const email = emailValue?.trim();
    if (!email) {
      setResendMsg("Enter your email above first.");
      return;
    }
    setResendBusy(true);
    setResendMsg(null);
    try {
      const res = await resendVerification(email);
      setResendMsg(res.message);
    } catch (err) {
      setResendMsg(getApiError(err));
    } finally {
      setResendBusy(false);
    }
  };

  const showResend =
    error &&
    (error.toLowerCase().includes("email not verified") ||
      error.toLowerCase().includes("not verified"));

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-teal-900 px-16 lg:flex lg:w-[45%] xl:w-1/2">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-teal-500/10" />
        <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-teal-500/8" />
        <div className="relative text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-teal-500/20 ring-1 ring-teal-400/30">
            <img
              src="/logos/3.svg"
              alt="Qrixa"
              className="h-14 w-14 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">Qrixa Dashboard</h1>
          <p className="mx-auto mt-3 max-w-xs text-base leading-relaxed text-slate-400">
            Manage your orders, menu and branches from one place.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Orders", value: "Live" },
              { label: "Menu", value: "Full" },
              { label: "Teams", value: "Multi" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10"
              >
                <p className="text-xl font-bold text-teal-400">{s.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-teal-600/20 ring-1 ring-teal-400/30">
              <img
                src="/logos/3.svg"
                alt="Qrixa"
                className="h-10 w-10 object-contain"
              />
            </div>
            <p className="mt-3 text-xl font-bold text-slate-800">Qrixa</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">
                Use the email and password for your owner account
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {pendingVerify && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Check your inbox and verify your email before signing in.
                </div>
              )}
              {signedUp && !pendingVerify && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  Account created. Sign in with your email and password.
                </div>
              )}
              {error && (
                <div className="alert-error flex flex-col gap-2">
                  <span className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-red-500">!</span>
                    <span>{error}</span>
                  </span>
                  {showResend && (
                    <div className="border-t border-red-100 pt-2">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendBusy}
                        className="text-sm font-semibold text-red-800 underline-offset-2 hover:underline disabled:opacity-50"
                      >
                        {resendBusy ? "Sending…" : "Resend verification email"}
                      </button>
                      {resendMsg && (
                        <p className="mt-1 text-xs text-slate-600">{resendMsg}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="input-base"
                  placeholder="you@restaurant.com"
                  {...register("email", { required: "Required" })}
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="password" className="label mb-0">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-teal-700 hover:text-teal-800"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    className="input-base pr-11"
                    placeholder="Enter your password"
                    {...register("password", { required: "Required" })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center py-2.5 text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              No account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-teal-700 hover:text-teal-800"
              >
                Create one
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Qrixa. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
