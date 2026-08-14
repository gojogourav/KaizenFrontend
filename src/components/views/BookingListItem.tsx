import React from "react";
import { motion } from "motion/react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { StatusBadge } from "../common/StatusBadge";
import type { Booking } from "../../types/database";

const STATUS_ICON: Record<string, React.ReactNode> = {
  PURCHASED: <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />,
  LOCKED: <Clock className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />,
  CANCELLED: <XCircle className="w-3.5 h-3.5" aria-hidden="true" />,
};

export const BookingListItem: React.FC<{ booking: Booking }> = ({
  booking,
}) => {
  const { property, state, id, created_at } = booking;
  const location = property?.city ? `${property.city}, ${property.state}` : "";
  const monthlyRent = property?.price
    ? `$${property.price.toLocaleString()}/mo`
    : "";

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold font-mono text-[#E04F33] dark:text-[#FF8A73] bg-[#E04F33]/10 dark:bg-white/10 px-3 py-1 rounded-full border border-[#E04F33]/20 dark:border-white/15">
            #{id}
          </span>
          <StatusBadge status={state} icon={STATUS_ICON[state]} />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          {property?.title || "Property"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {location} {monthlyRent ? `• Rent: ${monthlyRent}` : ""}
        </p>
      </div>
      <div className="text-right space-y-1 text-xs font-mono">
        {created_at && (
          <p className="text-slate-500 dark:text-slate-400">
            Date:{" "}
            <span className="text-slate-800 dark:text-slate-200">
              {new Date(created_at).toLocaleDateString()}
            </span>
          </p>
        )}
        {state === "LOCKED" && (
          <motion.p
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-amber-600 dark:text-amber-300 font-bold"
          >
            Hold session active
          </motion.p>
        )}
      </div>
    </motion.article>
  );
};
