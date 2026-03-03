import { apiClient, getApiError } from "./client";

export interface ModifierGroupDto {
  id: string;
  name_ar?: string;
  name_en?: string;
  created_at?: string;
}

export interface ModifierDto {
  id: string;
  modifier_group_id: string;
  name_ar?: string;
  name_en?: string;
  price: number;
  created_at?: string;
}

export async function fetchModifierGroups(): Promise<ModifierGroupDto[]> {
  const { data } = await apiClient.get<ModifierGroupDto[]>("/modifier-groups");
  return data;
}

export async function createModifierGroup(body: {
  name_ar: string;
  name_en: string;
}): Promise<ModifierGroupDto> {
  const { data } = await apiClient.post<ModifierGroupDto>(
    "/modifier-groups",
    body
  );
  return data;
}

export async function updateModifierGroup(
  groupId: string,
  body: { name_ar?: string; name_en?: string }
): Promise<ModifierGroupDto> {
  const { data } = await apiClient.patch<ModifierGroupDto>(
    `/modifier-groups/${groupId}`,
    body
  );
  return data;
}

export async function deleteModifierGroup(groupId: string): Promise<void> {
  await apiClient.delete(`/modifier-groups/${groupId}`);
}

export async function fetchModifiers(groupId: string): Promise<ModifierDto[]> {
  const { data } = await apiClient.get<ModifierDto[]>(
    `/modifier-groups/${groupId}/modifiers`
  );
  return data;
}

export async function createModifier(
  groupId: string,
  body: { name_ar: string; name_en: string; price: number }
): Promise<ModifierDto> {
  const { data } = await apiClient.post<ModifierDto>(
    `/modifier-groups/${groupId}/modifiers`,
    body
  );
  return data;
}

export async function updateModifier(
  modifierId: string,
  body: { name_ar?: string; name_en?: string; price?: number }
): Promise<ModifierDto> {
  const { data } = await apiClient.patch<ModifierDto>(
    `/modifiers/${modifierId}`,
    body
  );
  return data;
}

export async function deleteModifier(modifierId: string): Promise<void> {
  await apiClient.delete(`/modifiers/${modifierId}`);
}

export { getApiError };
