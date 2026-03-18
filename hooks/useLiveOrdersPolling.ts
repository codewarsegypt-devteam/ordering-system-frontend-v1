"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Order, OrdersListResponse } from "@/lib/types";
import { fetchOrderUpdates } from "@/lib/api/orders";
import { mergeOrdersById, getOrderTimestamp } from "@/lib/utils/orders.utils";

const NO_UPDATES_PAUSE_MS = 3 * 60 * 1000; // 3 minutes

interface UseLiveOrdersPollingOptions {
  queryKey: unknown[];
  initialData?: OrdersListResponse;
  branchId?: string;
  enabled?: boolean;
  intervalMs?: number;
  noUpdatesPauseMs?: number;
  onAutoPause?: () => void;
  onNewOrders?: (orders: Order[]) => void;
  filterFn?: (order: Order) => boolean;
}

interface UseLiveOrdersPollingResult {
  isPolling: boolean;
  autoPaused: boolean;
  lastCursor: string | null;
  error: string | null;
  refreshNow: () => void;
}

export function useLiveOrdersPolling(
  options: UseLiveOrdersPollingOptions
): UseLiveOrdersPollingResult {
  const {
    queryKey,
    initialData,
    branchId,
    enabled = true,
    intervalMs = 3000,
    noUpdatesPauseMs = NO_UPDATES_PAUSE_MS,
    onAutoPause,
    onNewOrders,
    filterFn,
  } = options;

  const queryClient = useQueryClient();

  const [lastCursor, setLastCursor] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlightRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUpdateAtRef = useRef<number>(Date.now());

  // Derive initial cursor from initialData (only once).
  useEffect(() => {
    if (!initialData || lastCursor) return;
    if (!initialData.data.length) return;
    const latest = initialData.data.reduce((latestSoFar, order) => {
      const ts = getOrderTimestamp(order);
      if (!latestSoFar) return ts;
      return new Date(ts).getTime() > new Date(latestSoFar).getTime()
        ? ts
        : latestSoFar;
    }, "" as string);
    if (latest) {
      setLastCursor(latest);
    }
  }, [initialData, lastCursor]);

  const poll = useCallback(async () => {
    if (!enabled || !lastCursor) return;
    if (inFlightRef.current) return;
    if (
      typeof document !== "undefined" &&
      document.visibilityState !== "visible"
    ) {
      return;
    }

    inFlightRef.current = true;
    setIsPolling(true);
    try {
      const res = await fetchOrderUpdates({
        after: lastCursor,
        branch_id: branchId,
        limit: 100,
      });

      const incoming = filterFn ? res.items.filter(filterFn) : res.items;

      if (incoming.length) {
        lastUpdateAtRef.current = Date.now();
        onNewOrders?.(incoming);
        queryClient.setQueryData<OrdersListResponse | undefined>(
          queryKey,
          (old) => {
            if (!old) {
              return {
                data: incoming,
                pagination: undefined,
                next_cursor: null,
              };
            }
            return {
              ...old,
              data: mergeOrdersById(old.data, incoming),
            };
          }
        );
      } else {
        if (Date.now() - lastUpdateAtRef.current >= noUpdatesPauseMs) {
          setAutoPaused(true);
          onAutoPause?.();
        }
      }

      let nextCursor = res.server_time || lastCursor;
      if (!res.server_time && incoming.length) {
        const latestIncoming = incoming.reduce((latestSoFar, order) => {
          const ts = getOrderTimestamp(order);
          if (!latestSoFar) return ts;
          return new Date(ts).getTime() > new Date(latestSoFar).getTime()
            ? ts
            : latestSoFar;
        }, "" as string);
        if (latestIncoming) {
          nextCursor = latestIncoming;
        }
      }
      setLastCursor(nextCursor);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to poll orders");
    } finally {
      inFlightRef.current = false;
      setIsPolling(false);
    }
  }, [enabled, lastCursor, branchId, filterFn, queryClient, queryKey, noUpdatesPauseMs, onAutoPause, onNewOrders]);

  // Visibility-based resume.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = () => {
      if (document.visibilityState === "visible" && enabled && lastCursor) {
        void poll();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [enabled, lastCursor, poll]);

  // Polling loop with setTimeout to avoid overlaps.
  useEffect(() => {
    if (!enabled || !lastCursor) return;

    setAutoPaused(false);
    lastUpdateAtRef.current = Date.now();
    let cancelled = false;

    const loop = async () => {
      if (cancelled) return;
      await poll();
      if (cancelled) return;
      timerRef.current = setTimeout(loop, intervalMs);
    };

    timerRef.current = setTimeout(loop, intervalMs);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, lastCursor, intervalMs, poll]);

  const refreshNow = useCallback(() => {
    if (!enabled || !lastCursor) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    void poll();
  }, [enabled, lastCursor, poll]);

  return {
    isPolling,
    autoPaused,
    lastCursor,
    error,
    refreshNow,
  };
}

