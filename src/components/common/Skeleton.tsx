import React from "react";

interface SkeletonListProps {
  rows?: number;
  rowHeightClass?: string;
  label?: string;
}

/** Animated placeholder rows for loading table/list content. */
export const SkeletonList: React.FC<SkeletonListProps> = ({
  rows = 3,
  rowHeightClass = "h-16",
  label = "Loading content",
}) => (
  <div
    role="status"
    aria-live="polite"
    aria-label={label}
    className="space-y-3 animate-pulse"
  >
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className={`${rowHeightClass} bg-white/5 rounded-2xl border border-white/5`}
      />
    ))}
    <span className="sr-only">{label}…</span>
  </div>
);

interface SkeletonGridProps {
  items?: number;
  itemHeightClass?: string;
  label?: string;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  items = 4,
  itemHeightClass = "h-64",
  label = "Loading content",
}) => (
  <div
    role="status"
    aria-live="polite"
    aria-label={label}
    className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse"
  >
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={i}
        className={`${itemHeightClass} bg-white/5 rounded-2xl border border-white/5`}
      />
    ))}
    <span className="sr-only">{label}…</span>
  </div>
);
