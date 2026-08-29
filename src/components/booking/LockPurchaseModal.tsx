import React, { useEffect, useState } from "react";
import { Clock, ExternalLink, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Modal } from "../common/Modal";
import { useLockPurchase } from "../../hooks/useLockPurchase";
import { useTheme } from "../../context/ThemeContext";
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          {deal?.title}
        </p>

        {error && (
          <div className="flex items-start gap-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* LOCKING */}
        {step === "LOCKING" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold">
              Locking this property for you...
            </p>
          </div>
        )}

        {/* LOCKED: countdown + PayPal link + reference form */}
        {step === "LOCKED" && booking && (
          <div className="space-y-4">
            <div
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl border ${
                isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-blue-50/70 border-blue-100"
              }`}
            >
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span
                className={`text-2xl font-mono font-bold tabular-nums ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-slate-500 font-mono ml-1">remaining</span>
            </div>

            {booking.payment_link && (
              <a
                href={booking.payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/25"
              >
                Pay with PayPal
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <div className={`pt-3 border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                After paying, paste the PayPal transaction ID / reference from your receipt below.
              </p>
              <form onSubmit={handleSubmitReference} className="space-y-3">
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. 8AB123456C789012D"
                  className={`w-full px-4 py-2.5 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
                <button
                  type="submit"
                  disabled={submitting || reference.trim().length < 3}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Submitting..." : "I've paid — submit for review"}
                </button>
              </form>
            </div>

            <button
              onClick={handleClose}
              className="w-full text-center text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
            >
              Cancel this lock
            </button>
          </div>
        )}

        {/* PENDING REVIEW */}
        {step === "PENDING_REVIEW" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            <div>
              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Awaiting confirmation
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-xs">
                We're verifying your payment
                {booking?.payment_reference && (
                  <> (ref: <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{booking.payment_reference}</span>)</>
                )}
                . This page updates automatically once confirmed.
              </p>
            </div>
          </div>
        )}

        {/* PURCHASED */}
        {step === "PURCHASED" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <div>
              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Payment confirmed!
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {deal?.title} is now yours. We'll follow up with next steps.
              </p>
            </div>
            <button
              onClick={onClose}
              className={`mt-2 px-5 py-2 border rounded-xl text-xs font-bold transition-all ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
              }`}
            >
              Close
            </button>
          </div>
        )}

        {/* EXPIRED / CANCELLED */}
        {(step === "EXPIRED" || step === "CANCELLED") && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <XCircle className="w-10 h-10 text-rose-500" />
            <div>
              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {step === "CANCELLED" ? "Lock cancelled" : "Lock expired"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                This property is available again — you're welcome to lock it once more.
              </p>
            </div>
            <button
              onClick={onClose}
              className={`mt-2 px-5 py-2 border rounded-xl text-xs font-bold transition-all ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
              }`}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
