import { apiClient, getApiError } from "./client";
import type { User, UserRole } from "@/lib/types";

export async function fetchUsers(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>("/users");
  return data;
}

export async function fetchUser(userId: string): Promise<User> {
  const { data } = await apiClient.get<User>(`/users/${userId}`);
  return data;
}

/** POST /users — requires auth; body per API: name, email, password, role; optional branch_id, status */
export async function createUser(body: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branch_id?: number | null;
  status?: "active" | "disabled";
}): Promise<User> {
  const { data } = await apiClient.post<User>("/users", {
    name: body.name,
    email: body.email.trim(),
    password: body.password,
    role: body.role,
    branch_id: body.branch_id ?? null,
    ...(body.status ? { status: body.status } : {}),
  });
  return data;
}

export async function updateUser(
  userId: string,
  body: { name?: string; role?: UserRole; branch_id?: string | null }
): Promise<User> {
  const { data } = await apiClient.patch<User>(`/users/${userId}`, body);
  return data;
}

export async function updateUserStatus(
  userId: string,
  status: "active" | "disabled"
): Promise<User> {
  const { data } = await apiClient.patch<User>(`/users/${userId}/status`, {
    status,
  });
  return data;
}

export async function updateUserPassword(
  userId: string,
  password: string
): Promise<User> {
  const { data } = await apiClient.patch<User>(
    `/users/${userId}/password`,
    { password }
  );
  return data;
}

export async function updateUserBranch(
  userId: string,
  branch_id: string | null
): Promise<User> {
  const { data } = await apiClient.patch<User>(`/users/${userId}/branch`, {
    branch_id,
  });
  return data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}

export { getApiError };
