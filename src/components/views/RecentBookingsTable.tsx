import React from "react";
import { motion } from "motion/react";
import { StatusBadge } from "../common/StatusBadge";
import type { Booking } from "../../types/database";

const rowContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const rowItem = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export const RecentBookingsTable: React.FC<{ bookings: Booking[] }> = ({
  bookings,
}) => {
  if (bookings.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center"
      >
        No active lease locks recorded yet.
      </motion.p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <caption className="sr-only">Recent lease transactions</caption>
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-mono uppercase tracking-wider">
            <th scope="col" className="pb-3 px-2">
              Booking ID
            </th>
            <th scope="col" className="pb-3 px-2">
              Property
            </th>
            <th scope="col" className="pb-3 px-2">
              Location
            </th>
            <th scope="col" className="pb-3 px-2">
              Monthly Rent
            </th>
            <th scope="col" className="pb-3 px-2">
              Status
            </th>
          </tr>
        </thead>
        <motion.tbody
          variants={rowContainer}
          initial="hidden"
          animate="visible"
          className="divide-y divide-slate-100 dark:divide-white/5"
        >
          {bookings.map((b) => (
            <motion.tr
              key={b.id}
              variants={rowItem}
              className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <td className="py-3 px-2 font-mono text-[#E04F33] dark:text-[#FF8A73]">
                #{b.id}
              </td>
              <td className="py-3 px-2 font-bold text-slate-900 dark:text-slate-100">
                {b.property?.title}
              </td>
              <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                {b.property?.city
                  ? `${b.property.city}, ${b.property.state}`
                  : ""}
              </td>
              <td className="py-3 px-2 font-semibold text-emerald-600 dark:text-emerald-400">
                {b.property?.price
                  ? `$${b.property.price.toLocaleString()}/mo`
                  : ""}
              </td>
              <td className="py-3 px-2">
                <StatusBadge status={b.state} />
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
};
