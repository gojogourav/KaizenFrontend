import React, { useEffect, useRef } from "react";
import { Search, X, Loader2, type LucideIcon } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Card shell — the one glass-panel treatment every section reuses.
──────────────────────────────────────────────────────────────── */
export const Panel: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/40 ${className}`}
  >
    {children}
  </div>
);

/* ────────────────────────────────────────────────────────────────
   Buttons
──────────────────────────────────────────────────────────────── */
type ButtonVariant = "primary" | "ghost" | "danger" | "subtle";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[#E04F33] hover:bg-[#ED5B3F] text-white shadow-lg shadow-[#E04F33]/25 border border-white/20",
  ghost:
    "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10",
  subtle:
    "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white border border-transparent",
  danger:
    "bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30",
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    icon?: LucideIcon;
    loading?: boolean;
  }
> = ({ variant = "primary", icon: Icon, loading, disabled, className = "", children, ...rest }) => (
  <button
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${BUTTON_VARIANTS[variant]} ${className}`}
    {...rest}
  >
    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : Icon ? <Icon className="w-3.5 h-3.5" /> : null}
    {children}
  </button>
);

export const IconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
> = ({ variant = "ghost", className = "", children, ...rest }) => (
  <button
    className={`p-2 rounded-xl transition-all active:scale-[0.94] ${BUTTON_VARIANTS[variant]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

/* ────────────────────────────────────────────────────────────────
   Status pill — dot + label, consistent everywhere a state shows up
──────────────────────────────────────────────────────────────── */
type PillTone = "neutral" | "success" | "warning" | "danger" | "info" | "brand";

const PILL_TONES: Record<PillTone, string> = {
  neutral: "bg-slate-700/40 text-slate-300 border-slate-600/40",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  danger: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  info: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  brand: "bg-[#E04F33]/15 text-[#FF8A73] border-[#E04F33]/30",
};

const PILL_DOTS: Record<PillTone, string> = {
  neutral: "bg-slate-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-rose-400",
  info: "bg-sky-400",
  brand: "bg-[#FF8A73]",
};

export const StatusPill: React.FC<{
  tone: PillTone;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}> = ({ tone, icon: Icon, children, className = "", pulse }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wide whitespace-nowrap ${PILL_TONES[tone]} ${className}`}
  >
    {Icon ? (
      <Icon className="w-3 h-3 shrink-0" />
    ) : (
      <span className="relative flex w-1.5 h-1.5 shrink-0">
        {pulse && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${PILL_DOTS[tone]} opacity-60 animate-ping`} />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${PILL_DOTS[tone]}`} />
      </span>
    )}
    {children}
  </span>
);

/* ────────────────────────────────────────────────────────────────
   Empty state
──────────────────────────────────────────────────────────────── */
export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, hint, action }) => (
  <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4 text-slate-500 text-center px-4">
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
      <Icon className="w-7 h-7 text-slate-600" />
    </div>
    <div>
      <p className="text-sm font-mono text-slate-300">{title}</p>
      {hint && <p className="text-xs mt-1 text-slate-500 max-w-xs">{hint}</p>}
    </div>
    {action}
  </div>
);

/* ────────────────────────────────────────────────────────────────
   Skeleton rows — shaped like the real row so loading doesn't jump
──────────────────────────────────────────────────────────────── */
export const SkeletonRows: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-2" aria-busy="true" aria-label="Loading">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/8">
        <div className="w-12 h-12 rounded-xl bg-white/8 animate-pulse shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3 w-1/3 rounded bg-white/8 animate-pulse" />
          <div className="h-2.5 w-2/3 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="h-5 w-16 rounded-full bg-white/8 animate-pulse shrink-0" />
      </div>
    ))}
  </div>
);

/* ────────────────────────────────────────────────────────────────
   Search input — debounced-friendly controlled input w/ clear button
──────────────────────────────────────────────────────────────── */
export const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className = "" }) => (
  <div className={`relative ${className}`}>
    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-9 py-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#E04F33]/60 focus:ring-2 focus:ring-[#E04F33]/10 transition-all font-mono"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </div>
);

/* ────────────────────────────────────────────────────────────────
   Avatar — image with graceful initials fallback (deterministic hue)
──────────────────────────────────────────────────────────────── */
function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

export const Avatar: React.FC<{
  src?: string;
  name: string;
  size?: "sm" | "md";
  rounded?: "xl" | "full";
}> = ({ src, name, size = "md", rounded = "xl" }) => {
  const dim = size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const radius = rounded === "full" ? "rounded-full" : "rounded-xl";
  const hue = hashHue(name || "?");
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} ${radius} object-cover shrink-0 border border-white/10`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div
      className={`${dim} ${radius} shrink-0 border border-white/10 flex items-center justify-center font-bold text-xs`}
      style={{
        background: `hsla(${hue}, 55%, 45%, 0.18)`,
        color: `hsl(${hue}, 70%, 75%)`,
      }}
    >
      {(name || "?").trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   Modal shell — Escape to close, click-outside to close, locks scroll
──────────────────────────────────────────────────────────────── */
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ open, onClose, title, eyebrow, children, maxWidth = "max-w-2xl" }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fade-in_0.15s_ease-out]"
      onMouseDown={(e) => {
        if (cardRef.current && !cardRef.current.contains(e.target as Node)) onClose();
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-[#121319] border border-white/15 rounded-3xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 animate-[modal-in_0.2s_cubic-bezier(0.16,1,0.3,1)]`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 px-6 sm:px-8 py-5 bg-[#121319]/95 backdrop-blur-xl">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FF8A73] font-mono mb-0.5">
                {eyebrow}
              </p>
            )}
            <h3 className="text-lg sm:text-xl font-bold text-white font-heading truncate">{title}</h3>
          </div>
          <IconButton onClick={onClose} aria-label="Close dialog">
            <X className="w-4.5 h-4.5" />
          </IconButton>
        </div>
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   Field wrapper — label + input/textarea/select styling in one spot
──────────────────────────────────────────────────────────────── */
export const fieldInputCls = (hasError?: boolean) =>
  `w-full px-4 py-2.5 bg-black/40 border rounded-xl text-white text-xs focus:outline-none focus:ring-2 transition-colors font-mono placeholder:text-slate-600 ${
    hasError
      ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/10"
      : "border-white/10 focus:border-[#E04F33] focus:ring-[#E04F33]/10"
  }`;

export const Field: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, required, error, hint, children }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#FF8A73]">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {hint && <span className="text-[10px] text-slate-500 font-mono">{hint}</span>}
    </div>
    {children}
    {error && <p className="text-[10px] text-rose-400 mt-1.5 font-mono">{error}</p>}
  </div>
);
