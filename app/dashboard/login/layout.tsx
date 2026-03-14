import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Dashboard",
  description: "Sign in to your Tably merchant dashboard",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
