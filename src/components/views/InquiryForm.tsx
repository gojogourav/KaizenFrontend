import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2 } from "lucide-react";
import { useInquiryForm } from "../../hooks/useInquiryForm";

export const InquiryForm: React.FC = () => {
  const { form, updateField, submitted, submitting, error, submit, reset } =
    useInquiryForm();

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="p-8 text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.1 }}
          className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-500/40"
        >
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </motion.div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
          Inquiry Received
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
          Thank you! Our property acquisition specialist will review your
          request and reach out shortly.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={reset}
          className="mt-4 px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-xl text-xs font-mono font-bold border border-slate-300 dark:border-white/20"
        >
          Submit Another Request
        </motion.button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-4 text-xs"
      noValidate
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            role="alert"
            className="p-3 bg-rose-950/80 border border-rose-500/50 text-rose-200 rounded-xl text-xs font-medium overflow-hidden"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="inq-name"
            className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 font-mono"
          >
            Your Name *
          </label>
          <input
            id="inq-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#141226] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#E04F33] transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="inq-email"
            className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 font-mono"
          >
            Email Address *
          </label>
          <input
            id="inq-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#141226] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#E04F33] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="inq-intent"
            className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 font-mono"
          >
            Primary Goal / Intent *
          </label>
          <select
            id="inq-intent"
            value={form.intent}
            onChange={(e) => updateField("intent", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#141226] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono transition-colors"
          >
            <option value="Acquire Turnkey Lease Deal">
              Acquire Turnkey Lease Deal
            </option>
            <option value="Book Luxury Villa Stay">
              Book Luxury Villa Stay
            </option>
            <option value="Property Sublease Inquiry">
              Property Sublease Inquiry
            </option>
            <option value="Custom Concierge Request">
              Custom Concierge Request
            </option>
          </select>
        </div>
        <div>
          <label
            htmlFor="inq-market"
            className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 font-mono"
          >
            Preferred Market
          </label>
          <select
            id="inq-market"
            value={form.preferredMarket}
            onChange={(e) => updateField("preferredMarket", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#141226] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono transition-colors"
          >
            <option value="Pensacola, FL">Pensacola, FL</option>
            <option value="Scottsdale, AZ">Scottsdale, AZ</option>
            <option value="Blue Ridge, GA">Blue Ridge, GA</option>
            <option value="Other Market">Other Market</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="inq-message"
          className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 font-mono"
        >
          Message / Specific Questions
        </label>
        <textarea
          id="inq-message"
          rows={3}
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white dark:bg-[#141226] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#E04F33] transition-colors"
        />
      </div>

      <motion.button
        whileHover={{ scale: submitting ? 1 : 1.02 }}
        whileTap={{ scale: submitting ? 1 : 0.98 }}
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-[#E04F33]/25 flex items-center justify-center gap-2 font-mono disabled:opacity-50"
      >
        <Send className="w-4 h-4" aria-hidden="true" />
        {submitting ? "Submitting…" : "Submit Acquisition Inquiry"}
      </motion.button>
    </form>
  );
};
