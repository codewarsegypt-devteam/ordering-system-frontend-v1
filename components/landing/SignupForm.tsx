"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup, getApiError } from "@/lib/api";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function SignupForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    username: "",
    merchant_name: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.merchant_name.trim() || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signup({
        username: form.username.trim(),
        merchant_name: form.merchant_name.trim(),
        password: form.password,
      });
      setSuccess(true);
      toast.success("Account created! You can sign in now.");
      setTimeout(() => router.push("/dashboard/login?signedup=1"), 1500);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[var(--system-primary)] bg-[var(--system-primary-soft)] px-8 py-12 text-center">
        <CheckCircle2 className="mb-4 h-14 w-14 text-[var(--system-primary)]" />
        <h3 className="text-lg font-bold text-zinc-900">You&apos;re all set!</h3>
        <p className="mt-2 text-sm text-zinc-600">
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="signup-username" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Username
        </label>
        <input
          id="signup-username"
          type="text"
          autoComplete="username"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          placeholder="e.g. john"
          className="input-base w-full"
          required
        />
      </div>
      <div>
        <label htmlFor="signup-merchant" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Restaurant / Merchant name
        </label>
        <input
          id="signup-merchant"
          type="text"
          autoComplete="organization"
          value={form.merchant_name}
          onChange={(e) => setForm((f) => ({ ...f, merchant_name: e.target.value }))}
          placeholder="e.g. My Restaurant"
          className="input-base w-full"
          required
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="Min. 6 characters"
          className="input-base w-full"
          required
          minLength={6}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white transition-colors disabled:opacity-70"
        style={{ backgroundColor: "var(--system-primary)" }}
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );
}
