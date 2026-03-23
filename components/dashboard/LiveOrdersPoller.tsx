"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts";
import { useLiveOrders } from "@/contexts/LiveOrdersContext";
import { useLiveOrdersPolling } from "@/hooks/useLiveOrdersPolling";
import { fetchOrders } from "@/lib/api/orders";
import type { Order } from "@/lib/types";

export function LiveOrdersPoller() {
  const { user } = useAuth();
  const {
    livePollingEnabled,
    setLivePollingEnabled,
    setNewOrderToast,
    setAutoPaused,
    setIsPolling,
    playNewOrderSound,
    ordersFilters,
  } = useLiveOrders();

  const isOwner = user?.role === "owner";
  const activeBranchId =
    !isOwner && user?.branch_id != null
      ? String(user.branch_id)
      : ordersFilters.branch_id || undefined;

  const { data, isPlaceholderData } = useQuery({
    queryKey: ["orders", user?.merchant_id, user?.branch_id, ordersFilters],
    queryFn: () =>
      fetchOrders({
        branch_id: activeBranchId,
        status:
          ordersFilters.status.length > 0
            ? ordersFilters.status.join(",")
            : undefined,
        from: ordersFilters.from || undefined,
        to: ordersFilters.to || undefined,
        q: ordersFilters.q || undefined,
        page: ordersFilters.page,
        limit: ordersFilters.limit,
        table_id: ordersFilters.table_id || undefined,
        table_number: ordersFilters.table_number || undefined,
        min_total: ordersFilters.min_total || undefined,
        max_total: ordersFilters.max_total || undefined,
        sort_by: ordersFilters.sort_by,
        sort_dir: ordersFilters.sort_dir,
      }),
    enabled: !!user?.merchant_id && livePollingEnabled,
    placeholderData: (previousData) => previousData,
  });

  const statusFilterSet = useMemo(
    () =>
      ordersFilters.status.length > 0 ? new Set(ordersFilters.status) : null,
    [ordersFilters.status]
  );

  const { isPolling, autoPaused } = useLiveOrdersPolling({
    queryKey: ["orders", user?.merchant_id, user?.branch_id, ordersFilters],
    initialData: isPlaceholderData ? undefined : data,
    branchId: activeBranchId,
    enabled: livePollingEnabled && !!user?.merchant_id,
    intervalMs: 5000,
    noUpdatesPauseMs: 3 * 60 * 1000,
    onAutoPause: () => setLivePollingEnabled(false),
    onNewOrders: (orders: Order[]) => {
      if (!orders.length) return;
      playNewOrderSound();
      const toShow =
        orders.find((o) => o.status === "placed") ?? orders[0];
      setNewOrderToast({ order_number: toShow.order_number });
      setTimeout(() => setNewOrderToast(null), 4000);
    },
    filterFn: (order) => {
      if (
        activeBranchId &&
        String(order.branch_id) !== activeBranchId
      )
        return false;
      if (
        statusFilterSet &&
        !statusFilterSet.has(order.status)
      )
        return false;
      return true;
    },
  });

  useEffect(() => {
    setIsPolling(isPolling);
  }, [isPolling, setIsPolling]);

  useEffect(() => {
    setAutoPaused(autoPaused);
  }, [autoPaused, setAutoPaused]);

  return null;
}
