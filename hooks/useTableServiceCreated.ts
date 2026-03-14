"use client";

import { useEffect, useRef } from "react";
import { getSocket, joinBranchRoom, type TableServiceCreatedPayload } from "@/lib/socket";

const EVENT = "table_service:created";

export interface UseTableServiceCreatedOptions {
  branchId?: string | null;
}

/**
 * استمع لحدث table_service:created من الباكند (طلب ويتر / طلب فاتورة).
 */
export function useTableServiceCreated(
  onCreated: (data: TableServiceCreatedPayload) => void,
  options: UseTableServiceCreatedOptions = {},
) {
  const { branchId } = options;
  const callbackRef = useRef(onCreated);
  callbackRef.current = onCreated;

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (branchId) {
      joinBranchRoom(String(branchId));
    }

    const handler = (data: TableServiceCreatedPayload) => {
      callbackRef.current(data);
    };

    socket.on(EVENT, handler);
    return () => {
      socket.off(EVENT, handler);
    };
  }, [branchId]);
}
