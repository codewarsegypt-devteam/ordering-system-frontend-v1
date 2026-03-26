"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword, getApiError } from "@/lib/api";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Missing token. Open the reset link from your email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      // Completes the "forgot password" flow
      const res = await resetPassword(token, password);
      setMessage(res.message);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Link
        href="/dashboard/login"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter a new password for your account.
        </p>

        {!token && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            This page needs a valid token in the URL. Open the link from your
            email.
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {message && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {message}
            </div>
          )}

          {error && <div className="alert-error text-sm">{error}</div>}

          <div>
            <label htmlFor="password" className="label">
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                className="input-base pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
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
            disabled={busy || !token}
            className="btn-primary w-full justify-center py-2.5"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Submit"
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            Token expires automatically and can only be used once.
          </p>

          <div className="pt-2 text-center">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              Request a new reset link
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordRoutePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-12">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

