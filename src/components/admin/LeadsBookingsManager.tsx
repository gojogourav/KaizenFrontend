/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, Lock, Trash2, Search, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';

export const LeadsBookingsManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'leads' | 'bookings'>('leads');
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsRes, bookingsRes] = await Promise.all([
        api.getLeads().catch(() => ({ leads: [] })),
        api.getMyBookings().catch(() => ({ bookings: [] }))
      ]);
      setLeads(Array.isArray(leadsRes) ? leadsRes : ((leadsRes as any)?.leads || []));
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : ((bookingsRes as any)?.bookings || []));
    } catch (err) {
      console.warn('Failed to load admin leads & bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteLead = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this lead inquiry?')) return;
    try {
      await api.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.warn('Failed to delete lead:', err);
    }
  };

  const filteredLeads = leads.filter((l) =>
    l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter((b) => {
    const title = b.property?.title || b.propertyTitle || '';
    const loc = b.property?.city || b.location || '';
    const ref = String(b.id || b.bookingId || '');
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/60">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-fuchsia-400" />
            Leads & <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">Transaction Bookings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track user inquiries, master lease applications, and 15-minute lease lock bookings across the platform.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-[#120524] hover:bg-purple-900/50 border border-purple-700/60 text-purple-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-mono shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Sub Tab Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveSubTab('leads')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'leads'
              ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30'
              : 'bg-[#18082e] text-slate-400 hover:text-white border border-purple-900/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Inbound Leads ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'bookings'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-[#18082e] text-slate-400 hover:text-white border border-purple-900/60'
          }`}
        >
          <Lock className="w-4 h-4 text-pink-400" />
          <span>Lease Holds & Bookings ({bookings.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeSubTab}...`}
          className="w-full pl-9 pr-4 py-2 bg-[#18082e] border border-purple-800/60 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500"
        />
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-purple-950/40 rounded-2xl" />
          ))}
        </div>
      ) : activeSubTab === 'leads' ? (
        /* LEADS TABLE */
        filteredLeads.length === 0 ? (
          <div className="bg-[#18082e] rounded-3xl border border-purple-800/60 p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-purple-400/40 mx-auto" />
            <p className="text-sm font-bold text-white">No incoming leads found</p>
          </div>
        ) : (
          <div className="bg-[#18082e] rounded-3xl border border-purple-800/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-900/80 bg-[#130723] text-purple-300 font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Message</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-950">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-purple-950/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white text-sm">{lead.name}</p>
                        <p className="text-[10px] font-mono text-purple-300">{lead.email} • {lead.phone || lead.phone_number || 'No phone'}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs leading-relaxed">
                        {lead.message || 'General inquiry'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800/50 transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* BOOKINGS TABLE */
        filteredBookings.length === 0 ? (
          <div className="bg-[#18082e] rounded-3xl border border-purple-800/60 p-12 text-center space-y-2">
            <Lock className="w-10 h-10 text-purple-400/40 mx-auto" />
            <p className="text-sm font-bold text-white">No active lease locks recorded</p>
          </div>
        ) : (
          <div className="bg-[#18082e] rounded-3xl border border-purple-800/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-900/80 bg-[#130723] text-purple-300 font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Property</th>
                    <th className="py-3.5 px-4">Hold Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-950">
                  {filteredBookings.map((b) => {
                    const id = b.id || b.bookingId;
                    const status = b.booking_state || b.status || 'Locked';
                    const propTitle = b.property?.title || b.propertyTitle || 'Property';
                    const propLoc = b.property?.city ? `${b.property.city}, ${b.property.state}` : (b.location || '');

                    return (
                      <tr key={id} className="hover:bg-purple-950/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-fuchsia-300">
                          #{id}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white text-sm">{propTitle}</p>
                          <p className="text-[10px] font-mono text-purple-300/80">{propLoc}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                            status === 'Purchased' || status === 'PURCHASED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : status === 'Locked' || status === 'LOCKED'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

    </div>
  );
};
