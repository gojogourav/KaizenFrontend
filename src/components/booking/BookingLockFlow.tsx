import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Clock,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Copy,
} from "lucide-react";
import { bookingService } from "../../api/services";
import type { BookingRecord } from "../../api/services";

interface BookingLockFlowProps {
  booking: BookingRecord;
  onClose: () => void;
  onStateChange?: (booking: BookingRecord) => void;
}

function useCountdown(expiresAt: string | null) {
  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();

    const tick = () => {
      const diff = target - Date.now();
      setRemainingMs(Math.max(0, diff));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  return { remainingMs, minutes, seconds, expired: remainingMs <= 0 };
}

export const BookingLockFlow: React.FC<BookingLockFlowProps> = ({
  booking: initialBooking,
  onClose,
  onStateChange,
}) => {
  const [booking, setBooking] = useState<BookingRecord>(initialBooking);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { minutes, seconds, expired } = useCountdown(booking.expires_at);

  const refreshBooking = useCallback(async () => {
    try {
      const fresh = await bookingService.getBooking(booking.id);
      setBooking(fresh);
      onStateChange?.(fresh);
    } catch {
      // silent — next poll will retry
    }
  }, [booking.id, onStateChange]);

  // Poll while we're waiting on the countdown or admin review
  useEffect(() => {
    if (booking.state === "locked" || booking.state === "pending_review") {
      pollRef.current = setInterval(refreshBooking, 5000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [booking.state, refreshBooking]);

  const handleCopyReference = () => {
    if (!booking.payment_reference) return;
    navigator.clipboard.writeText(booking.payment_reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSubmitReference = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (reference.trim().length < 3) {
      setSubmitError("Enter the PayPal transaction ID or reference number.");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await bookingService.submitPaymentReference(booking.id, reference.trim());
      setBooking(updated);
      onStateChange?.(updated);
    } catch (err: any) {
      setSubmitError(err?.message || "Couldn't submit your reference. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      const updated = await bookingService.cancelBooking(booking.id);
      setBooking(updated);
      onStateChange?.(updated);
      onClose();
    } catch {
      // no-op; user can retry
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="relative w-full max-w-md bg-[#0F1014] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E04F33]/15 border border-[#E04F33]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#E04F33]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              Complete your lock
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Booking #{booking.id}
            </p>
          </div>
        </div>

        {/* ── LOCKED: countdown + payment link + reference form ── */}
        {booking.state === "locked" && !expired && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-2 py-4 bg-white/5 rounded-2xl border border-white/10">
              <Clock className="w-4 h-4 text-[#FF8A73]" />
              <span className="text-2xl font-mono font-bold text-white tabular-nums">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <span className="text-xs text-slate-400 font-mono ml-1">remaining</span>
            </div>


              href={booking.payment_link ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-xl text-sm font-bold transition-all shadow-lg"
            >
              Pay with PayPal
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="pt-2 border-t border-white/10">
              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                After paying, paste the PayPal transaction ID / reference from your receipt
                below so our team can confirm it.
              </p>
              <form onSubmit={handleSubmitReference} className="space-y-3">
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. 8AB123456C789012D"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#E04F33]"
                />
                {submitError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {submitError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] disabled:opacity-60 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Submitting..." : "I've paid — submit for review"}
                </button>
              </form>
            </div>

            <button
              onClick={handleCancel}
              className="w-full text-center text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cancel this lock
            </button>
          </div>
        )}

        {/* ── PENDING REVIEW ── */}
        {booking.state === "pending_review" && (
          <div className="space-y-4 text-center py-4">
            <Loader2 className="w-8 h-8 text-[#FF8A73] animate-spin mx-auto" />
            <div>
              <p className="text-sm font-bold text-white">Awaiting confirmation</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                We're verifying your payment (ref: <span className="font-mono text-slate-300">{booking.payment_reference}</span>).
                This usually takes a few minutes — this page will update automatically.
              </p>
            </div>
          </div>
        )}

        {/* ── PURCHASED ── */}
        {booking.state === "purchased" && (
          <div className="space-y-3 text-center py-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div>
              <p className="text-sm font-bold text-white">Payment confirmed!</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {booking.property_title} is now yours. We'll follow up with next steps.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        )}

        {/* ── EXPIRED / CANCELLED ── */}
        {(booking.state === "expired" || booking.state === "cancelled" || expired) && booking.state !== "purchased" && (
          <div className="space-y-3 text-center py-4">
            <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <div>
              <p className="text-sm font-bold text-white">
                {booking.state === "cancelled" ? "Lock cancelled" : "Lock expired"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                This property is available again — you're welcome to lock it once more.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
