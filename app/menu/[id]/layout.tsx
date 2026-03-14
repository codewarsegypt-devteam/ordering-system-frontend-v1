import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse our menu and place your order",
};

export default function MenuItemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
