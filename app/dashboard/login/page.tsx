"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts";
import { getApiError } from "@/lib/api";
import { LogIn } from "lucide-react";

interface LoginForm {
  name: string;
  password: string;
}

export default function DashboardLoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      await login(data.name, data.password);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-teal-900/30 px-4">
      <div className="card w-full max-w-md p-8 shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/30">
            <LogIn className="h-7 w-7" />
          </div>
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold text-zinc-900">
          Dashboard Login
        </h1>
        <p className="mb-8 text-center text-sm text-zinc-500">
          Sign in to manage orders and menu
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="name" className="label">
              Username / Email
            </label>
            <input
              id="name"
              type="text"
              autoComplete="username"
              className="input-base"
              placeholder="Enter your username or email"
              {...register("name", { required: "Required" })}
            />
          </div>
          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input-base"
              placeholder="Enter your password"
              {...register("password", { required: "Required" })}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
