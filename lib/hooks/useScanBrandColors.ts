"use client";

import * as React from "react";
import type { PublicScanResponse } from "@/lib/api/public";

const STORAGE_PREFIX = "menu_scan_brand_colors:";

const FALLBACK_PRIMARY = "#f97316";
const FALLBACK_SECONDARY = "#ea580c";

function storageKey(token: string) {
  return `${STORAGE_PREFIX}${token}`;
}

export function readScanBrandColors(token: string): {
  hexa_color_1: string | null;
  hexa_color_2: string | null;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(token));
    if (!raw) return null;
    const p = JSON.parse(raw) as {
      hexa_color_1?: string | null;
      hexa_color_2?: string | null;
    };
    return {
      hexa_color_1: p.hexa_color_1 ?? null,
      hexa_color_2: p.hexa_color_2 ?? null,
    };
  } catch {
    return null;
  }
}

function persistScanBrandColors(
  token: string,
  hexa1: string | null | undefined,
  hexa2: string | null | undefined,
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      storageKey(token),
      JSON.stringify({
        hexa_color_1: hexa1 ?? null,
        hexa_color_2: hexa2 ?? null,
      }),
    );
  } catch {
    // quota / private mode
  }
}

type ScanColorsInput = Pick<
  PublicScanResponse,
  "hexa_color_1" | "hexa_color_2"
> | null;

/**
 * Brand colors from scan API, persisted to localStorage on first successful scan
 * so the same token can reuse colors before the network responds.
 */
export function useScanBrandColors(
  token: string | undefined,
  scanData: ScanColorsInput | undefined,
) {
  const [cached, setCached] = React.useState<{
    hexa_color_1: string | null;
    hexa_color_2: string | null;
  } | null>(null);

  React.useLayoutEffect(() => {
    if (!token) {
      setCached(null);
      return;
    }
    setCached(readScanBrandColors(token));
  }, [token]);

  React.useEffect(() => {
    if (!token || !scanData) return;
    persistScanBrandColors(token, scanData.hexa_color_1, scanData.hexa_color_2);
    setCached(readScanBrandColors(token));
  }, [token, scanData]);

  const c1 = scanData?.hexa_color_1 ?? cached?.hexa_color_1 ?? null;
  const c2 = scanData?.hexa_color_2 ?? cached?.hexa_color_2 ?? null;
  const primary = c1 || FALLBACK_PRIMARY;
  const secondary = c2 || c1 || FALLBACK_SECONDARY;

  return { primary, secondary };
}
