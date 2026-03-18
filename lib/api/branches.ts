import { apiClient, getApiError } from "./client";

export interface BranchDto {
  id: string;
  merchant_id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface TableDto {
  id: string;
  merchant_id: string;
  branch_id: string;
  number: string;
  seats?: number;
  is_active: boolean;
  qr_code?: string | null;
  created_at?: string;
}

export async function fetchBranches(): Promise<BranchDto[]> {
  const { data } = await apiClient.get<BranchDto[]>("/branches");
  return data;
}

export async function createBranch(body: {
  name: string;
  address?: string | null;
  phone?: string | null;
  is_active?: boolean;
}): Promise<BranchDto> {
  const { data } = await apiClient.post<BranchDto>("/branches", body);
  return data;
}

export async function updateBranch(
  branchId: string,
  body: {
    name?: string;
    address?: string | null;
    phone?: string | null;
    is_active?: boolean;
  }
): Promise<BranchDto> {
  const { data } = await apiClient.patch<BranchDto>(
    `/branches/${branchId}`,
    body
  );
  return data;
}

export async function deleteBranch(branchId: string): Promise<void> {
  await apiClient.delete(`/branches/${branchId}`);
}

export async function fetchBranchTables(branchId: string): Promise<TableDto[]> {
  const { data } = await apiClient.get<TableDto[]>(
    `/branches/${branchId}/tables`
  );
  return data;
}

export async function createTable(
  branchId: string,
  body: {
    number: string;
    seats?: number;
    is_active?: boolean;
    qr_code?: string | null;
  }
): Promise<TableDto> {
  const { data } = await apiClient.post<TableDto>(
    `/branches/${branchId}/tables`,
    body
  );
  return data;
}

export { getApiError };
