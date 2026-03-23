"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import type { OrdersFilterState } from "@/lib/orders-filters";
import { getDefaultOrdersFilters } from "@/lib/orders-filters";

const NEW_ORDER_SOUND_PATH = "/mixkit-correct-answer-tone-2870.wav";

interface NewOrderToast {
  order_number: string;
}

interface LiveOrdersState {
  livePollingEnabled: boolean;
  newOrderToast: NewOrderToast | null;
  ordersFilters: OrdersFilterState;
  autoPaused: boolean;
  isPolling: boolean;
}

interface LiveOrdersContextValue extends LiveOrdersState {
  setLivePollingEnabled: (value: boolean | ((prev: boolean) => boolean)) => void;
  setNewOrderToast: React.Dispatch<React.SetStateAction<NewOrderToast | null>>;
  setOrdersFilters: React.Dispatch<React.SetStateAction<OrdersFilterState>>;
  setAutoPaused: (value: boolean) => void;
  setIsPolling: (value: boolean) => void;
  playNewOrderSound: () => void;
}

const LiveOrdersContext = createContext<LiveOrdersContextValue | null>(null);

export function LiveOrdersProvider({ children }: { children: React.ReactNode }) {
  const [livePollingEnabled, setLivePollingEnabled] = useState(true);
  const [newOrderToast, setNewOrderToast] = useState<NewOrderToast | null>(null);
  const [ordersFilters, setOrdersFilters] = useState<OrdersFilterState>(
    getDefaultOrdersFilters
  );
  const [autoPaused, setAutoPaused] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  const playNewOrderSound = useCallback(() => {
    try {
      if (!soundRef.current) {
        soundRef.current = new Audio(NEW_ORDER_SOUND_PATH);
      }
      soundRef.current.currentTime = 0;
      void soundRef.current.play();
    } catch {
      // ignore
    }
  }, []);

  const value: LiveOrdersContextValue = {
    livePollingEnabled,
    newOrderToast,
    ordersFilters,
    autoPaused,
    isPolling,
    setLivePollingEnabled,
    setNewOrderToast,
    setOrdersFilters,
    setAutoPaused,
    setIsPolling,
    playNewOrderSound,
  };

  return (
    <LiveOrdersContext.Provider value={value}>
      {children}
    </LiveOrdersContext.Provider>
  );
}

export function useLiveOrders() {
  const ctx = useContext(LiveOrdersContext);
  if (!ctx) {
    throw new Error("useLiveOrders must be used within LiveOrdersProvider");
  }
  return ctx;
}

export function useLiveOrdersOptional() {
  return useContext(LiveOrdersContext);
}
