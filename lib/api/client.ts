import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/lib/config";
import { getToken } from "@/lib/tokenCookie";
import type { ApiError } from "@/lib/types";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<ApiError>;
    const msg = ax.response?.data?.error;
    const details = ax.response?.data?.details;
    if (msg) return details ? `${msg}: ${details}` : msg;
    return ax.message || "Request failed";
  }
  return err instanceof Error ? err.message : "Unknown error";
}
