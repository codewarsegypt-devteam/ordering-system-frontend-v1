"use client";

import { Suspense } from "react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { CartProvider, ThemeProvider, CurrencyProvider } from "@/contexts";
import { Cormorant_Garamond } from "next/font/google";
import { AuthProvider } from "@/contexts";
import { MenuPageSkeleton } from "@/components/menu/MenuPageSkeleton";

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-luxury",
  display: "swap",
});

function MenuSuspenseFallback() {
  return <MenuPageSkeleton />;
}

export default function MenuSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cormorant.variable}>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider>
            <CurrencyProvider>
              <CartProvider>
                <Suspense fallback={<MenuSuspenseFallback />}>
                  {children}
                </Suspense>
              </CartProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </div>
  );
}
