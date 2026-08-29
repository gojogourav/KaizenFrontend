import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Building,
  Lock,
  ShieldCheck,
  Key,
  ArrowRight,
  Sparkles,
  Star,
  Search,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Heart,
  Users,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { PropertyCard } from "../property/PropertyCard";
import type { Property } from "../../types/database";

interface LandingPageProps {
  onBrowseProperties: (filters?: any) => void;
  onHowItWorks: () => void;
  onSelectDeal: (deal: Property) => void;
  onRateDeal: (deal: Property) => void;
  properties: Property[];
  favorites: any[];
  onToggleFavorite: (id: string | number, e?: React.MouseEvent) => void;
}

const ADVANTAGES = [
  {
    icon: Lock,
    title: "15-Minute Exclusive Hold Lock",
    description:
      "Instantly freeze competing buyers from taking a deal while you inspect lease terms and projected ADR analytics.",
    tag: "Exclusive Protection",
  },
  {
    icon: TrendingUp,
    title: "Verified Yield & Occupancy Projections",
    description:
      "All listings feature audited monthly rent, average daily rates (ADR), and verified historical occupancy metrics.",
    tag: "Financial Clarity",
  },
  {
    icon: Key,
    title: "Instant Keyless Turnkey Handover",
    description:
      "Gain direct control with smart keyless lock codes and synchronized live listings on Airbnb, Vrbo, and Zillow.",
    tag: "Seamless Operations",
  },
  {
    icon: ShieldCheck,
    title: "Pre-Verified Legal Addendums",
    description:
      "Standardized sublease addendums and comprehensive CGL insurance coverage built directly into every deal.",
    tag: "Risk Mitigation",
  },
];

