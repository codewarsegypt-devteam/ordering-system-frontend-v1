import type { ReactNode } from "react";

type DashboardEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DashboardEmptyState({
  icon,
  title,
  description,
  action,
}: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border"
        style={{
          borderColor: "var(--dashboard-border)",
          backgroundColor: "var(--dashboard-canvas)",
        }}
      >
        {icon}
      </div>
      <p className="font-semibold text-slate-800">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
