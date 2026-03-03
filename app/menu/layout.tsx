"use client";

import { Suspense } from "react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { CartProvider, ThemeProvider } from "@/contexts";
import { Cormorant_Garamond } from "next/font/google";
import { AuthProvider } from "@/contexts";

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-luxury",
  display: "swap",
});

function MenuLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f0ed]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#e85d04] border-t-transparent" />
    </div>
  );
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
            <CartProvider>
              <Suspense fallback={<MenuLoading />}>{children}</Suspense>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </div>
  );
}