const TESTIMONIALS = [
  {
    name: "Marcus Vance",
    role: "Portfolio Manager",
    location: "Scottsdale, AZ",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    quote: "Kaizen allowed me to secure 3 turnkey luxury villas in under a week. The 15-minute hold lock gives peace of mind before signing.",
    rating: 5,
    yield: "+24.8% Net Yield",
  },
  {
    name: "Elena Rostova",
    role: "Turnkey Host & Buyer",
    location: "Pensacola, FL",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    quote: "The rating system and host bio transparency are game changers. I knew exactly what I was acquiring before laying down a deposit.",
    rating: 5,
    yield: "$6.2K/mo Net Profit",
  },
  {
    name: "David Sterling",
    role: "Real Estate Investor",
    location: "Miami, FL",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    quote: "Sleek interface, instant walkthrough schedules, and immediate key handover. Kaizen is the gold standard for real estate arbitrage.",
    rating: 5,
    yield: "100% Verified",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onBrowseProperties,
  onHowItWorks,
  onSelectDeal,
  onRateDeal,
  properties,
  favorites,
  onToggleFavorite,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Search Bar State
  const [cityFilter, setCityFilter] = useState("");
  const [bedsFilter, setBedsFilter] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBrowseProperties({
      city: cityFilter,
      bedrooms: bedsFilter ? Number(bedsFilter) : undefined,
    });
  };

  const DEFAULT_FEATURED: any[] = [
    {
      id: "featured-1",
      title: "The Glass Pavilion & Infinity Estate",
      city: "Pensacola",
      state: "FL",
      price: 4500,
      bedrooms: 4,
      bathrooms: 4,
      squareFeet: 3400,
      rating: 4.98,
      reviewCount: 42,
      bio: "Panoramic gulf coast views with heated infinity pool, smart keyless access, and verified 98% occupancy rate.",
      images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"],
      status: "AVAILABLE",
    },
    {
      id: "featured-2",
      title: "Scottsdale Desert Oasis Villa",
      city: "Scottsdale",
      state: "AZ",
      price: 5200,
      bedrooms: 5,
      bathrooms: 5,
      squareFeet: 4200,
      rating: 4.96,
      reviewCount: 38,
      bio: "Ultra-luxury desert retreat with outdoor chef's kitchen, private spa, and synchronized Airbnb & Vrbo listings.",
      images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"],
      status: "AVAILABLE",
    },
    {
      id: "featured-3",
      title: "Blue Ridge Mountain Sanctuary",
      city: "Blue Ridge",
      state: "GA",
      price: 3800,
      bedrooms: 3,
      bathrooms: 3,
      squareFeet: 2800,
      rating: 4.94,
      reviewCount: 29,
      bio: "High-yield luxury timber cabin featuring hot tub deck, floor-to-ceiling windows, and complete turnkey furnishings.",
      images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"],
      status: "AVAILABLE",
    },
  ];

  const featuredProperties = properties && properties.length > 0 ? properties.slice(0, 3) : DEFAULT_FEATURED;
  const favoriteIds = new Set(favorites.map((f) => f.property?.id || f.id));

  return (
    <div className="space-y-16 sm:space-y-24 max-w-7xl mx-auto px-2 sm:px-4">
      {/* HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 pb-8 overflow-hidden">
        {/* Glow background elements */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-40 transition-colors ${
            isDark ? "bg-blue-600/30" : "bg-blue-400/20"
          }`}
        />

        <div className="relative z-10 space-y-8 text-center max-w-4xl mx-auto">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              Next-Gen Turnkey Real Estate Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] font-serif ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Acquire &amp; Monetize{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500">
              Turnkey Luxury Properties
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-base sm:text-lg leading-relaxed max-w-2xl mx-auto ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Discover vetted luxury villas with transparent financials, host bios,
            and exclusive 15-minute hold locks. Instant keyless handover ready
            for high monthly yield.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <button
              onClick={() => onBrowseProperties()}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm uppercase tracking-wider shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 font-mono transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Explore Villa Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onHowItWorks}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl border text-sm font-bold font-mono transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                isDark
                  ? "bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-md"
              }`}
            >
              How It Works
            </button>
          </motion.div>

          {/* Quick Search Widget */}
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onSubmit={handleSearchSubmit}
            className={`p-3 sm:p-4 rounded-3xl border shadow-2xl max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-3 transition-colors ${
              isDark
                ? "bg-slate-900/90 border-slate-800 shadow-slate-950/60 apple-specular"
                : "bg-white border-slate-200 shadow-slate-300/50"
            }`}
          >
            <div className="sm:col-span-5 relative">
              <MapPin className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search city (e.g. Pensacola, Scottsdale)..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className={`w-full pl-10 pr-3 py-3 border rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={bedsFilter}
                onChange={(e) => setBedsFilter(e.target.value)}
                className={`w-full px-3 py-3 border rounded-2xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                <option value="">Any Bedrooms</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full h-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs font-mono uppercase tracking-wider shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Search className="w-4 h-4" />
                Find Deals
              </button>
            </div>
          </motion.form>

          {/* Stats Counters Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-4xl mx-auto">
            {[
              { label: "Listed Asset Value", value: "$12.4M+" },
              { label: "Avg Occupancy Rate", value: "98.2%" },
              { label: "Hold Lock Time", value: "15 Mins" },
              { label: "Community Rating", value: "4.95 ★" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isDark
                    ? "bg-slate-900/60 border-slate-800/80"
                    : "bg-white/80 border-slate-200 shadow-sm"
                }`}
              >
                <p className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                  {stat.value}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES SHOWCASE */}
      {featuredProperties.length > 0 && (
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Hand-Picked Opportunities
              </span>
              <h2
                className={`text-2xl sm:text-3xl font-extrabold font-serif mt-1 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Featured Turnkey Properties
              </h2>
            </div>
            <button
              onClick={() => onBrowseProperties()}
              className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((deal) => (
              <PropertyCard
                key={deal.id}
                deal={deal}
                isFavorite={favoriteIds.has(deal.id)}
                onToggleFavorite={onToggleFavorite}
                onOpenProspectus={() => onSelectDeal(deal)}
                onRate={() => onRateDeal(deal)}
              />
            ))}
          </div>
        </section>
      )}

      {/* WHY KAIZEN ADVANTAGES */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Built for Serious Investors
          </span>
          <h2
            className={`text-2xl sm:text-4xl font-extrabold font-serif ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Why Buyers Choose Kaizen
          </h2>
          <p className={`text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            We bridge the gap between luxury property owners and turnkey buyers with transparent metrics and automated hold guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADVANTAGES.map((adv, idx) => {
            const Icon = adv.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between space-y-4 transition-all duration-300 ${
                  isDark
                    ? "bg-slate-900/70 border-slate-800 hover:border-blue-500/40 shadow-slate-950/40"
                    : "bg-white border-slate-200 hover:border-blue-400 shadow-slate-200/50 shadow-lg"
                }`}
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold border border-blue-500/20">
                    {adv.tag}
                  </span>
                  <h3
                    className={`text-base font-extrabold font-serif ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {adv.title}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {adv.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS & COMMUNITY RATINGS */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Verified Experiences
          </span>
          <h2
            className={`text-2xl sm:text-3xl font-extrabold font-serif ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            What Buyers &amp; Hosts Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between space-y-4 ${
                isDark
                  ? "bg-slate-900/70 border-slate-800"
                  : "bg-white border-slate-200 shadow-md"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p
                  className={`text-xs italic leading-relaxed ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-blue-500/30"
                  />
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {t.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {t.role} • {t.location}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {t.yield}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section
        className={`rounded-3xl p-8 sm:p-12 border shadow-2xl text-center space-y-6 relative overflow-hidden ${
          isDark
            ? "bg-slate-900/90 border-slate-800 shadow-slate-950/60"
            : "bg-white border-slate-200 shadow-slate-300/50"
        }`}
      >
        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20">
            Start Your Acquisition Today
          </span>
          <h2
            className={`text-3xl sm:text-4xl font-black font-serif ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Ready to Lock Your Next Turnkey Property?
          </h2>
          <p className={`text-xs sm:text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Browse our current inventory of luxury villas or connect with our concierge team to schedule a walkthrough.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onBrowseProperties()}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm uppercase tracking-wider shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 font-mono transition-all cursor-pointer"
            >
              <span>Explore Catalog Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
