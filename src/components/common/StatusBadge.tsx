import React from "react";

const TONES: Record<string, string> = {
  success: "bg-emerald-950 text-emerald-300 border-emerald-500/40",
  warning: "bg-amber-950 text-amber-300 border-amber-500/40",
  danger: "bg-rose-950 text-rose-300 border-rose-500/40",
  neutral: "bg-slate-900 text-slate-400 border-slate-700/60",
};

export type StatusTone = keyof typeof TONES;

export function toneForStatus(status: string | undefined): StatusTone {
  const s = (status || "").toUpperCase();
  if (s === "PURCHASED" || s === "PUBLISHED" || s === "FEATURED")
    return "success";
  if (s === "LOCKED" || s === "DRAFT") return "warning";
  if (s === "CANCELLED") return "danger";
  return "neutral";
}

interface StatusBadgeProps {
  status: string;
  tone?: StatusTone;
  icon?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  tone,
  icon,
}) => (
  <span
    className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase inline-flex items-center gap-1.5 border ${TONES[tone || toneForStatus(status)]}`}
  >
    {icon}
    {status}
  </span>
);
