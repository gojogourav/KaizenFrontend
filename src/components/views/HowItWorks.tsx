import React from "react";
import { motion } from "motion/react";
import {
  Building,
  Lock,
  ShieldCheck,
  Key,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { InquiryForm } from "./InquiryForm";
import { useTheme } from "../../context/ThemeContext";

const STEPS = [
  {
    num: "01",
    icon: Building,
    title: "Browse & Select Verified Property",
    desc: "Explore our catalog of vetted luxury villas with transparent financial metrics and live platform links.",
    badge: "Transparent Specs",
  },
  {
    num: "02",
    icon: Lock,
    title: "Initiate 15-Minute Hold Lock",
    desc: "Place an exclusive 15-minute hold, preventing other buyers from taking the deal while you inspect lease terms.",
    badge: "Exclusive Hold",
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "Sign Agreement & Submit Deposit",
    desc: "Complete identity verification, sign the lease addendum, and submit the required security deposit with CGL coverage.",
    badge: "Secure Verification",
  },
  {
    num: "04",
    icon: Key,
    title: "Receive Keys & Start Generating Yield",
    desc: "Gain instant access, keyless lock codes, and direct listing control. Start capturing net monthly profit immediately.",
    badge: "Instant Handover",
  },
];

export const HowItWorks: React.FC<{ onBrowseProperties: () => void }> = ({
  onBrowseProperties,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Banner Box */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={`rounded-3xl p-8 sm:p-10 border shadow-xl transition-colors ${
          isDark
            ? "bg-slate-900/80 border-slate-800 shadow-slate-950/40"
            : "bg-white border-slate-200 shadow-slate-200/50"
        }`}
      >
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">
              The Turnkey Acquisition Process
            </span>
          </div>
          <h1
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            How Kaizen Works for{" "}
            <span className="text-blue-600 dark:text-blue-400">Turnkey Buyers</span>
          </h1>
          <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            From discovering high-yield luxury villas to securing exclusive
            15-minute lease locks and instant key handovers, Kaizen streamlines
            every phase of turnkey property acquisition.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBrowseProperties}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 flex items-center gap-2 font-mono cursor-pointer transition-all"
          >
            <span>Browse Catalog Now</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </motion.button>
        </div>
      </motion.div>

      {/* Steps List */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Step-by-Step Guide
          </span>
          <h2
            className={`text-2xl sm:text-3xl font-extrabold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            4 Steps to Lock & Own Your Turnkey Property
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                whileHover={{ y: -4 }}
                className={`p-8 rounded-3xl border transition-all space-y-4 ${
                  isDark
                    ? "bg-slate-900/70 border-slate-800 hover:border-blue-500/40"
                    : "bg-white border-slate-200 hover:border-blue-400 shadow-slate-200/50 shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-blue-400"
                        : "bg-blue-50 border-blue-100 text-blue-600"
                    }`}
                  >
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <span
                    className={`text-3xl font-black font-mono ${
                      isDark ? "text-slate-700" : "text-slate-300"
                    }`}
                    aria-hidden="true"
                  >
                    {step.num}
                  </span>
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold mb-2 border border-blue-500/20">
                    {step.badge}
                  </span>
                  <h3
                    className={`text-lg font-extrabold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-xs mt-2 leading-relaxed ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Support / Inquiry box */}
      <div
        className={`rounded-3xl border p-8 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
          isDark
            ? "bg-slate-900/80 border-slate-800 shadow-slate-950/40"
            : "bg-white border-slate-200 shadow-slate-200/50"
        }`}
      >
        <div className="lg:col-span-5 space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Dedicated Customer Support
          </span>
          <h3
            className={`text-2xl font-extrabold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Have Questions About a Turnkey Listing?
          </h3>
          <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Our property concierge team is available to assist buyers with lease
            specifications and walkthrough scheduling.
          </p>
          <ul className="space-y-3 pt-2 text-xs font-mono">
            {[
              "Direct property owner approval guaranteed",
              "Comprehensive CGL & COI insurance setup",
              "24/7 dedicated guest concierge transition",
            ].map((line) => (
              <li key={line} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                <span className={isDark ? "text-slate-300" : "text-slate-700"}>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div
          className={`lg:col-span-7 p-6 sm:p-8 rounded-2xl border ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}
        >
          <InquiryForm />
        </div>
      </div>
    </div>
  );
};
