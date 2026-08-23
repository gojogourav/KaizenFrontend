import React from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Timer,
} from "lucide-react";
import type { BookingRecord } from "../../api/services";

const STATE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; classes: string; dotClass: string }
> = {
  locked: {
    label: "Hold Active",
    icon: <Timer className="w-3.5 h-3.5" />,
    classes: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    dotClass: "bg-amber-400 animate-pulse",
  },
  pending_review: {
    label: "Pending Review",
    icon: <Clock className="w-3.5 h-3.5" />,
    classes: "bg-blue-500/10 text-blue-300 border-blue-500/25",
    dotClass: "bg-blue-400 animate-pulse",
  },
  purchased: {
    label: "Purchased",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    classes: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    dotClass: "bg-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="w-3.5 h-3.5" />,
    classes: "bg-rose-500/10 text-rose-300 border-rose-500/25",
    dotClass: "bg-rose-400",
  },
  expired: {
    label: "Expired",
    icon: <XCircle className="w-3.5 h-3.5" />,
    classes: "bg-slate-500/10 text-slate-400 border-slate-500/25",
    dotClass: "bg-slate-500",
  },
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";

export const BookingListItem: React.FC<{ booking: BookingRecord }> = ({
  booking,
}) => {
  const {
    id,
    property_title,
    state,
    created_at,
    check_in,
    check_out,
    expires_at,
  } = booking;

  const cfg = STATE_CONFIG[state] ?? STATE_CONFIG.expired;

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const expiresLabel = expires_at
    ? new Date(expires_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative bg-[#14151A] rounded-[1.5rem] border border-white/5 hover:border-white/12 shadow-xl shadow-black/50 overflow-hidden flex flex-col cursor-default apple-specular h-full"
    >
      {/* Inner ring overlay */}
      <div className="absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-white/5 pointer-events-none z-20 group-hover:ring-white/10 transition-all duration-300" />

      {/* Image / Hero */}
      <div className="relative h-52 w-full overflow-hidden bg-[#0B0C10] shrink-0">
        <img
          src={FALLBACK_IMAGE}
          alt={property_title || "Booked Property"}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-[0.75] group-hover:brightness-90"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14151A] via-[#14151A]/40 to-transparent" />

        {/* Top overlays */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 gap-2">
          <div className="px-3 py-1.5 bg-[#0B0C10]/80 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-widest text-slate-100 border border-white/10 flex items-center gap-1.5 shadow-lg font-mono uppercase">
            <MapPin className="w-3 h-3 text-[#E04F33] shrink-0" />
            <span className="truncate">Booking #{id}</span>
          </div>

          {/* Status badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-widest border backdrop-blur-md shadow-lg ${cfg.classes}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
            {cfg.label}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="absolute bottom-3.5 left-3.5 z-10">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0B0C10]/80 backdrop-blur-md border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400 font-mono shadow-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="uppercase tracking-widest">Verified</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Title */}
          <h3 className="font-serif font-bold text-lg leading-tight text-white group-hover:text-[#FF8A73] transition-colors duration-200 truncate mb-2">
            {property_title || "Property"}
          </h3>

          {/* Date range */}
          {(check_in || check_out) && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mb-1">
              <Calendar className="w-3 h-3 text-[#E04F33]" />
              <span>
                {check_in
                  ? new Date(check_in).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
                {" → "}
                {check_out
                  ? new Date(check_out).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          )}
        </div>

        {/* Footer row */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col gap-0.5 text-[10px] font-mono text-slate-500">
            {formattedDate && <span>Booked: {formattedDate}</span>}
            {state === "locked" && expiresLabel && (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="text-amber-400 font-bold"
              >
                Expires: {expiresLabel}
              </motion.span>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold font-mono tracking-widest uppercase text-[#E04F33] group-hover:text-[#FF8A73] transition-colors shrink-0">
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </motion.article>
  );
};
