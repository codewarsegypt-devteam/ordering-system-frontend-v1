import { apiClient, getApiError } from "./client";
import type { User, LoginResponse } from "@/lib/types";

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

/** POST /auth/signup — merchant + owner; user stays pending until email verified */
export interface AuthSignupBody {
  name: string;
  password: string;
  merchant_name: string;
  email: string;
}

export interface AuthSignupResponse {
  message: string;
  merchant: { id: number; name: string; [key: string]: unknown };
  user: User;
}

export async function signup(
  body: AuthSignupBody,
): Promise<AuthSignupResponse> {
  const { data } = await apiClient.post<AuthSignupResponse>(
    "/auth/signup",
    body,
  );
  return data;
}

export async function resendVerification(
  email: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    "/auth/resend-verification",
    { email },
  );
  return data;
}

export async function forgotPassword(
  email: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    "/auth/forgot-password",
    { email },
  );
  return data;
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    "/auth/reset-password",
    { token, password },
  );
  return data;
}

/** GET /auth/verify-email?token= (public) */
export async function verifyEmail(token: string): Promise<{
  message?: string;
  error?: string;
}> {
  const { data } = await apiClient.get<{ message?: string; error?: string }>(
    "/auth/verify-email",
    { params: { token } },
  );
  return data;
}

export { getApiError };
