import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Lock,
  Search,
  RefreshCw,
  Trash2,
  CalendarDays,
  MapPin,
  BedDouble,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
} from "lucide-react";
import { adminService, bookingService } from "../../api/services";
import type { Booking, LeadPayload } from "../../types/database";


function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nightsBetween(checkIn: string, checkOut: string) {
  const diff =
    new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

// ── Status badge ─────────────────────────────────────────────────────────────

const STATE_CONFIG: Record<
  string,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  locked: {
    label: "Locked",
    cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: <Lock className="w-3 h-3" />,
  },
  purchased: {
    label: "Purchased",
    cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const StateBadge: React.FC<{ state: string }> = ({ state }) => {
  const cfg = STATE_CONFIG[state?.toLowerCase()] ?? {
    label: state,
    cls: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    icon: <AlertCircle className="w-3 h-3" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border uppercase ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ── Booking row (expandable) ──────────────────────────────────────────────────

const BookingRow: React.FC<{
  booking: any;
  onCancel: (id: number) => void;
  cancelling: boolean;
}> = ({ booking, onCancel, cancelling }) => {
  const [expanded, setExpanded] = useState(false);

  const b = booking as any;
  const prop = b.property ?? {};
  const buyer = b.buyer ?? {};
  const state = (b.state ?? b.booking_state ?? "locked").toLowerCase();
  const checkIn = b.check_in;
  const checkOut = b.check_out;
  const nights =
    checkIn && checkOut ? nightsBetween(checkIn, checkOut) : null;
  const rent = prop.rent_monthly ?? prop.price ?? 0;
  const totalValue = nights ? Math.round(Number(rent) * (nights / 30)) : null;

  const buyerName =
    buyer.name ||
    `${buyer.first_name ?? ""} ${buyer.last_name ?? ""}`.trim() ||
    buyer.username ||
    "Unknown User";
  const buyerEmail = buyer.email ?? "—";

  return (
    <>
      <tr
        className={`transition-colors cursor-pointer ${
          expanded ? "bg-white/8" : "hover:bg-white/5"
        }`}
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Booking ref */}
        <td className="py-3.5 px-4 font-mono font-bold text-[#FF8A73] text-xs whitespace-nowrap">
          #{b.id}
        </td>

        {/* Property */}
        <td className="py-3.5 px-4 min-w-[180px]">
          <p className="font-bold text-white text-xs truncate max-w-[160px]">
            {prop.title ?? "—"}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            {prop.city ?? ""}{prop.state ? `, ${prop.state}` : ""}
          </p>
        </td>

        {/* Buyer */}
        <td className="py-3.5 px-4 min-w-[160px]">
          <p className="font-semibold text-white text-xs truncate max-w-[150px]">
            {buyerName}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[150px]">
            {buyerEmail}
          </p>
        </td>

        {/* Date range */}
        <td className="py-3.5 px-4 whitespace-nowrap">
          {checkIn && checkOut ? (
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-200">
              <CalendarDays className="w-3.5 h-3.5 text-[#E04F33] shrink-0" />
              <span>
                {fmt(checkIn)} → {fmt(checkOut)}
              </span>
            </div>
          ) : (
            <span className="text-slate-500 text-xs font-mono">No dates</span>
          )}
          {nights != null && (
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 ml-5">
              {nights} night{nights !== 1 ? "s" : ""}
            </p>
          )}
        </td>

        {/* Value */}
        <td className="py-3.5 px-4 font-mono text-xs">
          {totalValue != null ? (
            <span className="font-bold text-emerald-400">
              ~${totalValue.toLocaleString()}
            </span>
          ) : (
            <span className="text-slate-500">—</span>
          )}
        </td>

        {/* Status */}
        <td className="py-3.5 px-4">
          <StateBadge state={state} />
        </td>

        {/* Expand toggle */}
        <td className="py-3.5 px-4 text-right">
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-black/30">
          <td colSpan={7} className="px-4 pb-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Property detail */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                <p className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                  Property
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-200 font-mono">
                  <MapPin className="w-3 h-3 text-[#E04F33] shrink-0" />
                  {prop.city}, {prop.state}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-200 font-mono">
                  <BedDouble className="w-3 h-3 text-[#E04F33] shrink-0" />
                  {prop.bedrooms ?? "—"} bed · {prop.bathrooms ?? "—"} bath
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-200 font-mono">
                  <DollarSign className="w-3 h-3 text-[#E04F33] shrink-0" />
                  ${Number(rent).toLocaleString()}/mo
                </div>
              </div>

              {/* Buyer contact */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                <p className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                  Buyer Contact
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-200 font-mono">
                  <Mail className="w-3 h-3 text-[#E04F33] shrink-0" />
                  <span className="truncate">{buyerEmail}</span>
                </div>
                {buyer.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-200 font-mono">
                    <Phone className="w-3 h-3 text-[#E04F33] shrink-0" />
                    {buyer.phone}
                  </div>
                )}
                <p className="text-[10px] text-slate-500 font-mono">
                  ID: #{buyer.id ?? "—"}
                </p>
              </div>

              {/* Timeline */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                <p className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                  Timeline
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                  Locked: {fmtDateTime(b.locked_at ?? b.created_at)}
                </div>
                {b.purchased_at && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    Purchased: {fmtDateTime(b.purchased_at)}
                  </div>
                )}
                {b.cancelled_at && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                    <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                    Cancelled: {fmtDateTime(b.cancelled_at)}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                <p className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                  Actions
                </p>
                {b.stripe_payment_intent_id && (
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    Stripe: {b.stripe_payment_intent_id.slice(0, 20)}...
                  </p>
                )}
                {state === "locked" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(b.id);
                    }}
                    disabled={cancelling}
                    className="w-full py-1.5 bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-3 h-3" />
                    {cancelling ? "Cancelling..." : "Cancel & Unlock"}
                  </button>
                )}
                {state === "purchased" && (
                  <div className="py-1.5 text-center text-[10px] font-mono text-emerald-400">
                    ✓ Completed booking
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const AdminLeadsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"bookings" | "leads">("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [b, l] = await Promise.all([
        adminService.getBookings().catch(() => []),
        adminService.getLeads().catch(() => []),
      ]);
      setBookings(b);
      setLeads(l);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancelBooking = async (id: number) => {
    if (!confirm("Cancel this booking and unlock the property?")) return;
    setCancellingId(id);
    try {
      await bookingService.cancelBooking(id);
      await loadData();
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (!confirm("Delete this lead?")) return;
    try {
      // Use your apiClient directly if leadService doesn't have delete
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const prop = b.property ?? {};
    const buyer = b.buyer ?? {};
    const buyerName =
      buyer.name ||
      `${buyer.first_name ?? ""} ${buyer.last_name ?? ""}`.trim() ||
      buyer.username ||
      "";
    const matchSearch =
      !search ||
      (prop.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      buyerName.toLowerCase().includes(search.toLowerCase()) ||
      (buyer.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      String(b.id).includes(search);
    const matchStatus =
      !statusFilter ||
      (b.state ?? "").toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  // Filter leads
  const filteredLeads = leads.filter(
    (l) =>
      !search ||
      (l.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.message ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  // Metrics
  const totalLocked = bookings.filter(
    (b) => (b.state ?? "").toLowerCase() === "locked",
  ).length;
  const totalPurchased = bookings.filter(
    (b) => (b.state ?? "").toLowerCase() === "purchased",
  ).length;
  const totalRevenue = bookings
    .filter((b) => (b.state ?? "").toLowerCase() === "purchased")
    .reduce((acc, b) => {
      const rent = b.property?.rent_monthly ?? 0;
      const nights =
        b.check_in && b.check_out
          ? nightsBetween(b.check_in, b.check_out)
          : 0;
      return acc + Math.round(Number(rent) * (nights / 30));
    }, 0);

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#E04F33]/15 border border-[#E04F33]/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#E04F33]" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Leads &amp;{" "}
                <span className="text-[#E04F33]">Booking Manager</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 ml-12">
              Track every property lock, purchase, and inbound inquiry in one
              place.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-xs font-bold transition-all font-mono shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#E04F33] ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
              Total Bookings
            </span>
            <span className="text-2xl font-black text-white font-mono mt-0.5 block">
              {bookings.length}
            </span>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
              Active Locks
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">
              {totalLocked}
            </span>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
              Purchased
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
              {totalPurchased}
            </span>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
              Est. Revenue
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
              ~${totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-3 font-mono">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "bookings"
              ? "bg-[#E04F33] text-white shadow-lg shadow-[#E04F33]/25 border border-white/20"
              : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab("leads")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "leads"
              ? "bg-[#E04F33] text-white shadow-lg shadow-[#E04F33]/25 border border-white/20"
              : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Leads ({leads.length})
        </button>
      </div>

      {/* Search + status filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "bookings"
                ? "Search by property, buyer name, email, or booking #..."
                : "Search leads by name, email, or message..."
            }
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#E04F33]/50 transition-colors font-mono"
          />
        </div>
        {activeTab === "bookings" && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-[#0F1014] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono"
          >
            <option value="">All Statuses</option>
            <option value="locked">Locked</option>
            <option value="purchased">Purchased</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
      </div>

      {/* ── Bookings table ── */}
      {activeTab === "bookings" && (
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="space-y-2 p-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-white/5 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
              <Lock className="w-10 h-10 text-slate-600" />
              <p className="text-sm font-mono">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/10 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Ref #</th>
                    <th className="py-3.5 px-4 font-bold">Property</th>
                    <th className="py-3.5 px-4 font-bold">Buyer</th>
                    <th className="py-3.5 px-4 font-bold">Date Range</th>
                    <th className="py-3.5 px-4 font-bold">Est. Value</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      onCancel={handleCancelBooking}
                      cancelling={cancellingId === booking.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Leads table ── */}
      {activeTab === "leads" && (
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="space-y-2 p-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-white/5 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
              <Users className="w-10 h-10 text-slate-600" />
              <p className="text-sm font-mono">No leads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/10 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Contact</th>
                    <th className="py-3.5 px-4 font-bold">Message</th>
                    <th className="py-3.5 px-4 font-bold">Submitted</th>
                    <th className="py-3.5 px-4 text-right font-bold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white text-xs">
                          {lead.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] font-mono text-slate-400">
                            {lead.email}
                          </span>
                        </div>
                        {(lead.phone || lead.phone_number) && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-mono text-slate-400">
                              {lead.phone || lead.phone_number}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs">
                        <p className="text-xs leading-relaxed line-clamp-2">
                          {lead.message || "General inquiry"}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                        {fmtDateTime(
                          lead.created_at || lead.createdAt || lead.submitted_at,
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg border border-rose-500/30 transition-all"
                          title="Delete lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
