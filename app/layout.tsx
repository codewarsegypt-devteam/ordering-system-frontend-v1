import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tably - Smart Restaurant Ordering",
    template: "%s | Tably",
  },
  description:
    "Manage your restaurant menu, orders, branches and team from one dashboard. QR-based ordering for customers.",
  keywords: ["restaurant", "ordering", "menu", "QR code", "dashboard", "POS"],
  openGraph: {
    title: "Tably - Smart Restaurant Ordering",
    description:
      "Manage your restaurant menu, orders, branches and team from one dashboard.",
    type: "website",
    siteName: "Tably",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
