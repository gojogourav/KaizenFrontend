import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarClock,
  RefreshCw,
  Check,
  X,
  Copy,
  ExternalLink,
  Clock,
} from "lucide-react";
import { adminBookingService } from "../../api/services";
import type { BookingRecord } from "../../api/services";

const STATE_FILTERS = [
  { value: "pending_review", label: "Pending Review" },
  { value: "locked", label: "Locked" },
  { value: "purchased", label: "Purchased" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
  { value: "", label: "All" },
] as const;

const STATE_BADGE: Record<string, string> = {
  locked: "bg-amber-950/90 text-amber-300 border-amber-500/40",
  pending_review: "bg-[#E04F33]/20 text-[#FF8A73] border-[#E04F33]/40",
  purchased: "bg-emerald-950/90 text-emerald-300 border-emerald-500/40",
  expired: "bg-slate-900/90 text-slate-400 border-slate-700/40",
  cancelled: "bg-rose-950/90 text-rose-300 border-rose-500/40",
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export const AdminBookingsReview: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [stateFilter, setStateFilter] = useState<string>("pending_review");
  const [actingOn, setActingOn] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminBookingService.getBookings(stateFilter || undefined);
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [stateFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleApprove = async (id: number) => {
    setActingOn(id);
    try {
      await adminBookingService.approvePayment(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Approve failed", err);
    } finally {
      setActingOn(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm("Reject this payment? The buyer will be notified.")) return;
    setActingOn(id);
    try {
      await adminBookingService.rejectPayment(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Reject failed", err);
    } finally {
      setActingOn(null);
    }
  };

  const handleCopyRef = (booking: BookingRecord) => {
    if (!booking.payment_reference) return;
    navigator.clipboard.writeText(booking.payment_reference);
    setCopiedId(booking.id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-[#E04F33]" />
            Payment <span className="text-[#E04F33]">Review Queue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Confirm PayPal payment references against your PayPal account before approving.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-mono shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#E04F33] ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {STATE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStateFilter(f.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border transition-all ${
              stateFilter === f.value
                ? "bg-[#E04F33] text-white border-[#E04F33]/50 shadow-lg shadow-[#E04F33]/20"
                : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-12 text-center space-y-2">
          <CalendarClock className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-sm font-bold text-white">No bookings in this state</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 sm:p-5 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white text-sm">{b.property_title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase border ${STATE_BADGE[b.state] || ""}`}>
                      {b.state.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    {b.buyer_email || "Guest"} · Booking #{b.id}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <p className="flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> Locked {fmt(b.locked_at)}
                  </p>
                  {b.submitted_at && <p>Submitted {fmt(b.submitted_at)}</p>}
                </div>
              </div>

              {b.payment_reference && (
                <div className="flex items-center gap-2 p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 font-mono uppercase shrink-0">Ref:</span>
                  <span className="text-xs font-mono text-slate-200 truncate flex-1">
                    {b.payment_reference}
                  </span>
                  <button
                    onClick={() => handleCopyRef(b)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white shrink-0"
                    title="Copy reference"
                  >
                    {copiedId === b.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}


              {b.state === "pending_review" && (
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="https://www.paypal.com/activity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 font-mono"
                  >

                    <ExternalLink className="w-3.5 h-3.5" /> Check PayPal
                  </a>
                  <button
                    onClick={() => handleApprove(b.id)}
                    disabled={actingOn === b.id}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(b.id)}
                    disabled={actingOn === b.id}
                    className="flex-1 px-4 py-2 bg-rose-950/60 hover:bg-rose-900 disabled:opacity-60 text-rose-300 rounded-xl text-xs font-bold uppercase tracking-wider border border-rose-800/50 flex items-center justify-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
