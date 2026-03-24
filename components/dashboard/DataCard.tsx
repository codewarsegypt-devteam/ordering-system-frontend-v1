import type { ReactNode } from "react";

type DataCardProps = {
  children: ReactNode;
  className?: string;
  padding?: boolean;
};

/**
 * White elevated panel for tables and lists (aligned with admin template cards).
 */
export function DataCard({
  children,
  className = "",
  padding = false,
}: DataCardProps) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm ${padding ? "p-5 sm:p-6" : ""} ${className}`}
      style={{ borderColor: "var(--dashboard-border)" }}
    >
      {children}
    </div>
  );
}
