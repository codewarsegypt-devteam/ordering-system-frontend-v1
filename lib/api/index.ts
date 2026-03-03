// Client & auth
export { apiClient, getApiError } from "./client";
export * from "./auth";
export * from "./public";
export * from "./orders";

// Menus & categories
export {
  fetchMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  fetchMenuCategories,
  createCategory,
  reorderCategories,
  updateCategory,
  deleteCategory,
  type MenuDto,
  type CategoryDto,
} from "./menus";

// Items, variants, item–modifier links
export {
  fetchCategoryItems,
  createItem,
  fetchItem,
  updateItem,
  updateItemStatus,
  deleteItem,
  fetchItemVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  fetchItemModifierGroups,
  attachModifierGroup,
  updateItemModifierGroup,
  detachModifierGroup,
  type ItemStatus,
  type ItemDto,
  type ItemVariantDto,
  type ItemModifierGroupLinkDto,
  type ItemDetailDto,
} from "./items";

// Modifier groups & modifiers
export {
  fetchModifierGroups,
  createModifierGroup,
  updateModifierGroup,
  deleteModifierGroup,
  fetchModifiers,
  createModifier,
  updateModifier,
  deleteModifier,
  type ModifierGroupDto,
  type ModifierDto,
} from "./modifiers";

// Merchants, branches, tables, users
export * from "./merchants";
export * from "./branches";
export * from "./tables";
export * from "./users";
