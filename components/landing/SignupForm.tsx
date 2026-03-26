"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup, getApiError, resendVerification } from "@/lib/api";
import {
  Loader2,
  CheckCircle2,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function SignupForm() {
  const t = useTranslations("SignupForm");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [resendBusy, setResendBusy] = useState(false);

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    merchant_name: "",
    password: "",
    confirm_password: "",
    terms_accepted: false,
  });

  const passwordScore = useMemo(() => {
    const pw = form.password;
    if (!pw) return 0;

    let score = 0;
    if (pw.length >= 8) score += 1;
    if (pw.length >= 12) score += 1;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
    if (/\d/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;

    return Math.min(score, 4);
  }, [form.password]);

  const passwordStrength = useMemo(() => {
    if (passwordScore <= 1)
      return { label: t("strength.weak"), color: "text-red-600", bar: "bg-red-500" };
    if (passwordScore === 2)
      return { label: t("strength.fair"), color: "text-amber-600", bar: "bg-amber-500" };
    if (passwordScore === 3)
      return {
        label: t("strength.good"),
        color: "text-emerald-600",
        bar: "bg-emerald-500",
      };
    return {
      label: t("strength.strong"),
      color: "text-emerald-800",
      bar: "bg-emerald-600",
    };
  }, [passwordScore, t]);

  const hasBasicErrors = useMemo(() => {
    const emailOk = !!form.email && form.email.includes("@");
    const nameOk = !!form.name.trim();
    const merchantOk = !!form.merchant_name.trim();
    const passwordOk = form.password.length >= 8;
    const confirmOk =
      form.confirm_password.length > 0 &&
      form.confirm_password === form.password;
    const termsOk = form.terms_accepted;
    return {
      emailOk,
      nameOk,
      merchantOk,
      passwordOk,
      confirmOk,
      termsOk,
      canSubmit:
        emailOk && nameOk && merchantOk && passwordOk && confirmOk && termsOk,
    };
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasBasicErrors.canSubmit) {
      toast.error(
        t("errors.completeFields"),
      );
      return;
    }

    if (passwordScore < 2) {
      toast.error(t("errors.strongerPassword"));
      return;
    }

    setSubmitting(true);
    try {
      const email = form.email.trim().toLowerCase();
      await signup({
        name: form.name.trim(),
        email,
        merchant_name: form.merchant_name.trim(),
        password: form.password,
      });
      setSuccessEmail(email);
      toast.success(t("toasts.checkInbox"));
      setTimeout(() => router.push("/dashboard/login?pending=1"), 2200);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const showSuccess = successEmail != null;

  const handleResend = async () => {
    if (!successEmail) return;
    setResendBusy(true);
    try {
      const res = await resendVerification(successEmail);
      toast.success(res.message || t("toasts.verificationSent"));
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setResendBusy(false);
    }
  };

  if (showSuccess && successEmail) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-(--system-primary) bg-(--system-primary-soft) px-6 py-8 text-center">
        <Mail className="mb-3 h-14 w-14 text-(--system-primary)" />
        <h3 className="text-lg font-bold text-zinc-900">{t("success.verifyTitle")}</h3>
        <p className="mt-2 text-sm text-zinc-600">
          {t("success.verifyDescription")} <strong>{successEmail}</strong>.{" "}
          {t("success.verifyAfter")}
        </p>
        <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {t("success.redirecting")}
        </p>

        <div className="mt-5 flex w-full flex-col gap-2">
          <Link
            href="/dashboard/login?pending=1"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            {t("success.goToSignIn")}
          </Link>
          <button
            type="button"
            disabled={resendBusy}
            onClick={handleResend}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {resendBusy ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("success.sending")}
              </span>
            ) : (
              t("success.resendVerification")
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-(--system-primary)" />
          <span>
            {t("verificationRequired")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="signup-name"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            {t("fields.ownerName")}
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={t("placeholders.ownerName")}
            className={`input-base h-11 w-full rounded-xl border-slate-300 bg-white focus:border-(--system-primary) ${
              form.name.length > 0 && !hasBasicErrors.nameOk
                ? "input-error"
                : ""
            }`}
            required
          />
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            {t("fields.email")}
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder={t("placeholders.email")}
            className={`input-base h-11 w-full rounded-xl border-slate-300 bg-white focus:border-(--system-primary) ${
              form.email.length > 0 && !hasBasicErrors.emailOk
                ? "input-error"
                : ""
            }`}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="signup-merchant"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            {t("fields.merchant")}
          </label>
          <input
            id="signup-merchant"
            type="text"
            autoComplete="organization"
            value={form.merchant_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, merchant_name: e.target.value }))
            }
            placeholder={t("placeholders.merchant")}
            className={`input-base h-11 w-full rounded-xl border-slate-300 bg-white focus:border-(--system-primary) ${
              form.merchant_name.length > 0 && !hasBasicErrors.merchantOk
                ? "input-error"
                : ""
            }`}
            required
          />
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            {t("fields.password")}
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder={t("placeholders.password")}
              className={`input-base h-11 w-full rounded-xl border-slate-300 bg-white pr-11 focus:border-(--system-primary) ${
                form.password.length > 0 && !hasBasicErrors.passwordOk
                  ? "input-error"
                  : ""
              }`}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
              aria-label={showPw ? t("aria.hidePassword") : t("aria.showPassword")}
            >
              {showPw ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {t("fields.strength")}
              </p>
              <span
                className={`text-[11px] font-bold ${passwordStrength.color}`}
              >
                {passwordStrength.label}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
              <div
                className={`h-full transition-all duration-300 ${passwordStrength.bar}`}
                style={{ width: `${(passwordScore / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="signup-confirm-password"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            {t("fields.confirmPassword")}
          </label>
          <div className="relative">
            <input
              id="signup-confirm-password"
              type={showConfirmPw ? "text" : "password"}
              autoComplete="new-password"
              value={form.confirm_password}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  confirm_password: e.target.value,
                }))
              }
              placeholder={t("placeholders.confirmPassword")}
              className={`input-base h-11 w-full rounded-xl border-slate-300 bg-white pr-11 focus:border-(--system-primary) ${
                form.confirm_password.length > 0 && !hasBasicErrors.confirmOk
                  ? "input-error"
                  : ""
              }`}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
              aria-label={
                showConfirmPw
                  ? t("aria.hideConfirmPassword")
                  : t("aria.showConfirmPassword")
              }
            >
              {showConfirmPw ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
          {form.confirm_password.length > 0 && !hasBasicErrors.confirmOk && (
            <p className="mt-1 text-[12px] font-medium text-red-600">
              {t("errors.passwordsMismatch")}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
        <div className="flex items-start gap-3">
        <input
          id="signup-terms"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-slate-300 text-(--system-primary) focus:ring-(--system-primary-soft)"
          checked={form.terms_accepted}
          onChange={(e) =>
            setForm((f) => ({ ...f, terms_accepted: e.target.checked }))
          }
          required
        />
        <label htmlFor="signup-terms" className="text-sm text-slate-600">
          {t("termsAgreement")}
        </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--system-primary) font-semibold text-white shadow-sm transition-all hover:brightness-95 disabled:opacity-70"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          t("actions.createAccount")
        )}
      </button>

      <p className="text-center text-[12px] text-slate-500">
        {t("footerNote")}
      </p>
    </form>
  );
}
