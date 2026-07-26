/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Lock, ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../api/client';

export const BookingsView: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getMyBookings();
      const bookingList = Array.isArray(res) ? res : ((res as any)?.bookings || []);
      setBookings(bookingList);
    } catch (err) {
      console.warn('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans text-slate-900 dark:text-slate-100">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-7 h-7 text-[#E04F33]" />
            My <span className="text-[#E04F33]">Lease Transactions & Locks</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time status of secured villa leases and active hold locks on Kaizen.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-slate-200/60 dark:bg-white/5 rounded-3xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 p-12 text-center space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-2xl">
          <ShieldCheck className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200">No active bookings found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You haven't locked or secured any villa leases yet. Select a property in the search bar or property prospectus to initiate a lock session.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((item, idx) => {
            const bookingId = item.id || item.bookingId || `bk_${idx}`;
            const status = item.booking_state || item.status || 'LOCKED';
            const propertyTitle = item.property?.title || item.propertyTitle || 'Luxury Property';
            const location = item.property?.city ? `${item.property.city}, ${item.property.state}` : (item.location || '');
            const monthlyRent = item.property?.price ? `$${item.property.price.toLocaleString()}/mo` : (item.monthlyRent || '');

            return (
              <div
                key={bookingId}
                className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 shadow-xl shadow-slate-200/50 dark:shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 apple-specular"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-[#E04F33] dark:text-[#FF8A73] bg-[#E04F33]/10 dark:bg-white/10 px-3 py-1 rounded-full border border-[#E04F33]/20 dark:border-white/15">
                      #{bookingId}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase inline-flex items-center gap-1.5 ${
                      status === 'Purchased' || status === 'PURCHASED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40' :
                      status === 'Locked' || status === 'LOCKED' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}>
                      {(status === 'Purchased' || status === 'PURCHASED') && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {(status === 'Locked' || status === 'LOCKED') && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      {(status === 'Cancelled' || status === 'CANCELLED') && <XCircle className="w-3.5 h-3.5" />}
                      {status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white font-sans">{propertyTitle}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{location} {monthlyRent ? `• Rent: ${monthlyRent}` : ''}</p>
                </div>

                <div className="text-right space-y-1 text-xs font-mono">
                  {item.created_at && (
                    <p className="text-slate-500 dark:text-slate-400">
                      Date: <span className="text-slate-800 dark:text-slate-200">{new Date(item.created_at).toLocaleDateString()}</span>
                    </p>
                  )}
                  {(status === 'Locked' || status === 'LOCKED') && (
                    <p className="text-amber-600 dark:text-amber-300 font-bold">
                      Hold session active
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
