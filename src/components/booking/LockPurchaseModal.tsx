import React, { useEffect, useState } from "react";
import { Clock, ExternalLink, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Modal } from "../common/Modal";
import { useLockPurchase } from "../../hooks/useLockPurchase";
import type { Property } from "../../types/database";

interface LockPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: Property | null;
  onSuccess: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const LockPurchaseModal: React.FC<LockPurchaseModalProps> = ({
  isOpen,
  onClose,
  deal,
  onSuccess,
}) => {
  const {
    step,
    booking,
    timeLeft,
    error,
    submitting,
    initiateLock,
    submitPaymentReference,
    cancelLock,
    reset,
  } = useLockPurchase(deal?.id, onSuccess);

  const [reference, setReference] = useState("");

  useEffect(() => {
    if (isOpen && deal) {
      initiateLock();
    } else {
      reset();
      setReference("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, deal]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (step === "LOCKED" || step === "PENDING_REVIEW") {
      cancelLock();
    }
    onClose();
  };

  const handleSubmitReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reference.trim().length < 3) return;
    await submitPaymentReference(reference.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Lock & Purchase Property"
      titleId="lock-purchase-title"
    >
      <div className="p-4 space-y-4">
        <p className="text-sm font-semibold text-white">{deal?.title}</p>

        {error && (
          <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* ── LOCKING ── */}
        {step === "LOCKING" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-8 h-8 text-[#E04F33] animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Locking this property for you...</p>
          </div>
        )}

        {/* ── LOCKED: countdown + PayPal link + reference form ── */}
        {step === "LOCKED" && booking && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 py-4 bg-white/5 rounded-2xl border border-white/10">
              <Clock className="w-4 h-4 text-rose-400" />
              <span className="text-2xl font-mono font-bold text-rose-500 tabular-nums">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-slate-400 font-mono ml-1">remaining</span>
            </div>

            {booking.payment_link && (
            <a
                href={booking.payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-xl text-sm font-bold transition-all shadow-lg"
              >
                Pay with PayPal
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <div className="pt-2 border-t border-white/10">
              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                After paying, paste the PayPal transaction ID / reference from your receipt below.
              </p>
              <form onSubmit={handleSubmitReference} className="space-y-3">
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. 8AB123456C789012D"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#E04F33]"
                />
                <button
                  type="submit"
                  disabled={submitting || reference.trim().length < 3}
                  className="w-full py-3 bg-[#E04F33] hover:bg-[#ED5B3F] disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Submitting..." : "I've paid — submit for review"}
                </button>
              </form>
            </div>

            <button
              onClick={handleClose}
              className="w-full text-center text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cancel this lock
            </button>
          </div>
        )}

        {/* ── PENDING REVIEW ── */}
        {step === "PENDING_REVIEW" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="w-8 h-8 text-[#FF8A73] animate-spin" />
            <div>
              <p className="text-sm font-bold text-white">Awaiting confirmation</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-xs">
                We're verifying your payment
                {booking?.payment_reference && (
                  <> (ref: <span className="font-mono text-slate-300">{booking.payment_reference}</span>)</>
                )}
                . This page updates automatically once confirmed.
              </p>
            </div>
          </div>
        )}

        {/* ── PURCHASED ── */}
        {step === "PURCHASED" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <div>
              <p className="text-sm font-bold text-white">Payment confirmed!</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {deal?.title} is now yours. We'll follow up with next steps.
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
        {(step === "EXPIRED" || step === "CANCELLED") && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <XCircle className="w-10 h-10 text-rose-400" />
            <div>
              <p className="text-sm font-bold text-white">
                {step === "CANCELLED" ? "Lock cancelled" : "Lock expired"}
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
    </Modal>
  );
};
