import type { ReactNode } from "react";
import { Search } from "lucide-react";

type PageToolbarProps = {
  children?: ReactNode;
};

export function PageToolbar({ children }: PageToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function PageToolbarSearch({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
}: SearchFieldProps) {
  return (
    <div className={`relative max-w-md flex-1 ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base w-full pl-9"
        autoComplete="off"
      />
    </div>
  );
}
