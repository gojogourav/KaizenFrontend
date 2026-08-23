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

const stepsContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const stepItem = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const checklistContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const checklistItem = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export const HowItWorks: React.FC<{ onBrowseProperties: () => void }> = ({
  onBrowseProperties,
}) => (
  <div className="space-y-12 text-slate-100 max-w-6xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/5 rounded-3xl p-8 sm:p-10 border border-white/10 shadow-xl"
    >
      <div className="space-y-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-full border border-white/15"
        >
          <Sparkles className="w-4 h-4 text-[#E04F33]" aria-hidden="true" />
          <span className="text-[11px] font-bold text-[#FF8A73] uppercase tracking-widest font-mono">
            The Turnkey Acquisition Process
          </span>
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          How Kaizen Works for{" "}
          <span className="text-[#E04F33]">Turnkey Buyers</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          From discovering high-yield luxury villas to securing exclusive
          15-minute lease locks and instant key handovers, Kaizen streamlines
          every phase of turnkey property acquisition.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBrowseProperties}
          className="px-6 py-3 bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-[#E04F33]/25 flex items-center gap-2 font-mono"
        >
          <span>Browse Catalog Now</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </motion.button>
      </div>
    </motion.div>

    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-2"
      >
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E04F33]">
          Step-by-Step Guide
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          4 Steps to Lock & Own Your Turnkey Property
        </h2>
      </motion.div>
      <motion.ol
        variants={stepsContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none"
      >
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <motion.li
              key={step.num}
              variants={stepItem}
              whileHover={{ y: -4 }}
              className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-colors duration-300 space-y-4"
            >
              <div className="flex items-center justify-between">
                <motion.div
                  whileHover={{ rotate: 6, scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#E04F33]"
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </motion.div>
                <span
                  className="text-3xl font-black text-slate-700 font-mono"
                  aria-hidden="true"
                >
                  {step.num}
                </span>
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-[#FF8A73] text-[10px] font-mono font-bold mb-2 border border-white/15">
                  {step.badge}
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/5 rounded-3xl border border-white/10 p-8 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
    >
      <div className="lg:col-span-5 space-y-4">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E04F33] bg-white/10 px-3 py-1 rounded-full border border-white/15">
          Dedicated Customer Support
        </span>
        <h3 className="text-2xl font-extrabold text-white">
          Have Questions About a Turnkey Listing?
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Our property concierge team is available to assist buyers with lease
          specifications and walkthrough scheduling.
        </p>
        <motion.ul
          variants={checklistContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="space-y-3 pt-2 text-xs text-slate-300 font-mono list-none"
        >
          {[
            "Direct property owner approval guaranteed",
            "Comprehensive CGL & COI insurance setup",
            "24/7 dedicated guest concierge transition",
          ].map((line) => (
            <motion.li key={line} variants={checklistItem} className="flex items-center gap-2">
              <CheckCircle2
                className="w-4 h-4 text-emerald-500"
                aria-hidden="true"
              />
              <span>{line}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
      <div className="lg:col-span-7 bg-[#0B0A14] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-lg">
        <InquiryForm />
      </div>
    </motion.div>
  </div>
);
