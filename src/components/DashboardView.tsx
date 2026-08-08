/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, ShieldCheck, Heart, Lock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { DashboardResponse } from '../types/dashboard';

export const DashboardView: React.FC<{
  onNavigateToFavorites?: () => void;
  onNavigateToBookings?: () => void;
  onSelectDeal?: (deal: any) => void;
}> = ({ onNavigateToFavorites, onNavigateToBookings, onSelectDeal }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.getDashboard();
        setData(res);
      } catch (err) {
        console.warn('Dashboard fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse font-sans">
        <div className="h-28 bg-slate-200/60 dark:bg-white/5 rounded-3xl w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 bg-slate-200/40 dark:bg-white/5 rounded-2xl w-full" />
          ))}
        </div>
        <div className="h-64 bg-slate-200/40 dark:bg-white/5 rounded-3xl w-full" />
      </div>
    );
  }

  const profileUser = data?.user || user;
  const stats = data?.statistics;
  const fullName = profileUser ? `${profileUser.first_name || ''} ${profileUser.last_name || ''}`.trim() || profileUser.username : 'Member';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 font-sans text-slate-900 dark:text-slate-100">

      {/* Header Banner */}
      <div className="glass-card bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 apple-specular">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#E04F33]/10 dark:bg-white/10 border-2 border-[#E04F33]/40 flex items-center justify-center text-2xl font-black text-[#E04F33] dark:text-white uppercase">
            {fullName[0] || 'K'}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-sans">
              Welcome back, <span className="text-[#E04F33]">{fullName}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
              {(profileUser as any)?.role ? `${(profileUser as any).role.toUpperCase()} Account` : 'Member Account'} • {profileUser?.email}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#E04F33]/10 dark:bg-white/10 px-4 py-2 rounded-xl border border-[#E04F33]/20 dark:border-white/15 text-xs font-mono font-bold text-[#E04F33] dark:text-[#FF8A73]">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Verified Platform Member</span>
        </div>
      </div>

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={onNavigateToFavorites}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg flex items-center justify-between cursor-pointer hover:border-[#E04F33]/40 transition-all group"
          >
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">Favorites</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.favorites}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
          </div>

          <div
            onClick={onNavigateToBookings}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-all group"
          >
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">Locked</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.locked}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={onNavigateToBookings}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition-all group"
          >
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">Purchased</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.purchased}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={onNavigateToBookings}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg flex items-center justify-between cursor-pointer hover:border-slate-400/40 transition-all group"
          >
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">Cancelled</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.cancelled}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings Activity Table */}
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 shadow-xl shadow-slate-200/50 dark:shadow-2xl space-y-4 apple-specular">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#E04F33]" />
            Recent Bookings & Transactions
          </h3>
          {onNavigateToBookings && (
            <button
              type="button"
              onClick={onNavigateToBookings}
              className="text-xs font-bold text-[#E04F33] hover:underline flex items-center gap-1 font-heading"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {data?.recent_bookings?.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">No recent bookings recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-mono uppercase tracking-wider">
                  <th className="pb-3 px-2">Booking ID</th>
                  <th className="pb-3 px-2">Property</th>
                  <th className="pb-3 px-2">Price</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {data?.recent_bookings?.map((b) => {
                  const stateUpper = b.state?.toUpperCase();
                  return (
                    <tr
                      key={b.id}
                      onClick={() => onSelectDeal?.(b.property)}
                      className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-2 font-mono text-[#E04F33] dark:text-[#FF8A73]">#{b.id}</td>
                      <td className="py-3 px-2 font-bold text-slate-900 dark:text-slate-100">{b.property?.title || 'Property'}</td>
                      <td className="py-3 px-2 font-semibold text-emerald-600 dark:text-emerald-400">
                        {b.property?.price ? `$${b.property.price.toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="py-3 px-2 text-slate-500 font-mono">
                        {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                          stateUpper === 'PURCHASED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40' :
                          stateUpper === 'LOCKED' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}>
                          {b.state}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Favorites Section Preview */}
      {data?.recent_favorites && data.recent_favorites.length > 0 && (
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 shadow-xl shadow-slate-200/50 dark:shadow-2xl space-y-4 apple-specular">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              Recent Favorites
            </h3>
            {onNavigateToFavorites && (
              <button
                type="button"
                onClick={onNavigateToFavorites}
                className="text-xs font-bold text-[#E04F33] hover:underline flex items-center gap-1 font-heading"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.recent_favorites.map((fav) => (
              <div
                key={fav.id}
                onClick={() => onNavigateToFavorites?.()}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[#E04F33]/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{fav.property?.title || 'Saved Property'}</h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                    {fav.property?.price ? `$${fav.property.price.toLocaleString()}` : ''}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-3">
                  Saved on {new Date(fav.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
