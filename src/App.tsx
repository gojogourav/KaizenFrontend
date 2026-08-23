import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Award
} from "lucide-react";

import { useAuth } from "./context/AuthContext";

import { AuthModal } from "./components/auth/AuthModal";
import { LockPurchaseModal } from "./components/booking/LockPurchaseModal";
import { PropertyProspectusModal } from "./components/property/PropertyProspectusModal";

import { DashboardView as Dashboard } from "./components/views/Dashboard";
import { FavoritesView as FavoriteView } from "./components/views/FavoriteView";
import { BookingsView } from "./components/views/BookingsView";
import { HowItWorks } from "./components/views/HowItWorks";
import { PropertiesView } from "./components/views/PropertiesView";

import { AdminLayout } from "./components/admin/AdminLayout";

export type TabType =
  | "properties"
  | "how-it-works"
  | "blogs"
  | "stories"
  | "experiences"
  | "about"
  | "dashboard"
  | "favorites"
  | "bookings"
  | "admin";

const DESKTOP_NAV: { key: TabType; label: string; authOnly?: boolean }[] = [
  { key: "properties", label: "Properties" },
  { key: "how-it-works", label: "How It Works" },
  { key: "experiences", label: "Experience" },
  { key: "about", label: "About" },
  { key: "dashboard", label: "Dashboard", authOnly: true },
  { key: "bookings", label: "My Locks", authOnly: true },
];

