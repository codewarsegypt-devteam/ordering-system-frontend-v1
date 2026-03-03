import { apiClient, getApiError } from "./client";

export type ItemStatus = "active" | "hidden" | "out_of_stock";

export interface ItemDto {
  id: string;
  category_id: string;
  name_ar?: string;
  name_en?: string;
  base_price: number;
  description_ar?: string | null;
  description_en?: string | null;
  status: ItemStatus;
  created_at?: string;
}

export interface ItemVariantDto {
  id: string;
  item_id: string;
  name_ar?: string;
  name_en?: string;
  price: number;
}

export interface ItemModifierGroupLinkDto {
  id: string;
  modifier_group_id: string;
  min_select: number;
  max_select: number;
}

export interface ItemDetailDto extends ItemDto {
  variants?: ItemVariantDto[];
  modifier_groups?: ItemModifierGroupLinkDto[];
}

export async function fetchCategoryItems(categoryId: string): Promise<ItemDto[]> {
  const { data } = await apiClient.get<ItemDto[]>(
    `/categories/${categoryId}/items`
  );
  return data;
}

export async function createItem(
  categoryId: string,
  body: {
    name_ar: string;
    name_en: string;
    base_price: number;
    description_ar?: string | null;
    description_en?: string | null;
    status?: ItemStatus;
  }
): Promise<ItemDto> {
  const { data } = await apiClient.post<ItemDto>(
    `/categories/${categoryId}/items`,
    body
  );
  return data;
}

export async function fetchItem(itemId: string): Promise<ItemDetailDto> {
  const { data } = await apiClient.get<ItemDetailDto>(`/items/${itemId}`);
  return data;
}

export async function updateItem(
  itemId: string,
  body: {
    name_ar?: string;
    name_en?: string;
    base_price?: number;
    description_ar?: string | null;
    description_en?: string | null;
    status?: ItemStatus;
  }
): Promise<ItemDto> {
  const { data } = await apiClient.patch<ItemDto>(`/items/${itemId}`, body);
  return data;
}

export async function updateItemStatus(
  itemId: string,
  status: ItemStatus
): Promise<ItemDto> {
  const { data } = await apiClient.patch<ItemDto>(
    `/items/${itemId}/status`,
    { status }
  );
  return data;
}

export async function deleteItem(itemId: string): Promise<void> {
  await apiClient.delete(`/items/${itemId}`);
}

export async function fetchItemVariants(itemId: string): Promise<ItemVariantDto[]> {
  const { data } = await apiClient.get<ItemVariantDto[]>(
    `/items/${itemId}/variants`
  );
  return data;
}

export async function createVariant(
  itemId: string,
  body: { name_ar: string; name_en: string; price: number }
): Promise<ItemVariantDto> {
  const { data } = await apiClient.post<ItemVariantDto>(
    `/items/${itemId}/variants`,
    body
  );
  return data;
}

export async function updateVariant(
  variantId: string,
  body: {
    name_ar?: string;
    name_en?: string;
    price?: number;
  }
): Promise<ItemVariantDto> {
  const { data } = await apiClient.patch<ItemVariantDto>(
    `/variants/${variantId}`,
    body
  );
  return data;
}

export async function deleteVariant(variantId: string): Promise<void> {
  await apiClient.delete(`/variants/${variantId}`);
}

export async function fetchItemModifierGroups(itemId: string): Promise<ItemModifierGroupLinkDto[]> {
  const { data } = await apiClient.get<ItemModifierGroupLinkDto[]>(
    `/items/${itemId}/modifier-groups`
  );
  return data;
}

export async function attachModifierGroup(
  itemId: string,
  body: { modifier_group_id: string; min_select: number; max_select: number }
): Promise<unknown> {
  const { data } = await apiClient.post(
    `/items/${itemId}/modifier-groups`,
    body
  );
  return data;
}

export async function updateItemModifierGroup(
  itemId: string,
  groupId: string,
  body: { min_select: number; max_select: number }
): Promise<unknown> {
  const { data } = await apiClient.patch(
    `/items/${itemId}/modifier-groups/${groupId}`,
    body
  );
  return data;
}

export async function detachModifierGroup(
  itemId: string,
  groupId: string
): Promise<void> {
  await apiClient.delete(`/items/${itemId}/modifier-groups/${groupId}`);
}

export { getApiError };
