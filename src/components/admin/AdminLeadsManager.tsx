import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  RefreshCw,
  Inbox,
  CalendarClock,
  Mail,
  Phone,
} from "lucide-react";
import { apiClient } from "../../api/http";
import { useToast } from "./AdminUIProvider";
import { Panel, StatusPill, EmptyState, SkeletonRows, SearchInput, IconButton } from "./Primitives";

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
const TYPE_TONE: Record<Lead["type"], "info" | "brand" | "warning" | "success"> = {
  buyer: "info",
  investor: "brand",
  landlord: "warning",
  call: "success",
};

const LEAD_STATUS_TONE: Record<Lead["status"], "brand" | "info" | "success"> = {
  new: "brand",
  contacted: "info",
  closed: "success",
};

const BOOKING_STATE_TONE: Record<Booking["state"], "warning" | "success" | "danger"> = {
  locked: "warning",
  purchased: "success",
  cancelled: "danger",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Lead Card ─────────────────────────────────────────────────────────────────
const LeadCard: React.FC<{ lead: Lead }> = ({ lead }) => (
  <div className="flex items-start gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl border border-white/8 transition-colors animate-[row-in_0.2s_ease-out]">
    <div className="w-10 h-10 rounded-xl bg-[#E04F33]/15 border border-[#E04F33]/30 flex items-center justify-center shrink-0">
      <Users className="w-4.5 h-4.5 text-[#E04F33]" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-bold text-white">{lead.name}</p>
        <StatusPill tone={TYPE_TONE[lead.type]}>{lead.type}</StatusPill>
        <StatusPill tone={LEAD_STATUS_TONE[lead.status]}>{lead.status}</StatusPill>
      </div>
      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
        {lead.contact.includes("@") ? <Mail className="w-3 h-3 shrink-0" /> : <Phone className="w-3 h-3 shrink-0" />}
        <span className="truncate">{lead.contact}</span>
      </p>
      {Object.keys(lead.payload).length > 0 && (
        <p className="text-[10px] font-mono text-slate-500 mt-1.5 truncate bg-black/20 rounded-lg px-2 py-1 border border-white/5">
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
    <div className="flex items-start gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl border border-white/8 transition-colors animate-[row-in_0.2s_ease-out]">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        <CalendarClock className="w-4.5 h-4.5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-white truncate max-w-[220px]">
            {booking.property?.title || `Property #${booking.property?.id}`}
          </p>
          <StatusPill tone={BOOKING_STATE_TONE[booking.state]}>{booking.state}</StatusPill>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {booking.property?.city}, {booking.property?.state} · Buyer: {buyerName}
        </p>
        {booking.notes && (
          <p className="text-[10px] font-mono text-slate-500 mt-1.5 truncate bg-black/20 rounded-lg px-2 py-1 border border-white/5">
            {booking.notes}
          </p>
        )}
      </div>
      <p className="text-[10px] text-slate-500 font-mono shrink-0">{fmt(booking.created_at)}</p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
type Tab = "leads" | "bookings";

export const AdminLeadsManager: React.FC = () => {
  const toast = useToast();
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
      toast.error("Couldn't load leads");
    } finally {
      setLoadingLeads(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const data = await apiClient<Booking[]>("/api/admin/bookings/", { method: "GET" });
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
      toast.error("Couldn't load bookings");
    } finally {
      setLoadingBookings(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchLeads(); fetchBookings(); }, [fetchLeads, fetchBookings]);

  const handleRefresh = () => {
    fetchLeads();
    fetchBookings();
    toast.info("Refreshing data…");
  };

  const filteredLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.contact.toLowerCase().includes(search.toLowerCase()) ||
          l.type.toLowerCase().includes(search.toLowerCase()),
      ),
    [leads, search],
  );

  const filteredBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (b.property?.title || "").toLowerCase().includes(search.toLowerCase()) ||
          (b.buyer?.email || "").toLowerCase().includes(search.toLowerCase()),
      ),
    [bookings, search],
  );

  const newLeadsCount = useMemo(() => leads.filter((l) => l.status === "new").length, [leads]);
  const activeBookingsCount = useMemo(() => bookings.filter((b) => b.state === "locked").length, [bookings]);

  const isLoading = tab === "leads" ? loadingLeads : loadingBookings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Panel className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#E04F33]/15 border border-[#E04F33]/30 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#E04F33]" />
              </div>
              <h1 className="text-2xl font-bold text-white font-heading">
                Leads &amp; <span className="text-[#E04F33]">Transaction Bookings</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 sm:ml-12">
              Track user inquiries, monitor lease applications, and 15-minute lease lock bookings across the platform.
            </p>
          </div>
          <IconButton onClick={handleRefresh} disabled={isLoading} aria-label="Refresh data" className="shrink-0 self-start sm:self-auto">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </IconButton>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <span className="text-slate-400">New leads: </span>
            <span className="text-[#FF8A73] font-bold">{newLeadsCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <span className="text-slate-400">Active holds: </span>
            <span className="text-amber-300 font-bold">{activeBookingsCount}</span>
          </div>
        </div>
      </Panel>

      {/* Body */}
      <Panel className="p-6 space-y-5">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 bg-black/30 rounded-2xl border border-white/10 w-full sm:w-fit">
          <button
            onClick={() => setTab("leads")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              tab === "leads"
                ? "bg-[#E04F33] text-white shadow-lg shadow-[#E04F33]/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Inbound Leads ({leads.length})
          </button>
          <button
            onClick={() => setTab("bookings")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              tab === "bookings"
                ? "bg-[#E04F33] text-white shadow-lg shadow-[#E04F33]/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Lease Holds ({bookings.length})
          </button>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={tab === "leads" ? "Search leads…" : "Search bookings…"}
          className="max-w-sm"
        />

        {/* Content */}
        {isLoading ? (
          <SkeletonRows />
        ) : tab === "leads" ? (
          filteredLeads.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={leads.length === 0 ? "No incoming leads yet" : "No leads match your search"}
              hint={leads.length === 0 ? "New inquiries from buyers, investors, and landlords will show up here." : undefined}
            />
          ) : (
            <div className="space-y-2">
              {filteredLeads.map((l) => <LeadCard key={l.id} lead={l} />)}
            </div>
          )
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title={bookings.length === 0 ? "No lease bookings yet" : "No bookings match your search"}
            hint={bookings.length === 0 ? "15-minute lease locks and purchases will appear here." : undefined}
          />
        ) : (
          <div className="space-y-2">
            {filteredBookings.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        )}
      </Panel>
    </div>
  );
};
