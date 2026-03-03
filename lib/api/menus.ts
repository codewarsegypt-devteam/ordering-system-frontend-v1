import { apiClient, getApiError } from "./client";

export interface MenuDto {
  id: string;
  name_ar?: string;
  name_en?: string;
  currancy?: string;
  currency?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CategoryDto {
  id: string;
  name_ar?: string;
  name_en?: string;
  description_ar?: string | null;
  description_en?: string | null;
  sort_order: number;
  img_url_1?: string | null;
  is_active: boolean;
  menu_id?: string;
}

export async function fetchMenus(): Promise<MenuDto[]> {
  const { data } = await apiClient.get<MenuDto[]>("/menus");
  return data;
}

export async function createMenu(body: {
  name_ar: string;
  name_en: string;
  currency?: string;
  is_active?: boolean;
}): Promise<MenuDto> {
  const { data } = await apiClient.post<MenuDto>("/menus", {
    name_ar: body.name_ar,
    name_en: body.name_en,
    currancy: body.currency ?? "EGP",
    is_active: body.is_active,
  });
  return data;
}

export async function updateMenu(
  menuId: string,
  body: {
    name_ar?: string;
    name_en?: string;
    currency?: string;
    is_active?: boolean;
  }
): Promise<MenuDto> {
  const payload: Record<string, unknown> = {};
  if (body.name_ar !== undefined) payload.name_ar = body.name_ar;
  if (body.name_en !== undefined) payload.name_en = body.name_en;
  if (body.currency !== undefined) payload.currancy = body.currency;
  if (body.is_active !== undefined) payload.is_active = body.is_active;
  const { data } = await apiClient.patch<MenuDto>(`/menus/${menuId}`, payload);
  return data;
}

export async function deleteMenu(menuId: string): Promise<void> {
  await apiClient.delete(`/menus/${menuId}`);
}

export async function fetchMenuCategories(menuId: string): Promise<CategoryDto[]> {
  const { data } = await apiClient.get<CategoryDto[]>(
    `/menus/${menuId}/categories`
  );
  return data;
}

export async function createCategory(
  menuId: string,
  body: {
    name_ar: string;
    name_en: string;
    description_ar?: string | null;
    description_en?: string | null;
    sort_order?: number;
    img_url_1?: string | null;
    is_active?: boolean;
  }
): Promise<CategoryDto> {
  const { data } = await apiClient.post<CategoryDto>(
    `/menus/${menuId}/categories`,
    body
  );
  return data;
}

export async function reorderCategories(items: { category_id: string; sort_order: number }[]): Promise<{ ok: boolean }> {
  const { data } = await apiClient.patch<{ ok: boolean }>(
    "/categories/reorder",
    { items }
  );
  return data;
}

export async function updateCategory(
  categoryId: string,
  body: {
    name_ar?: string;
    name_en?: string;
    description_ar?: string | null;
    description_en?: string | null;
    sort_order?: number;
    img_url_1?: string | null;
    is_active?: boolean;
  }
): Promise<CategoryDto> {
  const { data } = await apiClient.patch<CategoryDto>(
    `/categories/${categoryId}`,
    body
  );
  return data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/categories/${categoryId}`);
}

export { getApiError };
