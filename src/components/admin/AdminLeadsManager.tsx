import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  RefreshCw,
  Search,
  Inbox,
  CalendarClock,
  ChevronRight,
  Mail,
  Phone,
  Tag,
  Circle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { apiClient } from "../../api/http";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Lead {
  id: number;
  type: "buyer" | "investor" | "landlord" | "call";
  name: string;
  contact: string;
  status: "new" | "contacted" | "closed";
  payload: Record<string, unknown>;
  created_at: string;
}

interface Booking {
  id: number;
  property: { id: number; title: string; city: string; state: string };
  buyer: { id: number; email: string; first_name: string; last_name: string } | null;
  state: "locked" | "purchased" | "cancelled";
  notes: string;
  locked_at: string;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<Lead["type"], string> = {
  buyer:    "bg-sky-500/15 text-sky-300 border-sky-500/30",
  investor: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  landlord: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  call:     "bg-teal-500/15 text-teal-300 border-teal-500/30",
};

const STATUS_COLORS: Record<Lead["status"], string> = {
  new:       "bg-[#E04F33]/20 text-[#FF8A73] border-[#E04F33]/30",
  contacted: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  closed:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const STATE_COLORS: Record<Booking["state"], string> = {
  locked:    "bg-amber-500/15 text-amber-300 border-amber-500/30",
  purchased: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ── Empty State ────────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ icon: React.ReactNode; message: string }> = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
      {icon}
    </div>
    <p className="text-sm font-mono">{message}</p>
  </div>
);

// ── Lead Card ─────────────────────────────────────────────────────────────────
const LeadCard: React.FC<{ lead: Lead }> = ({ lead }) => (
  <div className="flex items-start gap-4 p-4 bg-white/3 hover:bg-white/5 rounded-2xl border border-white/8 transition-colors group">
    <div className="w-10 h-10 rounded-xl bg-[#E04F33]/15 border border-[#E04F33]/30 flex items-center justify-center shrink-0">
      <Users className="w-4.5 h-4.5 text-[#E04F33]" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-bold text-white">{lead.name}</p>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${TYPE_COLORS[lead.type]}`}>
          {lead.type}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${STATUS_COLORS[lead.status]}`}>
          {lead.status}
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
        {lead.contact.includes("@") ? <Mail className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
        {lead.contact}
      </p>
      {Object.keys(lead.payload).length > 0 && (
        <p className="text-[10px] font-mono text-slate-500 mt-1 truncate">
          {JSON.stringify(lead.payload)}
        </p>
      )}
    </div>
    <p className="text-[10px] text-slate-500 font-mono shrink-0">{fmt(lead.created_at)}</p>
  </div>
);

// ── Booking Card ──────────────────────────────────────────────────────────────
const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const buyerName = booking.buyer
    ? `${booking.buyer.first_name} ${booking.buyer.last_name}`.trim() || booking.buyer.email
    : "Guest";
  return (
    <div className="flex items-start gap-4 p-4 bg-white/3 hover:bg-white/5 rounded-2xl border border-white/8 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        <CalendarClock className="w-4.5 h-4.5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-white truncate max-w-[200px]">
            {booking.property?.title || `Property #${booking.property?.id}`}
          </p>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${STATE_COLORS[booking.state]}`}>
            {booking.state}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {booking.property?.city}, {booking.property?.state} · Buyer: {buyerName}
        </p>
        {booking.notes && (
          <p className="text-[10px] font-mono text-slate-500 mt-1 truncate">{booking.notes}</p>
        )}
      </div>
      <p className="text-[10px] text-slate-500 font-mono shrink-0">{fmt(booking.created_at)}</p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
type Tab = "leads" | "bookings";

export const AdminLeadsManager: React.FC = () => {
  const [tab, setTab] = useState<Tab>("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [search, setSearch] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const data = await apiClient<Lead[]>("/api/admin/leads/", { method: "GET" });
      setLeads(Array.isArray(data) ? data : []);
    } catch {
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const data = await apiClient<Booking[]>("/api/admin/bookings/", { method: "GET" });
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); fetchBookings(); }, [fetchLeads, fetchBookings]);

  const handleRefresh = () => { fetchLeads(); fetchBookings(); };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.contact.toLowerCase().includes(search.toLowerCase()) ||
      l.type.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredBookings = bookings.filter(
    (b) =>
      (b.property?.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.buyer?.email || "").toLowerCase().includes(search.toLowerCase()),
  );

  const isLoading = tab === "leads" ? loadingLeads : loadingBookings;

  return (
    <div className="space-y-6 text-slate-100 font-sans max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#141824]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#E04F33]/15 border border-[#E04F33]/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#E04F33]" />
              </div>
              <h1 className="text-2xl font-bold text-white font-heading">
                Leads &amp; <span className="text-[#E04F33]">Transaction Bookings</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 ml-12">
              Track user inquiries, monitor lease applications, and 15-minute lease lock bookings across the platform.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-xs font-mono text-slate-300 transition-all disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Body Card */}
      <div className="bg-[#141824]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Tabs */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setTab("leads")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
              tab === "leads"
                ? "bg-[#E04F33] border-[#E04F33]/50 text-white shadow-lg shadow-[#E04F33]/20"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/8"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Inbound Leads ({leads.length})
          </button>
          <button
            onClick={() => setTab("bookings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
              tab === "bookings"
                ? "bg-[#E04F33] border-[#E04F33]/50 text-white shadow-lg shadow-[#E04F33]/20"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/8"
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Lease Holds &amp; Bookings ({bookings.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "leads" ? "Search leads…" : "Search bookings…"}
            className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#E04F33]/50 transition-colors font-mono"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : tab === "leads" ? (
          filteredLeads.length === 0 ? (
            <EmptyState
              icon={<Inbox className="w-7 h-7 text-slate-600" />}
              message="No incoming leads found"
            />
          ) : (
            <div className="space-y-2">
              {filteredLeads.map((l) => <LeadCard key={l.id} lead={l} />)}
            </div>
          )
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="w-7 h-7 text-slate-600" />}
            message="No lease bookings found"
          />
        ) : (
          <div className="space-y-2">
            {filteredBookings.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        )}
      </div>
    </div>
  );
};
