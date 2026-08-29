import React from "react";
import { motion } from "motion/react";
import { TrendingUp, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../hooks/useDashboard";
import { SkeletonList } from "../common/Skeleton";
import { ErrorBoundary } from "../common/ErrorBoundary";
import { RecentBookingsTable } from "./RecentBookingsTable";
import { useTheme } from "../../context/ThemeContext";

const DashboardContent: React.FC = () => {
  const { dashboard, loading, error } = useDashboard();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (loading)
    return (
      <SkeletonList
        label="Loading your dashboard"
        rows={3}
        rowHeightClass="h-12"
      />
    );

  if (error)
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        role="alert"
        className="text-sm text-rose-500 text-center py-12 font-medium"
      >
        {error}
      </motion.p>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={`rounded-3xl border p-6 shadow-xl space-y-4 transition-colors ${
        isDark
          ? "bg-slate-900/80 border-slate-800 shadow-slate-950/40"
          : "bg-white border-slate-200 shadow-slate-200/50"
      }`}
    >
      <h3
        className={`text-lg font-bold flex items-center gap-2 font-heading ${
          isDark ? "text-white" : "text-slate-900"
        }`}
      >
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.2 }}
        >
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </motion.span>
        Recent Lease Transactions
      </h3>
      <RecentBookingsTable bookings={dashboard?.recent_bookings || []} />
    </motion.div>
  );
};

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const displayName =
    user?.name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.username;

  return (
    <div className="max-w-6xl mx-auto p-2 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`rounded-3xl p-8 border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors ${
          isDark
            ? "bg-slate-900/80 border-slate-800 shadow-slate-950/40"
            : "bg-white border-slate-200 shadow-slate-200/50"
        }`}
      >
        <div className="flex items-center gap-5">
          {user?.avatarUrl ? (
            <motion.img
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              src={user.avatarUrl}
              alt=""
              className="w-16 h-16 rounded-2xl border-2 border-blue-500/40 shadow-lg object-cover"
            />
          ) : (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-blue-600/15 border-2 border-blue-500/40 flex items-center justify-center text-2xl font-black text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            >
              {displayName?.[0] || "K"}
            </motion.div>
          )}
          <div>
            <h1 className={`text-2xl md:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              Welcome back,{" "}
              <span className="text-blue-600 dark:text-blue-400">{displayName}</span>
            </h1>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold mt-1">
              Buyer Account • {user?.company || "Turnkey Member"} •{" "}
              {user?.email}
            </p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="inline-flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20 text-xs font-mono font-bold text-blue-600 dark:text-blue-400"
        >
          <ShieldCheck
            className="w-4 h-4 text-emerald-500"
            aria-hidden="true"
          />
          <span>Verified Platform Member</span>
        </motion.div>
      </motion.div>
      <ErrorBoundary fallbackTitle="Couldn't load your dashboard">
        <DashboardContent />
      </ErrorBoundary>
    </div>
  );
};
