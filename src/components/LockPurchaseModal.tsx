/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'LOCKED' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep('IDLE');
            setError('Property hold lock expired. Please initiate a new lock.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
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
      const bookingData = (res as any)?.booking || res;
      if (bookingData) {
        setBooking(bookingData);
        setTimeLeft(bookingData.lockDurationSeconds || 900);
        setStep('LOCKED');
      }
    } catch (err: any) {
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
      const bookingData = (res as any)?.booking || res;
      if (bookingData) {
        setBooking(bookingData);
        setStep('PURCHASED');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setStep('LOCKED');
    }
  };

  const handleCancelLock = async () => {
    const bookingId = booking?.id || booking?.bookingId;
    if (bookingId) {
      await api.cancelBooking(bookingId).catch(() => {});
    }
    setStep('IDLE');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-[#130723] border border-purple-800/80 rounded-3xl p-8 shadow-2xl shadow-purple-950/90 text-slate-100">
        
        {/* Close button */}
        <button
          onClick={handleCancelLock}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-purple-900/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-fuchsia-400 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-sans">
              Lock & Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Lease</span>
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

        {/* STEP IDLE: Confirm initiate lock */}
        {step === 'IDLE' && (
          <div className="space-y-6">
            <div className="bg-[#1e0a35] p-5 rounded-2xl border border-purple-900/60 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-mono">Price / Monthly Rent:</span>
                <span className="font-bold text-white">{deal.price ? `$${deal.price.toLocaleString()}/mo` : deal.monthlyRent}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Initiating a lock holds this property exclusively for <span className="text-fuchsia-300 font-bold">15 minutes</span> on Kaizen, preventing other buyers from taking the sublease agreement while you review.
            </p>

            <button
              onClick={handleInitiateLock}
              className="w-full py-4 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Initiate 15-Minute Exclusive Hold</span>
            </button>
          </div>
        )}

        {/* STEP LOCKING */}
        {step === 'LOCKING' && (
          <div className="py-12 text-center space-y-4">
            <Clock className="w-12 h-12 text-fuchsia-400 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-200">Securing exclusive property lock on Kaizen backend...</p>
          </div>
        )}

        {/* STEP LOCKED: Live Countdown & Purchase Trigger */}
        {step === 'LOCKED' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-950/80 to-purple-950/80 p-5 rounded-2xl border border-amber-500/40 text-center space-y-2">
              <span className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-widest block">
                Exclusive Hold Active
              </span>
              <div className="text-4xl font-black text-amber-200 font-mono tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <p className="text-[11px] text-slate-300">
                Booking ID: <span className="font-mono font-bold text-fuchsia-300">#{booking?.id || booking?.bookingId}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelLock}
                className="flex-1 py-3.5 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-slate-300 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Release Hold
              </button>
              <button
                onClick={handleCompletePurchase}
                className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 text-xs flex items-center justify-center gap-2 cursor-pointer"
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
                Congratulations! You have successfully secured the lease for <span className="text-fuchsia-300 font-bold">{deal.title}</span>.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-purple-900 hover:bg-purple-800 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
            >
              Close & View My Bookings
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
