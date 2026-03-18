// Client & auth
export { apiClient, getApiError } from "./client";
export * from "./auth";
export * from "./public";
export * from "./orders";
export * from "./stats";

// Menus & categories
export {
  fetchMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  uploadMenuImage,
  deleteMenuImage,
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
  uploadItemImages,
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
  type ItemImagesDto,
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

// Currencies (admin)
export * from "./currencies";

// Table services (call waiter / request bill)
export {
  listTableServices,
  updateTableServiceStatus,
  type TableServiceRow,
  type TableServiceStatus,
  type TableServicesListResponse,
  type TableServicesListParams,
} from "./tableServices";
