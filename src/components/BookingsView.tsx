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
    <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans text-slate-100">
      
      <div className="flex items-center justify-between pb-4 border-b border-purple-900/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            <Lock className="w-7 h-7 text-fuchsia-400" />
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Lease Transactions & Locks</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of secured villa leases and active hold locks on Kaizen.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-purple-950/40 rounded-3xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-[#18082e] rounded-3xl border border-purple-800/60 p-12 text-center space-y-4 shadow-xl">
          <ShieldCheck className="w-12 h-12 text-purple-400/40 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No active bookings found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
                className="bg-[#18082e] rounded-3xl border border-purple-800/60 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-fuchsia-400 bg-purple-950 px-3 py-1 rounded-full border border-purple-800">
                      #{bookingId}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase inline-flex items-center gap-1.5 ${
                      status === 'Purchased' || status === 'PURCHASED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                      status === 'Locked' || status === 'LOCKED' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {(status === 'Purchased' || status === 'PURCHASED') && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {(status === 'Locked' || status === 'LOCKED') && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      {(status === 'Cancelled' || status === 'CANCELLED') && <XCircle className="w-3.5 h-3.5" />}
                      {status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white font-sans">{propertyTitle}</h3>
                  <p className="text-xs text-slate-400">{location} {monthlyRent ? `• Rent: ${monthlyRent}` : ''}</p>
                </div>

                <div className="text-right space-y-1 text-xs font-mono">
                  {item.created_at && (
                    <p className="text-slate-400">
                      Date: <span className="text-slate-200">{new Date(item.created_at).toLocaleDateString()}</span>
                    </p>
                  )}
                  {(status === 'Locked' || status === 'LOCKED') && (
                    <p className="text-amber-300 font-bold">
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
