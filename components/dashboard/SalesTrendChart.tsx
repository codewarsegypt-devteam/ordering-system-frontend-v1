"use client";

import { useId } from "react";

type Point = { total_sales: number };

export function SalesTrendChart({ series }: { series: Point[] }) {
  const raw = useId();
  const gradId = `sales-fill-${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const w = 100;
  const h = 52;
  const pad = { t: 6, r: 2, b: 2, l: 2 };
  const values = series.map((p) => p.total_sales);
  const max = Math.max(...values, 1);
  const innerH = h - pad.t - pad.b;
  const innerW = w - pad.l - pad.r;
  const n = values.length;

  if (n === 0) return null;

  const coords = values.map((v, i) => {
    const x =
      pad.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = pad.t + innerH - (v / max) * innerH;
    return [x, y] as const;
  });

  const lineD = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const bottom = h - pad.b;
  const areaD = `M ${coords[0][0]} ${bottom} ${coords
    .map(([x, y]) => `L ${x} ${y}`)
    .join(" ")} L ${coords[coords.length - 1][0]} ${bottom} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-36 w-full max-h-[200px] text-emerald-600"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={lineD}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
