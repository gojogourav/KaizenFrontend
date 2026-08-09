import React from "react";
import { TrendingUp, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../hooks/useDashboard";
import { SkeletonList } from "../common/Skeleton";
import { ErrorBoundary } from "../common/ErrorBoundary";
import { RecentBookingsTable } from "./RecentBookingsTable";

const DashboardContent: React.FC = () => {
  const { dashboard, loading, error } = useDashboard();

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
      <p role="alert" className="text-sm text-rose-300 text-center py-12">
        {error}
      </p>
    );

  return (
    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 shadow-xl space-y-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#E04F33]" aria-hidden="true" />
        Recent Lease Transactions
      </h3>
      <RecentBookingsTable bookings={dashboard?.recent_bookings || []} />
    </div>
  );
};

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const displayName =
    user?.name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.username;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 text-slate-900 dark:text-slate-100">
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-slate-200/80 dark:border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="w-16 h-16 rounded-2xl border-2 border-[#E04F33]/40 shadow-lg object-cover"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl bg-[#E04F33]/10 dark:bg-white/10 border-2 border-[#E04F33]/40 flex items-center justify-center text-2xl font-black text-[#E04F33] dark:text-white"
              aria-hidden="true"
            >
              {displayName?.[0] || "K"}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              Welcome back,{" "}
              <span className="text-[#E04F33]">{displayName}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
              Buyer Account • {user?.company || "Turnkey Member"} •{" "}
              {user?.email}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#E04F33]/10 dark:bg-white/10 px-4 py-2 rounded-xl border border-[#E04F33]/20 dark:border-white/15 text-xs font-mono font-bold text-[#E04F33] dark:text-[#FF8A73]">
          <ShieldCheck
            className="w-4 h-4 text-emerald-500"
            aria-hidden="true"
          />
          <span>Verified Platform Member</span>
        </div>
      </div>

      <ErrorBoundary fallbackTitle="Couldn't load your dashboard">
        <DashboardContent />
      </ErrorBoundary>
    </div>
  );
};
