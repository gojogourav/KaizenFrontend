/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const DashboardView: React.FC<{ onNavigateToFavorites?: () => void; onNavigateToBookings?: () => void }> = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
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
        <div className="h-20 bg-purple-950/40 rounded-2xl w-full" />
        <div className="h-48 bg-purple-950/30 rounded-2xl w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 font-sans text-slate-100">
      
      {/* Header Banner */}
      <div className="glass-card bg-gradient-to-r from-[#1d0938] via-[#240b45] to-[#16062b] rounded-3xl p-8 border border-purple-800/60 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-2xl border-2 border-fuchsia-500 shadow-lg object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-purple-900 border-2 border-fuchsia-500 flex items-center justify-center text-2xl font-black">
              {user?.name?.[0] || 'K'}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-sans">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">{user?.name}</span>
            </h1>
            <p className="text-xs text-purple-300 font-mono mt-1">
              Buyer Account • {user?.company || 'Turnkey Member'} • {user?.email}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 bg-purple-950/80 px-4 py-2 rounded-xl border border-purple-700/50 text-xs font-mono font-bold text-fuchsia-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Platform Member</span>
        </div>
      </div>

      {/* Recent Activity Table */}

      {/* Recent Activity Table */}
      <div className="bg-[#18082e] rounded-3xl border border-purple-800/60 p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-fuchsia-400" />
          Recent Lease Transactions
        </h3>

        {data?.recentBookings?.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No active lease locks recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-purple-900/80 text-purple-300 font-mono uppercase tracking-wider">
                  <th className="pb-3 px-2">Booking ID</th>
                  <th className="pb-3 px-2">Property</th>
                  <th className="pb-3 px-2">Location</th>
                  <th className="pb-3 px-2">Monthly Rent</th>
                  <th className="pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950">
                {data?.recentBookings?.map((b: any) => (
                  <tr key={b.bookingId} className="hover:bg-purple-950/40">
                    <td className="py-3 px-2 font-mono text-purple-300">{b.bookingId}</td>
                    <td className="py-3 px-2 font-bold text-slate-100">{b.propertyTitle}</td>
                    <td className="py-3 px-2 text-slate-300">{b.location}</td>
                    <td className="py-3 px-2 font-semibold text-emerald-400">{b.monthlyRent}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                        b.status === 'PURCHASED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                        b.status === 'LOCKED' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-slate-900 text-slate-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
