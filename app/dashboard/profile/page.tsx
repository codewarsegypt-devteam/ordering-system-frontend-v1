"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  UserCircle2,
  Loader2,
  Save,
  KeyRound,
  Mail,
  Building2,
  MapPin,
  Shield,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts";
import { getMe, getApiError, updateUser, updateUserPassword } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/PageHeader";

interface ProfileFormValues {
  name: string;
}

interface PasswordFormValues {
  password: string;
  confirmPassword: string;
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className="flex items-center gap-2 rounded-t-2xl px-5 py-4"
        style={{
          backgroundColor: "var(--system-cream)",
          borderBottom: "1px solid var(--system-sage)",
        }}
      >
        <div style={{ color: "var(--system-primary)" }}>{icon}</div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-800">
      {children}
    </label>
  );
}

function ReadOnlyRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="text-sm text-slate-800">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { refetchUser } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
  });

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: { name: "" },
  });

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!profile) return;
    profileForm.reset({ name: profile.name });
  }, [profile, profileForm]);

  const updateProfileMut = useMutation({
    mutationFn: (body: { name: string }) =>
      updateUser(profile!.id, { name: body.name.trim() }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      await refetchUser();
      toast.success("Profile updated.");
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const passwordMut = useMutation({
    mutationFn: (password: string) =>
      updateUserPassword(profile!.id, password),
    onSuccess: async () => {
      passwordForm.reset();
      toast.success("Password updated.");
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const onSubmitProfile = profileForm.handleSubmit((values) => {
    if (!profile) return;
    if (values.name.trim() === profile.name) {
      toast.message("No changes to save.");
      return;
    }
    updateProfileMut.mutate({ name: values.name });
  });

  const onSubmitPassword = passwordForm.handleSubmit((values) => {
    if (!profile) return;
    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (values.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    passwordMut.mutate(values.password);
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2
          className="h-7 w-7 animate-spin"
          style={{ color: "var(--system-primary)" }}
        />
        <p className="text-sm text-slate-500">Loading profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="alert-error">
        {error ? getApiError(error) : "Could not load profile."}
      </div>
    );
  }

  const created = profile.created_at
    ? new Date(profile.created_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your profile"
        description="View your account details and update your name or password."
        icon={
          <UserCircle2
            className="h-5 w-5"
            style={{ color: "var(--system-primary)" }}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card
            title="Account details"
            icon={<UserCircle2 className="h-4 w-4" />}
          >
            <div className="space-y-3">
              <ReadOnlyRow
                icon={Mail}
                label="Email"
                value={profile.email ?? undefined}
              />
              <ReadOnlyRow
                icon={Shield}
                label="Role"
                value={profile.role}
              />
              <ReadOnlyRow
                icon={Building2}
                label="Merchant"
                value={profile.merchant_name ?? undefined}
              />
              <ReadOnlyRow
                icon={MapPin}
                label="Branch"
                value={profile.branch_name ?? undefined}
              />
              <ReadOnlyRow
                icon={Calendar}
                label="Member since"
                value={created}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title="Display name"
            icon={<UserCircle2 className="h-4 w-4" />}
          >
            <form onSubmit={onSubmitProfile} className="space-y-4">
              <div>
                <FieldLabel>Name</FieldLabel>
                <input
                  type="text"
                  autoComplete="name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  {...profileForm.register("name", {
                    required: "Name is required",
                    minLength: { value: 1, message: "Name is required" },
                  })}
                />
                {profileForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={updateProfileMut.isPending}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity disabled:opacity-60"
                style={{ backgroundColor: "var(--system-primary)" }}
              >
                {updateProfileMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save name
              </button>
            </form>
          </Card>

          <Card title="Password" icon={<KeyRound className="h-4 w-4" />}>
            <form onSubmit={onSubmitPassword} className="space-y-4">
              <div>
                <FieldLabel>New password</FieldLabel>
                <input
                  type="password"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  {...passwordForm.register("password", {
                    required: "Enter a new password",
                  })}
                />
              </div>
              <div>
                <FieldLabel>Confirm password</FieldLabel>
                <input
                  type="password"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  {...passwordForm.register("confirmPassword", {
                    required: "Confirm your password",
                  })}
                />
              </div>
              <button
                type="submit"
                disabled={passwordMut.isPending}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                {passwordMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Update password
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
