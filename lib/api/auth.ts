import { apiClient, getApiError } from "./client";
import type { User, LoginResponse } from "@/lib/types";

export async function login(
  name: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", {
    name,
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

export { getApiError };
