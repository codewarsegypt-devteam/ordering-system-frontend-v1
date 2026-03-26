import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { defaultLocale, getLocaleDirection, isValidLocale } from "@/lib/i18n";
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
    default: "Qrixa - Smart Restaurant Ordering",
    template: "%s | Qrixa",
  },
  description:
    "Manage your restaurant menu, orders, branches and team from one dashboard. QR-based ordering for customers.",
  keywords: ["restaurant", "ordering", "menu", "QR code", "dashboard", "POS"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Qrixa - Smart Restaurant Ordering",
    description:
      "Manage your restaurant menu, orders, branches and team from one dashboard.",
    type: "website",
    siteName: "Qrixa",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const safeLocale = isValidLocale(locale) ? locale : defaultLocale;
  const direction = getLocaleDirection(safeLocale);

  return (
    <html lang={safeLocale} dir={direction}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={safeLocale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
