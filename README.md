# Merchant Ordering – Frontend

Next.js frontend for the **online merchant ordering system**: **Dashboard** (staff) and **Website menu** (customer).

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4**
- **Axios** – API client
- **TanStack React Query** – server state & caching
- **React Hook Form** – forms (login, checkout)
- **Lucide React** – icons
- **Context** – auth (dashboard), theme, cart (menu)

## Project structure

```
app/
  layout.tsx           # Root layout
  page.tsx             # Home (links to Dashboard & Menu)
  dashboard/           # Staff app
    layout.tsx         # Sidebar nav, AuthProvider, QueryProvider
    login/page.tsx     # Login
    page.tsx           # Overview
    orders/            # Orders list & detail, status updates
    menu/page.tsx      # Menu management (menus/categories list)
  menu/                # Customer menu site
    layout.tsx        # CartProvider, ThemeProvider, QueryProvider
    page.tsx          # Public menu (?merchantId=...&tableCode=...)
    cart/page.tsx     # Cart
    checkout/page.tsx # Checkout → place order
contexts/
  AuthContext.tsx     # Login, user, logout
  ThemeContext.tsx    # Merchant theme (primary/secondary)
  CartContext.tsx     # Cart entries, line items for order
lib/
  config.ts           # API_BASE_URL, DEFAULT_MERCHANT_ID
  types/index.ts      # User, Order, PublicMenu, Cart, etc.
  api/
    client.ts         # Axios instance, auth header, getApiError
    public.ts         # fetchPublicMenu, validateCart, createOrder
    auth.ts           # login, getMe, logout
    orders.ts         # fetchOrders, fetchOrder, updateOrderStatus, kitchen/cashier
    menus.ts          # fetchMenus, fetchMenuCategories
components/
  providers/
    QueryProvider.tsx # React Query client
```

## API

- **Base URL:** `https://online-merchant-ordering-system-bac.vercel.app`
- Override with `NEXT_PUBLIC_API_URL` in `.env.local`.
- Optional: `NEXT_PUBLIC_MERCHANT_ID` for a default merchant.

## Run

```bash
npm install
npm run dev
```

- **Home:** http://localhost:3000  
- **Dashboard:** http://localhost:3000/dashboard (login required)  
- **Menu:** http://localhost:3000/menu?merchantId=YOUR_MERCHANT_UUID  
  With table QR: `?merchantId=...&tableCode=TABLE_QR_CODE`

## Dashboard

- **Login** at `/dashboard/login` (name + password).
- **Orders:** list, filter by status, view detail, accept → preparing → ready → completed (or cancel).
- **Menu:** lists menus and categories (read-only from API).

## Website menu

1. Open `/menu?merchantId=<uuid>` (and optionally `&tableCode=<qr>`).
2. Browse categories and items; add to cart (variants and modifiers with min/max).
3. **Cart** – adjust quantity, remove lines.
4. **Checkout** – order type, name/phone/notes, place order.
5. **Branch:** required for placing order; provided when opening the menu with a valid `tableCode`, or when the backend returns a default branch.
