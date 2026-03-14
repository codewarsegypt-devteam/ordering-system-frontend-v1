import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "https://online-merchant-ordering-system-bac.vercel.app"
    : "";

let socket: Socket | null = null;

export interface OrderCreatedPayload {
  order_id: string;
  order_number: string;
  status: string;
  total_price: number;
  branch_id: string | number;
  table_id: string | number | null;
  branch_name?: string | null;
  table_number?: string | null;
}

export interface TableServiceCreatedPayload {
  id: string;
  table_id: string;
  branch_id: string | number;
  type: string;
  status: string;
  created_at: string;
}

/**
 * عميل Socket.io للاتصال بالباكند.
 * الـ path الافتراضي /socket.io (مطابق للـ Server).
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  if (!SOCKET_URL) return null;
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: false,
    });
  }
  return socket;
}

/** انضم لغرفة فرع معيّن (الباكند: socket.join(`branch:${branchId}`)). */
export function joinBranchRoom(branchId: string): void {
  const s = getSocket();
  if (s) s.emit("join:branch", branchId);
}