export default function App() {
  const { user, logout, favorites } = useAuth();
  const isAuthenticated = !!user;

  // Zero-JS First Paint Hybrid Splash State
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFading(true);
      const removeTimer = setTimeout(() => {
        setShowSplash(false);
      }, 450);
      return () => clearTimeout(removeTimer);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  const [activeTab, setActiveTab] = useState<TabType>("properties");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  const [showLockPurchaseModal, setShowLockPurchaseModal] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [pendingTab, setPendingTab] = useState<TabType | null>(null);

  const isAdmin = Boolean(
    user?.is_staff ||
    user?.is_superuser ||
    user?.username === "admin" ||
    user?.email === "admin@kaizen.com",
  );

  const triggerNotification = (
    message: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const requireAuth = (onAuthSuccess: () => void, targetTabName?: TabType) => {
    if (isAuthenticated) {
      onAuthSuccess();
    } else {
      setPendingAction(() => onAuthSuccess);
      if (targetTabName) setPendingTab(targetTabName);
      setShowAuthModal(true);
      triggerNotification("Please sign in to proceed.", "info");
    }
  };

  useEffect(() => {
    const handleLocationCheck = () => {
      const hash = window.location.hash;
      if (hash === "#admin" || activeTab === "admin") {
        if (!isAuthenticated) {
          setActiveTab("properties");
          window.location.hash = "";
          setPendingTab("admin");
          setShowAuthModal(true);
          triggerNotification("Admin Area Protected: Please sign in.", "info");
        } else if (!isAdmin) {
          setActiveTab("properties");
          window.location.hash = "";
          triggerNotification(
            "403 Access Denied: Admin privileges required.",
            "error",
          );
        } else {
          setActiveTab("admin");
        }
      }
    };
    handleLocationCheck();
    window.addEventListener("hashchange", handleLocationCheck);
    return () => window.removeEventListener("hashchange", handleLocationCheck);
  }, [isAuthenticated, isAdmin, activeTab]);

  if (activeTab === "admin") {
    return (
      <AdminLayout
        onExitAdmin={() => {
          setActiveTab("properties");
          window.location.hash = "";
        }}
      />
    );
  }

  const notificationStyles: Record<string, string> = {
    success: "bg-[#121124]/90 border-emerald-500/40 text-emerald-300",
    error: "bg-[#121124]/90 border-red-500/40 text-red-300",
    info: "bg-[#121124]/90 border-[#E04F33]/40 text-slate-200",
  };

  return (
    <div className="min-h-screen bg-[#0F1014] text-slate-100 font-sans flex flex-col relative selection:bg-[#E04F33] selection:text-white">

      {/* 1. Ambient Mesh Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#0F1014]" />
        <motion.div
          className="absolute -top-[12%] -left-[12%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full bg-[#E04F33]/15 blur-[120px]"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-[12%] -right-[12%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-slate-800/30 blur-[140px]"
          animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute top-[35%] right-[10%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-slate-700/20 blur-[130px] pointer-events-none" />
      </div>

      {/* 2. Zero-JS First Paint Hybrid Splash Overlay */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-[9999] bg-[#0F1014] flex flex-col items-center justify-center p-6 ${
            splashFading ? 'animate-splash-fade-out' : 'opacity-100'
          }`}
        >
          <div className="relative flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#E04F33] p-0.5 shadow-2xl shadow-[#E04F33]/30 border border-white/20 animate-kaizen-logo flex items-center justify-center">
              <span className="text-white font-extrabold text-2xl font-sans">改</span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-heading font-extrabold tracking-[0.25em] text-white uppercase">
                KAIZEN ESTATES
              </h2>
              <p className="text-[10px] font-mono text-[#E04F33] uppercase tracking-[0.3em] font-bold">
                Bespoke Luxury Stays
              </p>
            </div>

            <div className="w-48 h-1 bg-black/40 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#E04F33] rounded-full animate-kaizen-bar" />
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.message}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={`fixed top-4 right-4 z-50 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl ${notificationStyles[notification.type]}`}
          >
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
            </span>
            <p className="text-xs font-bold tracking-wide uppercase font-mono">
              {notification.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-xl shadow-apple-glass apple-specular">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab("properties")}
          >
            <motion.div
              whileHover={{ rotate: 6, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-10 h-10 bg-[#E04F33] rounded-lg flex items-center justify-center shadow-lg shadow-[#E04F33]/25 border border-white/20"
            >
              <span className="text-white font-extrabold text-base font-sans">改</span>
            </motion.div>
            <div>
              <span className="font-extrabold text-lg tracking-[0.08em] text-white leading-none block font-heading">
                KAIZEN
              </span>
              <span className="text-[9px] text-[#FF8A73] font-mono font-bold tracking-widest block uppercase mt-0.5">
                REAL ESTATE
              </span>
            </div>
          </motion.div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
            {DESKTOP_NAV.filter(
              (item) => !item.authOnly || isAuthenticated,
            ).map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`relative pb-2 transition-colors ${
                  activeTab === item.key
                    ? "text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {item.label}
                {activeTab === item.key && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#E04F33] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                requireAuth(() => setActiveTab("favorites"), "favorites")
              }
              className={`p-2.5 rounded-full transition-colors relative border ${
                activeTab === "favorites"
                  ? "text-rose-400 bg-rose-950/50 border-rose-500/40"
                  : "text-slate-300 hover:text-rose-400 hover:bg-black/40 border-white/10"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${favorites.length > 0 ? "fill-rose-500 text-rose-500" : ""}`}
              />
              <AnimatePresence>
                {favorites.length > 0 && (
                  <motion.span
                    key={favorites.length}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-0.5 -right-0.5 bg-[#E04F33] text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#0E121B]"
                  >
                    {favorites.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 bg-[#1A2130]/90 border border-white/15 rounded-full hover:bg-black/60 transition-colors"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || "User"}
                      className="w-8 h-8 rounded-full border border-[#E04F33] object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-[#E04F33] bg-[#E04F33]/20 flex items-center justify-center text-[11px] font-black text-[#FF8A73] shrink-0 select-none">
                      {(
                        user?.name?.[0] ||
                        user?.first_name?.[0] ||
                        user?.username?.[0] ||
                        "?"
                      ).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-white hidden sm:inline truncate max-w-[100px]">
                    {user?.name ||
                      `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
                      user?.username ||
                      "Account"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-56 bg-[#141A26]/95 border border-white/15 rounded-2xl p-2 shadow-2xl z-50 text-white backdrop-blur-2xl origin-top-right"
                    >
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="text-xs font-bold truncate">
                          {user?.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {user?.email}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setActiveTab("admin");
                            window.location.hash = "admin";
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-[#FF8A73] hover:bg-[#E04F33]/20 rounded-xl flex items-center gap-2 border border-[#E04F33]/30 my-1 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" /> Admin Workspace
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActiveTab("dashboard");
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-black/40 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#E04F33]" />{" "}
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          setActiveTab("properties");
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-950/60 rounded-xl flex items-center gap-2 mt-1 border-t border-white/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-full text-xs font-bold tracking-wider uppercase shadow-md shadow-[#E04F33]/20 flex items-center gap-1.5 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" /> Sign In
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* 3. Amenities Ticker */}
      <div className="bg-[#12141C] py-3 border-b border-white/10 relative overflow-hidden select-none flex items-center z-10">
        <div className="flex whitespace-nowrap text-[9px] md:text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
          <div className="inline-flex items-center shrink-0 gap-8 px-4 animate-marquee-ltr">
            <span>HEATED PRIVATE INFINITY POOLS</span>
            <span className="text-[#E04F33]">✦</span>
            <span>24/7 PERSONAL CONCIERGE SERVICES</span>
            <span className="text-[#E04F33]">✦</span>
            <span>DIRECT PLATFORM BOOKINGS (AIRBNB, VRBO, BOOKING.COM)</span>
            <span className="text-[#E04F33]">✦</span>
            <span>SCOTTSDALE & PENSACOLA LUXURY ESTATES</span>
            <span className="text-[#E04F33]">✦</span>
          </div>
          <div className="inline-flex items-center shrink-0 gap-8 px-4 animate-marquee-ltr" aria-hidden="true">
            <span>HEATED PRIVATE INFINITY POOLS</span>
            <span className="text-[#E04F33]">✦</span>
            <span>24/7 PERSONAL CONCIERGE SERVICES</span>
            <span className="text-[#E04F33]">✦</span>
            <span>DIRECT PLATFORM BOOKINGS (AIRBNB, VRBO, BOOKING.COM)</span>
            <span className="text-[#E04F33]">✦</span>
            <span>SCOTTSDALE & PENSACOLA LUXURY ESTATES</span>
            <span className="text-[#E04F33]">✦</span>
          </div>
          <div className="inline-flex items-center shrink-0 gap-8 px-4 animate-marquee-ltr" aria-hidden="true">
            <span>HEATED PRIVATE INFINITY POOLS</span>
            <span className="text-[#E04F33]">✦</span>
            <span>24/7 PERSONAL CONCIERGE SERVICES</span>
            <span className="text-[#E04F33]">✦</span>
            <span>DIRECT PLATFORM BOOKINGS (AIRBNB, VRBO, BOOKING.COM)</span>
            <span className="text-[#E04F33]">✦</span>
            <span>SCOTTSDALE & PENSACOLA LUXURY ESTATES</span>
            <span className="text-[#E04F33]">✦</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10">
        <div className="flex md:hidden overflow-x-auto pb-4 gap-2 no-scrollbar mb-4">
          {(["properties", "how-it-works", "blogs", "stories", "experiences", "about"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap capitalize text-slate-300 border border-white/10"
            >
              {activeTab === tab && (
                <motion.span
                  layoutId="mobile-tab-pill"
                  className="absolute inset-0 bg-black/60 border border-white/25 rounded-xl shadow-md"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span
                className={`relative z-10 ${activeTab === tab ? "text-white" : "text-slate-300"}`}
              >
                {tab.replace("-", " ")}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "dashboard" || activeTab === "favorites" || activeTab === "bookings" ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "favorites" && (
                <FavoriteView onSelectDeal={setSelectedDeal} />
              )}
              {activeTab === "bookings" && <BookingsView />}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* CUSTOMER PUBLIC VIEW (WITH DESIGN LAYOUT SIDEBAR) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-w-full overflow-hidden">

            {/* Left Brand Sidebar */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.15 }}
              className="hidden lg:flex lg:col-span-4 bg-black/30 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl shadow-black/40 flex-col justify-between min-h-0 lg:min-h-[520px] relative overflow-hidden apple-specular"
            >
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-xl rounded-full mb-6 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-[#E04F33] animate-pulse" />
                  <span className="text-[9px] font-bold text-[#FF8A73] tracking-[0.2em] uppercase font-mono">Kaizen Luxury Collection</span>
                </div>

                <motion.h1
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                  }}
                  className="text-2xl sm:text-4xl font-display font-extrabold leading-tight tracking-tight mb-4 text-white flex flex-wrap gap-x-2"
                >
                  <motion.span variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } } }} className="inline-block">Luxury</motion.span>
                  <motion.span variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } } }} className="inline-block">stays,</motion.span>
                  <motion.span variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } } }} className="inline-block text-[#FF8A73] italic font-serif">unforgettable</motion.span>
                  <motion.span variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } } }} className="inline-block">memories.</motion.span>
                </motion.h1>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 font-sans">
                  Indulge in our collection of meticulously curated luxury villas. Heated pools, private chefs, 24/7 concierge, and bespoke hospitality crafted to perfection.
                </p>

                {/* Navigation Doors in Sleek Frosted Glass */}
                <div className="space-y-3.5">
                  <div
                    onClick={() => setActiveTab('properties')}
                    className={`p-4 rounded-xl border cursor-pointer group transition-all duration-300 backdrop-blur-2xl ${
                      activeTab === 'properties'
                        ? 'bg-black/60 border-white/20 shadow-2xl shadow-black/40 ring-1 ring-white/20'
                        : 'bg-black/20 border-white/10 hover:border-white/20 hover:bg-black/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold text-[#FF8A73] uppercase mb-1 tracking-[0.2em] font-mono">Collection Catalog</p>
                        <p className="text-sm font-heading font-bold text-white">Browse Turnkey Villas</p>
                        <p className="text-xs text-slate-300 mt-1 font-sans">Explore verified luxury properties ready to operate & stay.</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#E04F33] group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('how-it-works')}
                    className={`p-4 rounded-xl border cursor-pointer group transition-all duration-300 backdrop-blur-2xl ${
                      activeTab === 'how-it-works'
                        ? 'bg-black/60 border-white/20 shadow-2xl shadow-black/40 ring-1 ring-white/20'
                        : 'bg-black/20 border-white/10 hover:border-white/20 hover:bg-black/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold text-[#FF8A73] uppercase mb-1 tracking-[0.2em] font-mono">Turnkey Process</p>
                        <p className="text-sm font-heading font-bold text-white">How It Works</p>
                        <p className="text-xs text-slate-300 mt-1 font-sans">4-step guide to locking, verifying, and operating properties.</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#E04F33] group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('experiences')}
                    className={`p-4 rounded-xl border cursor-pointer group transition-all duration-300 backdrop-blur-2xl ${
                      activeTab === 'experiences'
                        ? 'bg-black/60 border-white/20 shadow-2xl shadow-black/40 ring-1 ring-white/20'
                        : 'bg-black/20 border-white/10 hover:border-white/20 hover:bg-black/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold text-[#FF8A73] uppercase mb-1 tracking-[0.2em] font-mono">Our Experience</p>
                        <p className="text-sm font-heading font-bold text-white">Guest Experience</p>
                        <p className="text-xs text-slate-300 mt-1 font-sans">Private infinity pools, gourmet chefs, and custom catering.</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#E04F33] group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono text-[10px] text-[#FF8A73] uppercase tracking-widest">Airbtics Verified</span>
                <span className="font-bold text-white font-heading tracking-wider">KAIZEN REAL ESTATE</span>
              </div>
            </motion.section>

            {/* Right Main Content Panel */}
            <section className="lg:col-span-8 space-y-6 min-w-0 max-w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeTab === "how-it-works" && (
                    <HowItWorks
                      onBrowseProperties={() => setActiveTab("properties")}
                    />
                  )}
                  {activeTab === "properties" && (
                    <PropertiesView
                      onOpenProspectus={setSelectedDeal}
                      triggerNotification={triggerNotification}
                    />
                  )}

                  {activeTab === 'blogs' && (
                    <div className="space-y-8 animate-fade-in text-slate-100">
                      <div className="glass-card bg-black/30 rounded-3xl border border-white/10 p-8 shadow-2xl apple-specular">
                        <span className="text-[10px] font-extrabold text-[#FF8A73] bg-black/40 px-3 py-1 rounded-full uppercase tracking-widest border border-white/15 font-mono">
                          Kaizen Editorial
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 font-serif">
                          The Art of Luxury Vacation Rentals & Design
                        </h2>
                        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                          Exclusive columns on luxury real estate curation, interior design secrets, and guest experience benchmarks.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card bg-black/30 rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between transition-all shadow-2xl apple-specular">
                          <div>
                            <div className="h-40 relative">
                              <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80" alt="Luxury Scottsdale Villa design" className="w-full h-full object-cover"/>
                            </div>
                            <div className="p-5 space-y-2">
                              <p className="text-[10px] text-[#FF8A73] font-bold uppercase tracking-wider font-mono">July 18, 2026 • 5 min read</p>
                              <h3 className="font-extrabold text-base text-white">Curating Kaizen Scottsdale: Inside Our Design Playbook</h3>
                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                                How we integrated custom local cactus gardens, heated infinity pools, and warm neutral linens to boost Scottsdale guest satisfaction.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="glass-card bg-black/30 rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between transition-all shadow-2xl apple-specular">
                          <div>
                            <div className="h-40 relative">
                              <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80" alt="Private Chef Table Experience" className="w-full h-full object-cover"/>
                            </div>
                            <div className="p-5 space-y-2">
                              <p className="text-[10px] text-[#FF8A73] font-bold uppercase tracking-wider font-mono">July 14, 2026 • 7 min read</p>
                              <h3 className="font-extrabold text-base text-white">The Jain-Friendly Gourmet Advantage in Modern Luxury</h3>
                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                                A 5-star trip is more than just handing over a check-in code. We explore how catering to specialized dietary travelers secures top reviews.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="glass-card bg-black/30 rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between transition-all shadow-2xl apple-specular">
                          <div>
                            <div className="h-40 relative">
                              <img src="https://images.unsplash.com/photo-1450622238302-a223f43d35fc?auto=format&fit=crop&w=600&q=80" alt="Florida Coastal Villa" className="w-full h-full object-cover"/>
                            </div>
                            <div className="p-5 space-y-2">
                              <p className="text-[10px] text-[#FF8A73] font-bold uppercase tracking-wider font-mono">June 29, 2026 • 6 min read</p>
                              <h3 className="font-extrabold text-base text-white">Pensacola Coastal Living: High Amenities & Unmatched Comfort</h3>
                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                                Coastal luxury requires absolute precision in design and private beach club access.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'stories' && (
                    <div className="space-y-8 animate-fade-in text-slate-100">
                      <div className="glass-card bg-black/30 rounded-3xl border border-white/10 p-8 shadow-2xl apple-specular">
                        <span className="text-[10px] font-extrabold text-[#FF8A73] bg-black/40 px-3 py-1 rounded-full uppercase tracking-widest border border-white/15 font-mono">
                          Guest Chronicles
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 font-serif">
                          The Stories Behind Kaizen
                        </h2>
                        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                          Read real testimonials from travelers who have experienced the Kaizen difference.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card bg-black/30 p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 shadow-2xl apple-specular">
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            "Finding rental homes that accommodate specialized dietary needs and custom concierge dining is challenging. Kaizen curated a flawless family experience for us in Scottsdale. The absolute gold standard."
                          </p>
                          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                            <div className="w-10 h-10 rounded-full bg-black/40 text-[#FF8A73] font-bold flex items-center justify-center font-mono text-xs border border-white/15">AK</div>
                            <div>
                              <p className="font-extrabold text-white text-xs">Anand Kapoor</p>
                              <p className="text-[10px] text-slate-400 font-mono">Scottsdale Villa Guest</p>
                            </div>
                          </div>
                        </div>

                        <div className="glass-card bg-black/30 p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 shadow-2xl apple-specular">
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            "Kaizen handles designer styling, 24/7 guest check-ins, and bespoke concierge requests effortlessly. Highly recommend their collection."
                          </p>
                          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                            <div className="w-10 h-10 rounded-full bg-black/40 text-[#FF8A73] font-bold flex items-center justify-center font-mono text-xs border border-white/15">MR</div>
                            <div>
                              <p className="font-extrabold text-white text-xs">Marcus Roberts</p>
                              <p className="text-[10px] text-slate-400 font-mono">Pensacola Retreat Guest</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'experiences' && (
                    <div className="space-y-8 animate-fade-in text-slate-100">
                      <div className="glass-card bg-black/30 rounded-3xl border border-white/10 p-8 shadow-2xl apple-specular">
                        <span className="text-[10px] font-extrabold text-[#FF8A73] bg-black/40 px-3 py-1 rounded-full uppercase tracking-widest border border-white/15 font-mono">
                          The Kaizen Signature
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 font-serif">
                          Elevating Travel into Artistry
                        </h2>
                        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                          We believe hospitality lies in custom, invisible luxuries. At every Kaizen villa, your trip is accompanied by curated personal services, premium amenities, and dedicated concierge lines.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="glass-card bg-black/30 p-6 rounded-2xl border border-white/10 space-y-3 shadow-2xl apple-specular">
                          <Sparkles className="w-6 h-6 text-[#E04F33]" />
                          <h3 className="font-extrabold text-base text-white font-serif">Heated Infinity Pools</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Year-round temperature control, resort lighting, and private cabana loungers.
                          </p>
                        </div>
                        <div className="glass-card bg-black/30 p-6 rounded-2xl border border-white/10 space-y-3 shadow-2xl apple-specular">
                          <Award className="w-6 h-6 text-[#E04F33]" />
                          <h3 className="font-extrabold text-base text-white font-serif">24/7 Concierge Service</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Instant WhatsApp communication for dining reservations, airport transfers, and private chefs.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'about' && (
                    <div className="space-y-8 animate-fade-in text-slate-100">
                      <div className="glass-card bg-black/30 rounded-3xl border border-white/10 p-8 shadow-2xl apple-specular">
                        <span className="text-[10px] font-extrabold text-[#FF8A73] bg-black/40 px-3 py-1 rounded-full uppercase tracking-widest border border-white/15 font-mono">
                          The Kaizen Philosophy
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 font-serif">
                          Continuous Improvement. Exceptional Hospitality.
                        </h2>
                        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                          At Kaizen, we merge high-end, culturally-inclusive hospitality with continuous operational improvement.
                        </p>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </section>
          </div>
        )}
      </main>

      <footer className="backdrop-blur-xl bg-black/20 border-t border-white/10 mt-16 py-10 transition-colors duration-300 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E04F33] rounded-lg flex items-center justify-center shadow-lg shadow-[#E04F33]/25 border border-white/20 shrink-0">
              <span className="text-white font-extrabold text-base tracking-normal font-sans">改</span>
            </div>
            <div>
              <p className="font-extrabold text-sm text-white tracking-wide font-serif">KAIZEN LUXURY ESTATES</p>
              <p className="text-slate-400 text-xs tracking-widest font-mono uppercase leading-none mt-0.5">PREMIUM VACATION RENTALS</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono font-bold">
            <button onClick={() => { setActiveTab('properties'); window.location.hash = ''; }} className="text-slate-300 transition-colors duration-200 hover:text-[#E04F33] text-sm">Properties</button>
            <button onClick={() => { setActiveTab('experiences'); window.location.hash = ''; }} className="text-slate-300 transition-colors duration-200 hover:text-[#E04F33] text-sm">Experience</button>
            <button onClick={() => { setActiveTab('about'); window.location.hash = ''; }} className="text-slate-300 transition-colors duration-200 hover:text-[#E04F33] text-sm">About Us</button>
          </div>

          <p className="text-slate-500 text-xs font-mono text-center md:text-right">
            © 2026 Kaizen Luxury Real Estate LLC. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingAction(null);
          setPendingTab(null);
        }}
        onSuccess={() => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          } else if (pendingTab) {
            setActiveTab(pendingTab);
            setPendingTab(null);
          } else {
            setActiveTab("dashboard");
          }
        }}
      />

      {/* Property Prospectus Modal */}
      <PropertyProspectusModal
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onInitiateLock={() => requireAuth(() => setShowLockPurchaseModal(true))}
      />

      {/* Lock Purchase Modal */}
      <LockPurchaseModal
        isOpen={showLockPurchaseModal}
        deal={selectedDeal}
        onClose={() => setShowLockPurchaseModal(false)}
        onSuccess={() => {
          setShowLockPurchaseModal(false);
          setSelectedDeal(null);
          setActiveTab("bookings");
          triggerNotification(
            "Lease Successfully Locked! View details in My Locks.",
            "success",
          );
        }}
      />
    </div>
  );
}
