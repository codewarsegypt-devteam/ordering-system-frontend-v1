"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail, getApiError } from "@/lib/api";
import { Loader2 } from "lucide-react";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");
  const [text, setText] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("err");
      setText("Missing verification token. Open the link from your email.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await verifyEmail(token);
        if (cancelled) return;
        if (res.error) {
          setStatus("err");
          setText(res.error);
        } else {
          setStatus("ok");
          setText(res.message ?? "Email verified. You can sign in.");
        }
      } catch (err) {
        if (cancelled) return;
        setStatus("err");
        setText(getApiError(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
          <p className="text-sm text-slate-600">Verifying your email…</p>
        </div>
      )}
      {status === "ok" && (
        <>
          <h1 className="text-xl font-bold text-emerald-900">Verified</h1>
          <p className="mt-2 text-sm text-slate-600">{text}</p>
          <Link
            href="/dashboard/login"
            className="btn-primary mt-6 inline-flex justify-center px-6 py-2.5"
          >
            Sign in
          </Link>
        </>
      )}
      {status === "err" && (
        <>
          <h1 className="text-xl font-bold text-slate-900">
            Couldn&apos;t verify
          </h1>
          <p className="mt-2 text-sm text-slate-600">{text}</p>
          <Link
            href="/dashboard/login?pending=1"
            className="mt-6 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-12">
      <Suspense
        fallback={
          <div className="text-sm text-slate-500">Loading…</div>
        }
      >
        <VerifyEmailInner />
      </Suspense>
    </div>
  );
}
