// Auth & User
export type UserRole = "owner" | "manager" | "cashier" | "kitchen";
export type UserStatus = "active" | "disabled" | "pending_verification";

export interface User {
  id: string;
  name: string;
  email?: string | null;
  merchant_id: string;
  branch_id: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  merchant_name?: string;
  branch_name?: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: User;
  merchant_name?: string;
  branch_name?: string | null;
}

// Merchant
export interface Merchant {
  id: string;
  created_at?: string;
  name: string;
  logo?: string | null;
  status?: string;
  base_color_1?: string | null;
  base_color_2?: string | null;
  has_color_1?: string | null;
  has_color_2?: string | null;
}

// Public menu (customer)
export interface PublicMenuVariant {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  display_price?: number;
}

export interface PublicMenuModifier {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  display_price?: number;
}

export interface PublicMenuModifierGroupRule {
  group: { id: string; name_ar: string; name_en: string };
  rule: { min_select: number; max_select: number };
  modifiers: PublicMenuModifier[];
}

export interface PublicMenuItem {
  id: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string | null;
  description_en?: string | null;
  base_price: number;
  display_price?: number;
  status: string;
  variants?: PublicMenuVariant[];
  modifier_groups?: PublicMenuModifierGroupRule[];
  images?: { img_url_1: string | null; img_url_2: string | null };
}

export interface PublicMenuCategory {
  id: string;
  menue_id: string;
  name_ar: string;
  name_en: string;
  sort_order: number;
  is_active: boolean;
  items: PublicMenuItem[];
}

export interface PublicMenuData {
  id: string;
  merchant_id: string;
  name_ar: string;
  name_en: string;
  currancy: string;
  is_active: boolean;
  created_at: string;
}

export interface PublicMenuResponse {
  merchant_id: string;
  branch_id: string | null;
  table_id: string | null;
  /** Table code (qr_code). Required for create order when opening via ?t=TOKEN — backend getMenu should set this when a table is resolved. */
  table_code?: string | null;
  menu: PublicMenuData;
  categories: PublicMenuCategory[];
}

// Cart & order
export interface CartLineModifier {
  modifier_id: string;
  quantity: number;
}

export interface CartLineItem {
  item_id: string;
  variant_id: string | null;
  quantity: number;
  modifiers: CartLineModifier[];
}

export interface ValidateCartRequest {
  merchant_id: string;
  branch_id: string;
  table_id: string | null;
  items: CartLineItem[];
  currency_id?: number;
}

export interface ValidateCartResponse {
  is_valid: boolean;
  errors: string[];
  totals: {
    subtotal: number;
    total: number;
    display_subtotal: number;
    display_total: number;
  };
  currency_info: {
    display_currency: import("./currency").Currency | null;
    display_rate: number;
  };
  line_items: Array<{
    item_id: number;
    variant_id: number | null;
    unit_price: number;
    qty: number;
    line_total: number;
    display_unit_price: number;
    display_line_total: number;
  }>;
}

export type OrderType = "dine_in" | "pickup" | "delivery";
export type OrderStatus =
  | "draft"
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export interface CreateOrderRequest {
  merchant_id: string;
  /** Table code (e.g. from QR). Backend infers branch_id and table_id from it. Omit for pickup/delivery without table. */
  table_code?: string | null;
  order_type: OrderType;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  items: CartLineItem[];
}

export interface Order {
  id: string | number;
  merchant_id?: string | number | null;
  merchent_id?: string | number | null;
  branch_id: string | number | null;
  table_id: string | number | null;
  order_number: string;
  status: OrderStatus;
  order_type?: OrderType;
  customer_name?: string | null;
  customer_phone?: string | null;
  notes?: string | null;
  total_price: number;
  created_at: string;
  /** Optional: present when backend sends last update time. Used for live polling cursor. */
  updated_at?: string;
  branch_name?: string | null;
  table_number?: string | null;
  branch?: {
    id: string | number;
    name: string;
  } | null;
  table?: {
    id: string | number;
    number: string | number;
  } | null;
  items?: OrderItem[];
}

export interface OrderItemModifier {
  id: string;
  modifier_id: string;
  name_snapshot: string;
  price_snapshot: number;
  price: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  variant_id: string | null;
  quantity: number;
  name_snapshot: string;
  price_snapshot: number;
  total_price: number;
  modifiers?: OrderItemModifier[];
}

export interface CreateOrderResponse {
  order_id: string;
  table_session_id?: string;
  order_number: string;
  status: OrderStatus;
  total_price: number;
  display_total_price?: number;
  display_currency_id?: number | null;
  display_exchange_rate?: number;
}

// Dashboard – list response
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface OrdersListResponse {
  data: Order[];
  pagination?: PaginationMeta;
  next_cursor: string | null;
}

// API error
export interface ApiError {
  error?: string;
  message?: string;
  details?: string;
}
