import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

interface LockPurchaseModalProps {
  isOpen: boolean;
  deal: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const LockPurchaseModal: React.FC<LockPurchaseModalProps> = ({ isOpen, deal, onClose, onSuccess }) => {
  const [step, setStep] = useState<'IDLE' | 'LOCKING' | 'LOCKED' | 'PURCHASING' | 'PURCHASED'>('IDLE');
  const [booking, setBooking] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes in seconds
  const [error, setError] = useState('');

  const expirationTimeRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (step === 'LOCKED') {
      // Set absolute expiration time only once when locked
      if (!expirationTimeRef.current) {
        expirationTimeRef.current = Date.now() + (timeLeft * 1000);
      }

      timer = setInterval(() => {
        if (!expirationTimeRef.current) return;

        const remaining = Math.max(0, Math.floor((expirationTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
          setStep('IDLE');
          setError('Property hold lock expired. Please initiate a new lock.');
          expirationTimeRef.current = null;
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, timeLeft]);

  if (!isOpen || !deal) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInitiateLock = async () => {
    setError('');
    setStep('LOCKING');
    try {
      const res = await api.lockProperty(deal.id);
      if (!isMounted.current) return;
      const bookingData = (res as any)?.booking || res;
      if (bookingData) {
        setBooking(bookingData);
        setTimeLeft(bookingData.lockDurationSeconds || 900);
        expirationTimeRef.current = Date.now() + ((bookingData.lockDurationSeconds || 900) * 1000);
        setStep('LOCKED');
      }
    } catch (err: any) {
      if (!isMounted.current) return;
      setError(err.message || 'Failed to lock property');
      setStep('IDLE');
    }
  };

  const handleCompletePurchase = async () => {
    const bookingId = booking?.id || booking?.bookingId;
    if (!bookingId) return;

    setError('');
    setStep('PURCHASING');
    try {
      const res = await api.purchaseProperty(bookingId);
      if (!isMounted.current) return;

      const bookingData = (res as any)?.booking || res;
      if (bookingData) {
        setBooking(bookingData);
        setStep('PURCHASED');
        onSuccess();
      }
    } catch (err: any) {
      if (!isMounted.current) return;
      setError(err.message || 'Transaction failed');
      setStep('LOCKED');
    }
  };

  const handleCancelLock = async () => {
    const bookingId = booking?.id || booking?.bookingId;
    if (bookingId) {
      // Fire and forget cancellation - no need to await or handle state since we are closing
      api.cancelBooking(bookingId).catch(() => {});
    }

    // Reset state and close immediately for a snappy UI
    expirationTimeRef.current = null;
    setStep('IDLE');
    setTimeLeft(900);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-[#0F1014]/90 backdrop-blur-3xl border border-white/15 rounded-3xl p-8 shadow-2xl shadow-black/80 text-slate-100 apple-specular">

        <button
          onClick={handleCancelLock}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-[#E04F33] shrink-0 backdrop-blur-xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-sans">
              Lock & Secure <span className="text-[#FF8A73]">Lease</span>
            </h2>
            <p className="text-xs text-slate-400 font-sans">{deal.title} • {deal.city ? `${deal.city}, ${deal.state}` : deal.location}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP IDLE */}
        {step === 'IDLE' && (
          <div className="space-y-6">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3 backdrop-blur-xl">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-mono">Price / Monthly Rent:</span>
                <span className="font-bold text-white">{deal.price ? `$${deal.price.toLocaleString()}/mo` : deal.monthlyRent}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Initiating a lock holds this property exclusively for <span className="text-[#FF8A73] font-bold">15 minutes</span> on Kaizen, preventing other buyers from taking the sublease agreement while you review.
            </p>

            <button
              onClick={handleInitiateLock}
              className="w-full py-4 bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-2xl shadow-lg shadow-[#E04F33]/25 border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Initiate 15-Minute Exclusive Hold</span>
            </button>
          </div>
        )}

        {/* STEP LOCKING */}
        {step === 'LOCKING' && (
          <div className="py-12 text-center space-y-4">
            <Clock className="w-12 h-12 text-[#FF8A73] animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-200">Securing exclusive property lock on Kaizen backend...</p>
          </div>
        )}

        {/* STEP LOCKED */}
        {step === 'LOCKED' && (
          <div className="space-y-6">
            <div className="bg-white/5 p-5 rounded-2xl border border-amber-500/40 text-center space-y-2 backdrop-blur-xl">
              <span className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-widest block">
                Exclusive Hold Active
              </span>
              <div className="text-4xl font-black text-amber-200 font-mono tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <p className="text-[11px] text-slate-300">
                Booking ID: <span className="font-mono font-bold text-[#FF8A73]">#{booking?.id || booking?.bookingId}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelLock}
                className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Release Hold
              </button>
              <button
                onClick={handleCompletePurchase}
                className="flex-[2] py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl border border-white/20 shadow-lg shadow-emerald-600/30 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Complete Lease Purchase</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP PURCHASING */}
        {step === 'PURCHASING' && (
          <div className="py-12 text-center space-y-4">
            <Clock className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-200">Executing lease purchase transaction on Kaizen API...</p>
          </div>
        )}

        {/* STEP PURCHASED */}
        {step === 'PURCHASED' && (
          <div className="py-6 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-950 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-950/80">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white font-sans">Lease Purchase Secured!</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Congratulations! You have successfully secured the lease for <span className="text-[#FF8A73] font-bold">{deal.title}</span>.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer border border-white/20"
            >
              Close & View My Bookings
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
