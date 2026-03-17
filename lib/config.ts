export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  // "https://ordering-system-backend-v1-1.onrender.com";
  // "https://online-merchant-ordering-system-bac.vercel.app";
  "http://localhost:3001";

export const DEFAULT_MERCHANT_ID = process.env.NEXT_PUBLIC_MERCHANT_ID || "";

/** Dashboard system colors (palette) */
export const SYSTEM_COLORS = {
  red: "#A82323",
  redHover: "#8b1c1c",
  cream: "#FEFFD3",
  sage: "#BCD9A2",
  green: "#6D9E51",
  greenHover: "#5a8545",
} as const;
