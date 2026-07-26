/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, 
  Lock, 
  ShieldCheck, 
  Key, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Send, 
  HelpCircle,
  Sparkles,
  DollarSign
} from 'lucide-react';

export const HowItWorks: React.FC<{ onBrowseProperties: () => void }> = ({ onBrowseProperties }) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    intent: 'Acquire Turnkey Lease Deal',
    preferredMarket: 'Pensacola, FL',
    message: ''
  });

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const STEPS = [
    {
      num: '01',
      icon: Building,
      title: 'Browse & Select Verified Property',
      desc: 'Explore our catalog of vetted luxury villas with transparent financial metrics, Airbtics revenue benchmarks, and live platform links (Airbnb, Vrbo, Booking.com).',
      badge: 'Transparent Specs'
    },
    {
      num: '02',
      icon: Lock,
      title: 'Initiate 15-Minute Hold Lock',
      desc: 'Click "Lock & Secure Property" to place an exclusive 15-minute hold. This prevents other buyers from taking the deal while you inspect lease terms and specs.',
      badge: 'Exclusive Hold'
    },
    {
      num: '03',
      icon: ShieldCheck,
      title: 'Sign Agreement & Submit Security Deposit',
      desc: 'Complete identity verification, sign the corporate lease addendum, and submit the required security deposit with CGL insurance coverage.',
      badge: 'Secure Verification'
    },
    {
      num: '04',
      icon: Key,
      title: 'Receive Keys & Start Generating Yield',
      desc: 'Gain instant access, keyless lock codes, guest concierge systems, and direct listing control. Start operating and capturing net monthly profit immediately.',
      badge: 'Instant Handover'
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in font-sans text-slate-900 dark:text-slate-100 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-card bg-white/80 dark:bg-white/5 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-2xl relative overflow-hidden apple-specular">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E04F33]/10 dark:bg-white/10 rounded-full border border-[#E04F33]/20 dark:border-white/15">
            <Sparkles className="w-4 h-4 text-[#E04F33]" />
            <span className="text-[11px] font-bold text-[#E04F33] dark:text-[#FF8A73] uppercase tracking-widest font-mono">
              The Turnkey Acquisition Process
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif tracking-tight leading-tight">
            How Kaizen Works for <span className="text-[#E04F33]">Turnkey Buyers</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            From discovering high-yield luxury villas to securing exclusive 15-minute lease locks and instant key handovers, Kaizen streamlines every phase of turnkey property acquisition.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onBrowseProperties}
              className="px-6 py-3 bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#E04F33]/25 flex items-center gap-2 font-mono cursor-pointer"
            >
              <span>Browse Catalog Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Step Timeline Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E04F33]">Step-by-Step Guide</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif">4 Steps to Lock & Own Your Turnkey Property</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STEPS.map((step) => {
            const IconComp = step.icon;
            return (
              <div 
                key={step.num}
                className="glass-card bg-white/70 dark:bg-white/5 p-8 rounded-3xl border border-slate-200/70 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 space-y-4 relative group apple-specular"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 flex items-center justify-center text-[#E04F33] group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-300 dark:text-slate-700 font-mono group-hover:text-[#E04F33] transition-colors">
                    {step.num}
                  </span>
                </div>

                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E04F33]/10 dark:bg-white/10 text-[#E04F33] dark:text-[#FF8A73] text-[10px] font-mono font-bold mb-2 border border-[#E04F33]/20 dark:border-white/15">
                    {step.badge}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-serif">{step.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Lead Generation & Inquiry Form */}
      <div className="glass-card bg-white/80 dark:bg-white/5 rounded-3xl border border-slate-200/80 dark:border-white/10 p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center apple-specular">
        
        <div className="lg:col-span-5 space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E04F33] bg-[#E04F33]/10 dark:bg-white/10 px-3 py-1 rounded-full border border-[#E04F33]/20 dark:border-white/15">
            Dedicated Customer Support
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif">
            Have Questions About a Turnkey Listing?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Our property concierge team is available to assist buyers with lease specifications, walkthrough scheduling, or custom acquisition requirements.
          </p>

          <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Direct property owner approval guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Comprehensive CGL & COI insurance setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>24/7 dedicated guest concierge transition</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-50/90 dark:bg-[#0B0A14] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
          {formSubmitted ? (
            <div className="p-8 text-center space-y-4 animate-scale-in">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-500/40">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white font-serif">Inquiry Received</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                Thank you! Our property acquisition specialist will review your request and reach out shortly with detailed property specs and walkthrough details.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-4 px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-xl text-xs font-mono font-bold border border-slate-300 dark:border-white/20 cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitInquiry} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 font-mono">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#141226] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#E04F33]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 font-mono">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@domain.com"
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#141226] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#E04F33]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 font-mono">Primary Goal / Intent *</label>
                  <select
                    value={inquiryForm.intent}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, intent: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#141226] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono"
                  >
                    <option value="Acquire Turnkey Lease Deal">Acquire Turnkey Lease Deal</option>
                    <option value="Book Luxury Villa Stay">Book Luxury Villa Stay</option>
                    <option value="Property Sublease Inquiry">Property Sublease Inquiry</option>
                    <option value="Custom Concierge Request">Custom Concierge Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 font-mono">Preferred Market</label>
                  <select
                    value={inquiryForm.preferredMarket}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, preferredMarket: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#141226] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono"
                  >
                    <option value="Pensacola, FL">Pensacola, FL</option>
                    <option value="Scottsdale, AZ">Scottsdale, AZ</option>
                    <option value="Blue Ridge, GA">Blue Ridge, GA</option>
                    <option value="Other Market">Other Market</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 font-mono">Message / Specific Questions</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your target timeline or specific property requirements..."
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#141226] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#E04F33]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#E04F33]/25 flex items-center justify-center gap-2 font-mono cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Acquisition Inquiry</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
