import React from "react";
import { motion } from "motion/react";
import { StatusBadge } from "../common/StatusBadge";
import type { Booking } from "../../types/database";

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
          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono uppercase tracking-wider">
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
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {bookings.map((b) => (
            <tr
              key={b.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="py-3.5 px-2 font-mono text-blue-600 dark:text-blue-400 font-bold">
                #{b.id}
              </td>
              <td className="py-3.5 px-2 font-bold text-slate-900 dark:text-slate-100">
                {b.property?.title}
              </td>
              <td className="py-3.5 px-2 text-slate-600 dark:text-slate-400 font-medium">
                {b.property?.city
                  ? `${b.property.city}, ${b.property.state}`
                  : ""}
              </td>
              <td className="py-3.5 px-2 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {b.property?.price
                  ? `$${b.property.price.toLocaleString()}/mo`
                  : ""}
              </td>
              <td className="py-3.5 px-2">
                <StatusBadge status={b.state} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
