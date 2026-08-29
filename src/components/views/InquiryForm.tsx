import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2 } from "lucide-react";
import { useInquiryForm } from "../../hooks/useInquiryForm";
import { useTheme } from "../../context/ThemeContext";

export const InquiryForm: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
          className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30"
        >
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </motion.div>
        <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          Inquiry Received
        </h4>
        <p className={`text-xs leading-relaxed max-w-md mx-auto ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          Thank you! Our property acquisition specialist will review your
          request and reach out shortly.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={reset}
          className={`mt-4 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
            isDark
              ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
              : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
          }`}
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
            className="p-3 bg-rose-500/15 border border-rose-500/40 text-rose-500 rounded-xl text-xs font-medium overflow-hidden"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="inq-name"
            className="block font-bold text-slate-400 uppercase mb-1 font-mono"
          >
            Your Name *
          </label>
          <input
            id="inq-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500"
                : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>
        <div>
          <label
            htmlFor="inq-email"
            className="block font-bold text-slate-400 uppercase mb-1 font-mono"
          >
            Email Address *
          </label>
          <input
            id="inq-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500"
                : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="inq-intent"
            className="block font-bold text-slate-400 uppercase mb-1 font-mono"
          >
            Primary Goal / Intent *
          </label>
          <select
            id="inq-intent"
            value={form.intent}
            onChange={(e) => updateField("intent", e.target.value)}
            className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-colors cursor-pointer ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
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
            className="block font-bold text-slate-400 uppercase mb-1 font-mono"
          >
            Preferred Market
          </label>
          <select
            id="inq-market"
            value={form.preferredMarket}
            onChange={(e) => updateField("preferredMarket", e.target.value)}
            className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-colors cursor-pointer ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
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
          className="block font-bold text-slate-400 uppercase mb-1 font-mono"
        >
          Message / Specific Questions
        </label>
        <textarea
          id="inq-message"
          rows={3}
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            isDark
              ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500"
              : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
          }`}
        />
      </div>

      <motion.button
        whileHover={{ scale: submitting ? 1 : 1.02 }}
        whileTap={{ scale: submitting ? 1 : 0.98 }}
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 font-mono disabled:opacity-50 cursor-pointer transition-all"
      >
        <Send className="w-4 h-4" aria-hidden="true" />
        {submitting ? "Submitting…" : "Submit Acquisition Inquiry"}
      </motion.button>
    </form>
  );
};
