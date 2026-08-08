/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, Lock, Trash2, Search, RefreshCw } from 'lucide-react';

import api from '@/src/api/client';
import type { Booking } from '../../types/database';

export const LeadsBookingsManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'leads' | 'bookings'>('leads');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsRes, bookingsRes] = await Promise.all([
        api.getLeads().catch(() => [] as Lead[]),
        api.getMyBookings().catch(() => [] as Booking[])
      ]);

      setLeads(leadsRes);
      setBookings(bookingsRes);
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
      alert('Could not delete the lead. Please try again.');
    }
  };

  const filteredLeads = leads.filter((l) =>
    l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter((b) => {
    // Relying strictly on your provided Property interface inside Booking
    const title = b.property?.title || '';
    const loc = b.property?.city || '';
    const ref = String(b.id || '');
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 text-slate-100 font-sans">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#E04F33]" />
            Leads & <span className="text-[#E04F33]">Transaction Bookings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track user inquiries, master lease applications, and 15-minute lease lock bookings across the platform.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-mono shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#E04F33] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Sub Tab Buttons */}
      <div className="flex items-center gap-3 font-mono">
        <button
          onClick={() => setActiveSubTab('leads')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'leads'
              ? 'bg-[#E04F33] text-white shadow-lg shadow-[#E04F33]/25 border border-white/20'
              : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Inbound Leads ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'bookings'
              ? 'bg-[#E04F33] text-white shadow-lg shadow-[#E04F33]/25 border border-white/20'
              : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          <Lock className="w-4 h-4 text-[#FF8A73]" />
          <span>Lease Holds & Bookings ({bookings.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeSubTab}...`}
          className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#E04F33]"
        />
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
      ) : activeSubTab === 'leads' ? (
        /* LEADS TABLE */
        filteredLeads.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">No incoming leads found</p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/10 text-slate-300 font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Message</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white text-sm">{lead.name}</p>
                        <p className="text-[10px] font-mono text-slate-300">
                          {lead.email} • {lead.phone_number || 'No phone'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs leading-relaxed">
                        {lead.message || 'General inquiry'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {/* Changed from lead.createdAt to lead.created_at to match DRF standards */}
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'Recent'}
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
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-12 text-center space-y-2">
            <Lock className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">No active lease locks recorded</p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/10 text-slate-300 font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Property</th>
                    <th className="py-3.5 px-4">Hold Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBookings.map((b) => {
                    const id = b.id;
                    const status = b.booking_state || 'Locked';
                    const propTitle = b.property?.title || 'Unknown Property';
                    const propLoc = b.property?.city ? `${b.property.city}, ${b.property.state}` : '';

                    return (
                      <tr key={id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#FF8A73]">
                          #{id}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white text-sm">{propTitle}</p>
                          <p className="text-[10px] font-mono text-slate-300">{propLoc}</p>
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
