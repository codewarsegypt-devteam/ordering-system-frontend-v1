"use client";

import React, { createContext, useContext, useMemo } from "react";

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  accent: string;
}

const defaultTheme: ThemeColors = {
  primary: "#0f766e",
  primaryForeground: "#ffffff",
  secondary: "#0d9488",
  accent: "#14b8a6",
};

const ThemeContext = createContext<ThemeColors>(defaultTheme);

export function ThemeProvider({
  children,
  primary,
  secondary,
}: {
  children: React.ReactNode;
  primary?: string | null;
  secondary?: string | null;
}) {
  const theme = useMemo<ThemeColors>(() => {
    const p = primary || defaultTheme.primary;
    const s = secondary || defaultTheme.secondary;
    return {
      primary: p,
      primaryForeground: "#ffffff",
      secondary: s,
      accent: s,
    };
  }, [primary, secondary]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
