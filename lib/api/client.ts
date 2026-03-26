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
  if (config.data instanceof FormData) {
    // Let the browser set Content-Type with boundary for multipart
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else {
      delete (config.headers as Record<string, unknown>)["Content-Type"];
    }
  }
  return config;
});

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<ApiError & { message?: string }>;
    const data = ax.response?.data;
    const msg = data?.error ?? data?.message;
    const details = data?.details;
    if (msg) return details ? `${msg}: ${details}` : String(msg);
    return ax.message || "Request failed";
  }
  return err instanceof Error ? err.message : "Unknown error";
}
