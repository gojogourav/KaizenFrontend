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
  Award,
} from "lucide-react";

import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { ThemeToggle } from "./components/common/ThemeToggle";

import { AuthModal } from "./components/auth/AuthModal";
import { LockPurchaseModal } from "./components/booking/LockPurchaseModal";
import { PropertyProspectusModal } from "./components/property/PropertyProspectusModal";

import { DashboardView as Dashboard } from "./components/views/Dashboard";
import { FavoritesView as FavoriteView } from "./components/views/FavoriteView";
import { BookingsView } from "./components/views/BookingsView";
import { HowItWorks } from "./components/views/HowItWorks";
import { PropertiesView } from "./components/views/PropertiesView";
import { LandingPage } from "./components/views/LandingPage";
import { RatePropertyModal } from "./components/common/RatePropertyModal";
import { useAsync } from "./hooks/useAsync";
import { api } from "./api/client";

import { AdminLayout } from "./components/admin/AdminLayout";

export type TabType =
  | "landing"
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
  { key: "landing", label: "Home" },
  { key: "properties", label: "Properties" },
  { key: "how-it-works", label: "How It Works" },
  { key: "experiences", label: "Experience" },
  { key: "about", label: "About" },
  { key: "dashboard", label: "Dashboard", authOnly: true },
  { key: "bookings", label: "My Locks", authOnly: true },
];

export default function App() {
  const { user, logout, favorites } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
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

  const [activeTab, setActiveTab] = useState<TabType>("landing");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  const [showLockPurchaseModal, setShowLockPurchaseModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateModalProperty, setRateModalProperty] = useState<any | null>(null);
  const [catalogFilters, setCatalogFilters] = useState<any>({});

  const { data: rawPropsData } = useAsync<any>(
    (signal) => api.getProperties({}, { signal }),
    [],
  );
  const landingProperties = Array.isArray(rawPropsData)
    ? rawPropsData
    : rawPropsData?.results || [];

  const handleRateDeal = (property: any) => {
    setRateModalProperty(property);
    setShowRateModal(true);
  };
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
    success: isDark
      ? "bg-slate-900/95 border-emerald-500/40 text-emerald-300"
      : "bg-white/95 border-emerald-500/40 text-emerald-700 shadow-xl",
    error: isDark
      ? "bg-slate-900/95 border-rose-500/40 text-rose-300"
      : "bg-white/95 border-rose-500/40 text-rose-700 shadow-xl",
    info: isDark
      ? "bg-slate-900/95 border-blue-500/40 text-blue-300"
      : "bg-white/95 border-blue-500/40 text-blue-700 shadow-xl",
  };

  return (
    <div
      className={`min-h-screen font-sans flex flex-col relative selection:bg-blue-600 selection:text-white transition-colors duration-300 ${
        isDark ? "bg-[#090D16] text-slate-100" : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      {/* 1. Ambient Mesh Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute inset-0 ${isDark ? "bg-[#090D16]" : "bg-[#F8FAFC]"}`} />
        <motion.div
          className={`absolute -top-[12%] -left-[12%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full blur-[130px] ${
            isDark ? "bg-blue-600/15" : "bg-blue-500/10"
          }`}
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute -bottom-[12%] -right-[12%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full blur-[140px] ${
            isDark ? "bg-indigo-600/15" : "bg-indigo-400/10"
          }`}
          animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className={`absolute top-[35%] right-[10%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full blur-[130px] pointer-events-none ${
            isDark ? "bg-sky-600/10" : "bg-sky-400/10"
          }`}
        />
      </div>

      {/* 2. First Paint Splash Overlay */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 ${
            isDark ? "bg-[#090D16]" : "bg-slate-50"
          } ${splashFading ? "animate-splash-fade-out" : "opacity-100"}`}
        >
          <div className="relative flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-2xl shadow-blue-600/40 border border-white/20 animate-kaizen-logo flex items-center justify-center">
              <span className="text-white font-extrabold text-2xl font-sans">改</span>
            </div>

            <div className="text-center space-y-1">
              <h2
                className={`text-xl font-heading font-extrabold tracking-[0.25em] uppercase ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                KAIZEN ESTATES
              </h2>
              <p className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] font-bold">
                Bespoke Luxury Stays
              </p>
            </div>

            <div className="w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-blue-600 rounded-full animate-kaizen-bar" />
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
            className={`fixed top-4 right-4 z-50 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl ${notificationStyles[notification.type]}`}
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

      {/* Sleek Modern Header Navigation */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-2xl border-b shadow-sm transition-colors duration-300 ${
          isDark
            ? "bg-[#090D16]/80 border-slate-800/80 shadow-black/40 apple-specular"
            : "bg-white/80 border-slate-200/80 shadow-slate-200/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab("properties")}
          >
            <motion.div
              whileHover={{ rotate: 6, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 border border-white/20"
            >
              <span className="text-white font-extrabold text-base font-sans">改</span>
            </motion.div>
            <div>
              <span
                className={`font-extrabold text-lg tracking-[0.08em] leading-none block font-heading ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                KAIZEN
              </span>
              <span className="text-[9px] text-blue-600 dark:text-blue-400 font-mono font-bold tracking-widest block uppercase mt-0.5">
                REAL ESTATE
              </span>
            </div>
          </motion.div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
            {DESKTOP_NAV.filter(
              (item) => !item.authOnly || isAuthenticated,
            ).map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`relative pb-2 transition-colors ${
                  activeTab === item.key
                    ? isDark
                      ? "text-white"
                      : "text-blue-600"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item.label}
                {activeTab === item.key && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-0 right-0 -bottom-[1px] h-[2.5px] bg-blue-600 dark:bg-blue-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Dark / Light Mode Toggle */}
            <ThemeToggle />

            {/* Wishlist Favorites Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                requireAuth(() => setActiveTab("favorites"), "favorites")
              }
              className={`p-2.5 rounded-full transition-all relative border ${
                activeTab === "favorites"
                  ? isDark
                    ? "text-rose-400 bg-rose-950/40 border-rose-500/40"
                    : "text-rose-600 bg-rose-50 border-rose-200"
                  : isDark
                  ? "text-slate-300 hover:text-rose-400 hover:bg-slate-800/60 border-slate-700/60"
                  : "text-slate-600 hover:text-rose-600 hover:bg-slate-100 border-slate-200"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  favorites.length > 0
                    ? "fill-rose-500 text-rose-500"
                    : "text-current"
                }`}
              />
              <AnimatePresence>
                {favorites.length > 0 && (
                  <motion.span
                    key={favorites.length}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900"
                  >
                    {favorites.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Auth Dropdown / Button */}
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2.5 p-1.5 pr-3.5 border rounded-full transition-all ${
                    isDark
                      ? "bg-slate-800/80 border-slate-700/80 hover:bg-slate-800"
                      : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || "User"}
                      className="w-8 h-8 rounded-full border border-blue-500 object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-blue-500/40 bg-blue-500/15 flex items-center justify-center text-[11px] font-black text-blue-600 dark:text-blue-400 shrink-0 select-none">
                      {(
                        user?.name?.[0] ||
                        user?.first_name?.[0] ||
                        user?.username?.[0] ||
                        "?"
                      ).toUpperCase()}
                    </div>
                  )}
                  <span
                    className={`text-xs font-bold hidden sm:inline truncate max-w-[100px] ${
                      isDark ? "text-white" : "text-slate-800"
                    }`}
                  >
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
                      className={`absolute right-0 mt-2 w-56 border rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-2xl origin-top-right ${
                        isDark
                          ? "bg-slate-900/95 border-slate-800 text-white"
                          : "bg-white/95 border-slate-200 text-slate-900 shadow-xl"
                      }`}
                    >
                      <div
                        className={`px-3 py-2 border-b mb-1 ${
                          isDark ? "border-slate-800" : "border-slate-100"
                        }`}
                      >
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
                          className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-xl flex items-center gap-2 border border-blue-500/20 my-1 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />{" "}
                          Admin Workspace
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActiveTab("dashboard");
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl flex items-center gap-2 transition-colors ${
                          isDark
                            ? "hover:bg-slate-800"
                            : "hover:bg-slate-100"
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />{" "}
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          setActiveTab("properties");
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 mt-1 border-t transition-colors ${
                          isDark ? "border-slate-800" : "border-slate-100"
                        }`}
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
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full text-xs font-bold tracking-wider uppercase shadow-lg shadow-blue-600/25 flex items-center gap-1.5 transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" /> Sign In
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* 3. Amenities Ticker Bar */}
      <div
        className={`py-3 border-b relative overflow-hidden select-none flex items-center z-10 transition-colors ${
          isDark
            ? "bg-slate-900/60 border-slate-800/60 text-slate-300"
            : "bg-slate-100/80 border-slate-200 text-slate-700"
        }`}
      >
        <div className="flex whitespace-nowrap text-[9px] md:text-xs font-bold uppercase tracking-[0.14em]">
          <div className="inline-flex items-center shrink-0 gap-8 px-4 animate-marquee-ltr">
            <span>HEATED PRIVATE INFINITY POOLS</span>
            <span className="text-blue-600 dark:text-blue-400">✦</span>
            <span>24/7 PERSONAL CONCIERGE SERVICES</span>
            <span className="text-blue-600 dark:text-blue-400">✦</span>
            <span>DIRECT PLATFORM BOOKINGS (AIRBNB, VRBO, BOOKING.COM)</span>
            <span className="text-blue-600 dark:text-blue-400">✦</span>
            <span>SCOTTSDALE & PENSACOLA LUXURY ESTATES</span>
            <span className="text-blue-600 dark:text-blue-400">✦</span>
          </div>
          <div
            className="inline-flex items-center shrink-0 gap-8 px-4 animate-marquee-ltr"
            aria-hidden="true"
          >
            <span>HEATED PRIVATE INFINITY POOLS</span>
            <span className="text-blue-600 dark:text-blue-400">✦</span>
            <span>24/7 PERSONAL CONCIERGE SERVICES</span>
            <span className="text-blue-600 dark:text-blue-400">✦</span>
            <span>DIRECT PLATFORM BOOKINGS (AIRBNB, VRBO, BOOKING.COM)</span>
            <span className="text-blue-600 dark:text-blue-400">✦</span>
            <span>SCOTTSDALE & PENSACOLA LUXURY ESTATES</span>
            <span className="text-blue-600 dark:text-blue-400">✦</span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10">
        {/* Mobile Horizontal Tabs Navigation */}
        <div className="flex md:hidden overflow-x-auto pb-4 gap-2 no-scrollbar mb-4">
          {(
            [
              "properties",
              "how-it-works",
              "blogs",
              "stories",
              "experiences",
              "about",
            ] as TabType[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap capitalize border transition-all ${
                activeTab === tab
                  ? isDark
                    ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30"
                    : "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                  : isDark
                  ? "bg-slate-900/60 border-slate-800 text-slate-300"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>

        {activeTab === "landing" ? (
          <AnimatePresence mode="wait">
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <LandingPage
                onBrowseProperties={(filters) => {
                  if (filters) setCatalogFilters(filters);
                  setActiveTab("properties");
                }}
                onHowItWorks={() => setActiveTab("how-it-works")}
                onSelectDeal={setSelectedDeal}
                onRateDeal={handleRateDeal}
                properties={landingProperties}
                favorites={favorites}
                onToggleFavorite={(id, e) => {
                  if (e) e.stopPropagation();
                }}
              />
            </motion.div>
          </AnimatePresence>
        ) : activeTab === "dashboard" ||
        activeTab === "favorites" ||
        activeTab === "bookings" ? (
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
                <FavoriteView
                  onSelectDeal={setSelectedDeal}
                  onRateDeal={handleRateDeal}
                />
              )}
              {activeTab === "bookings" && (
                <BookingsView
                  onOpenProspectus={setSelectedDeal}
                  onRateDeal={handleRateDeal}
                />
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* PUBLIC VIEW LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-w-full overflow-hidden">
            {/* Left Brand Hero Sidebar */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 18,
                delay: 0.15,
              }}
              className={`hidden lg:flex lg:col-span-4 rounded-3xl p-6 sm:p-8 border shadow-xl flex-col justify-between min-h-0 lg:min-h-[520px] relative overflow-hidden transition-all ${
                isDark
                  ? "bg-slate-900/70 border-slate-800 shadow-slate-950/50 apple-specular"
                  : "bg-white/80 border-slate-200/80 shadow-slate-200/50"
              }`}
            >
              <div>
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border ${
                    isDark
                      ? "bg-blue-950/40 border-blue-800/40 text-blue-300"
                      : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase font-mono">
                    Kaizen Luxury Collection
                  </span>
                </div>

                <motion.h1
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                    },
                  }}
                  className={`text-2xl sm:text-4xl font-display font-extrabold leading-tight tracking-tight mb-4 flex flex-wrap gap-x-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  <motion.span
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                        transition: { type: "spring", stiffness: 120, damping: 14 },
                      },
                    }}
                    className="inline-block"
                  >
                    Luxury
                  </motion.span>
                  <motion.span
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                        transition: { type: "spring", stiffness: 120, damping: 14 },
                      },
                    }}
                    className="inline-block"
                  >
                    stays,
                  </motion.span>
                  <motion.span
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                        transition: { type: "spring", stiffness: 120, damping: 14 },
                      },
                    }}
                    className="inline-block text-blue-600 dark:text-blue-400 italic font-serif"
                  >
                    unforgettable
                  </motion.span>
                  <motion.span
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                        transition: { type: "spring", stiffness: 120, damping: 14 },
                      },
                    }}
                    className="inline-block"
                  >
                    memories.
                  </motion.span>
                </motion.h1>

                <p
                  className={`text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 font-sans ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Indulge in our collection of meticulously curated luxury villas.
                  Heated pools, private chefs, 24/7 concierge, and bespoke
                  hospitality crafted to perfection.
                </p>

                {/* Sleek Nav Doors */}
                <div className="space-y-3.5">
                  <div
                    onClick={() => setActiveTab("properties")}
                    className={`p-4 rounded-2xl border cursor-pointer group transition-all duration-300 ${
                      activeTab === "properties"
                        ? isDark
                          ? "bg-slate-800/80 border-blue-500/50 shadow-lg shadow-blue-950/40"
                          : "bg-blue-50/80 border-blue-300 shadow-md shadow-blue-500/10"
                        : isDark
                        ? "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                        : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase mb-1 tracking-[0.2em] font-mono">
                          Collection Catalog
                        </p>
                        <p
                          className={`text-sm font-heading font-bold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          Browse Turnkey Villas
                        </p>
                        <p
                          className={`text-xs mt-1 font-sans ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          Explore verified luxury properties ready to operate &
                          stay.
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab("how-it-works")}
                    className={`p-4 rounded-2xl border cursor-pointer group transition-all duration-300 ${
                      activeTab === "how-it-works"
                        ? isDark
                          ? "bg-slate-800/80 border-blue-500/50 shadow-lg shadow-blue-950/40"
                          : "bg-blue-50/80 border-blue-300 shadow-md shadow-blue-500/10"
                        : isDark
                        ? "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                        : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase mb-1 tracking-[0.2em] font-mono">
                          Turnkey Process
                        </p>
                        <p
                          className={`text-sm font-heading font-bold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          How It Works
                        </p>
                        <p
                          className={`text-xs mt-1 font-sans ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          4-step guide to locking, verifying, and operating
                          properties.
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab("experiences")}
                    className={`p-4 rounded-2xl border cursor-pointer group transition-all duration-300 ${
                      activeTab === "experiences"
                        ? isDark
                          ? "bg-slate-800/80 border-blue-500/50 shadow-lg shadow-blue-950/40"
                          : "bg-blue-50/80 border-blue-300 shadow-md shadow-blue-500/10"
                        : isDark
                        ? "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                        : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase mb-1 tracking-[0.2em] font-mono">
                          Our Experience
                        </p>
                        <p
                          className={`text-sm font-heading font-bold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          Guest Experience
                        </p>
                        <p
                          className={`text-xs mt-1 font-sans ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          Private infinity pools, gourmet chefs, and custom
                          catering.
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`pt-6 sm:pt-8 mt-6 sm:mt-8 border-t flex items-center justify-between text-xs ${
                  isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"
                }`}
              >
                <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest font-bold">
                  Airbtics Verified
                </span>
                <span
                  className={`font-bold font-heading tracking-wider ${
                    isDark ? "text-white" : "text-slate-800"
                  }`}
                >
                  KAIZEN REAL ESTATE
                </span>
              </div>
            </motion.section>

            {/* Right Main Content View */}
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
                      onRateDeal={handleRateDeal}
                      initialFilters={catalogFilters}
                      triggerNotification={triggerNotification}
                    />
                  )}

                  {activeTab === "blogs" && (
                    <div className="space-y-8 animate-fade-in">
                      <div
                        className={`rounded-3xl border p-8 shadow-xl ${
                          isDark
                            ? "bg-slate-900/70 border-slate-800 apple-specular"
                            : "bg-white border-slate-200 shadow-slate-200/50"
                        }`}
                      >
                        <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/20 font-mono">
                          Kaizen Editorial
                        </span>
                        <h2
                          className={`text-2xl sm:text-3xl font-extrabold mt-4 font-serif ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          The Art of Luxury Vacation Rentals & Design
                        </h2>
                        <p
                          className={`text-sm mt-2 leading-relaxed ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Exclusive columns on luxury real estate curation, interior
                          design secrets, and guest experience benchmarks.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          {
                            title: "Curating Kaizen Scottsdale: Inside Our Design Playbook",
                            date: "July 18, 2026 • 5 min read",
                            img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
                            desc: "How we integrated custom local cactus gardens, heated infinity pools, and warm neutral linens to boost Scottsdale guest satisfaction.",
                          },
                          {
                            title: "The Gourmet Advantage in Modern Luxury Stays",
                            date: "July 14, 2026 • 7 min read",
                            img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
                            desc: "A 5-star trip is more than just handing over a check-in code. We explore how catering to specialized dietary travelers secures top reviews.",
                          },
                          {
                            title: "Pensacola Coastal Living: High Amenities & Unmatched Comfort",
                            date: "June 29, 2026 • 6 min read",
                            img: "https://images.unsplash.com/photo-1450622238302-a223f43d35fc?auto=format&fit=crop&w=600&q=80",
                            desc: "Coastal luxury requires absolute precision in design and private beach club access.",
                          },
                        ].map((post, idx) => (
                          <div
                            key={idx}
                            className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg ${
                              isDark
                                ? "bg-slate-900/70 border-slate-800 hover:border-blue-500/40"
                                : "bg-white border-slate-200 hover:border-blue-300 shadow-slate-200/50"
                            }`}
                          >
                            <div>
                              <div className="h-40 relative overflow-hidden">
                                <img
                                  src={post.img}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                              <div className="p-5 space-y-2">
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider font-mono">
                                  {post.date}
                                </p>
                                <h3
                                  className={`font-extrabold text-base ${
                                    isDark ? "text-white" : "text-slate-900"
                                  }`}
                                >
                                  {post.title}
                                </h3>
                                <p
                                  className={`text-xs leading-relaxed line-clamp-3 ${
                                    isDark ? "text-slate-400" : "text-slate-600"
                                  }`}
                                >
                                  {post.desc}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "stories" && (
                    <div className="space-y-8 animate-fade-in">
                      <div
                        className={`rounded-3xl border p-8 shadow-xl ${
                          isDark
                            ? "bg-slate-900/70 border-slate-800 apple-specular"
                            : "bg-white border-slate-200 shadow-slate-200/50"
                        }`}
                      >
                        <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/20 font-mono">
                          Guest Chronicles
                        </span>
                        <h2
                          className={`text-2xl sm:text-3xl font-extrabold mt-4 font-serif ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          The Stories Behind Kaizen
                        </h2>
                        <p
                          className={`text-sm mt-2 leading-relaxed ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Read real testimonials from travelers who have experienced the
                          Kaizen difference.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            quote:
                              '"Finding rental homes that accommodate specialized dietary needs and custom concierge dining is challenging. Kaizen curated a flawless family experience for us in Scottsdale. The absolute gold standard."',
                            name: "Anand Kapoor",
                            role: "Scottsdale Villa Guest",
                            initials: "AK",
                          },
                          {
                            quote:
                              '"Kaizen handles designer styling, 24/7 guest check-ins, and bespoke concierge requests effortlessly. Highly recommend their collection."',
                            name: "Marcus Roberts",
                            role: "Pensacola Retreat Guest",
                            initials: "MR",
                          },
                        ].map((story, idx) => (
                          <div
                            key={idx}
                            className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 shadow-lg ${
                              isDark
                                ? "bg-slate-900/70 border-slate-800"
                                : "bg-white border-slate-200 shadow-slate-200/50"
                            }`}
                          >
                            <p
                              className={`text-xs leading-relaxed italic ${
                                isDark ? "text-slate-300" : "text-slate-700"
                              }`}
                            >
                              {story.quote}
                            </p>
                            <div
                              className={`flex items-center gap-3 pt-4 border-t ${
                                isDark ? "border-slate-800" : "border-slate-100"
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full bg-blue-600/15 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center font-mono text-xs border border-blue-500/30">
                                {story.initials}
                              </div>
                              <div>
                                <p
                                  className={`font-extrabold text-xs ${
                                    isDark ? "text-white" : "text-slate-900"
                                  }`}
                                >
                                  {story.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {story.role}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "experiences" && (
                    <div className="space-y-8 animate-fade-in">
                      <div
                        className={`rounded-3xl border p-8 shadow-xl ${
                          isDark
                            ? "bg-slate-900/70 border-slate-800 apple-specular"
                            : "bg-white border-slate-200 shadow-slate-200/50"
                        }`}
                      >
                        <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/20 font-mono">
                          The Kaizen Signature
                        </span>
                        <h2
                          className={`text-2xl sm:text-3xl font-extrabold mt-4 font-serif ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          Elevating Travel into Artistry
                        </h2>
                        <p
                          className={`text-sm mt-2 leading-relaxed ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          We believe hospitality lies in custom, invisible luxuries. At
                          every Kaizen villa, your trip is accompanied by curated
                          personal services, premium amenities, and dedicated concierge
                          lines.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div
                          className={`p-6 rounded-2xl border space-y-3 shadow-lg ${
                            isDark
                              ? "bg-slate-900/70 border-slate-800"
                              : "bg-white border-slate-200 shadow-slate-200/50"
                          }`}
                        >
                          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <h3
                            className={`font-extrabold text-base font-serif ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            Heated Infinity Pools
                          </h3>
                          <p
                            className={`text-xs leading-relaxed ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            Year-round temperature control, resort lighting, and private
                            cabana loungers.
                          </p>
                        </div>
                        <div
                          className={`p-6 rounded-2xl border space-y-3 shadow-lg ${
                            isDark
                              ? "bg-slate-900/70 border-slate-800"
                              : "bg-white border-slate-200 shadow-slate-200/50"
                          }`}
                        >
                          <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <h3
                            className={`font-extrabold text-base font-serif ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            24/7 Concierge Service
                          </h3>
                          <p
                            className={`text-xs leading-relaxed ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            Instant WhatsApp communication for dining reservations,
                            airport transfers, and private chefs.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "about" && (
                    <div className="space-y-8 animate-fade-in">
                      <div
                        className={`rounded-3xl border p-8 shadow-xl ${
                          isDark
                            ? "bg-slate-900/70 border-slate-800 apple-specular"
                            : "bg-white border-slate-200 shadow-slate-200/50"
                        }`}
                      >
                        <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/20 font-mono">
                          The Kaizen Philosophy
                        </span>
                        <h2
                          className={`text-2xl sm:text-3xl font-extrabold mt-4 font-serif ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          Continuous Improvement. Exceptional Hospitality.
                        </h2>
                        <p
                          className={`text-sm mt-2 leading-relaxed ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          At Kaizen, we merge high-end, culturally-inclusive hospitality
                          with continuous operational improvement.
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

      {/* Sleek Minimal Footer */}
      <footer
        className={`backdrop-blur-xl border-t mt-16 py-10 transition-colors duration-300 relative z-10 ${
          isDark
            ? "bg-slate-900/60 border-slate-800/80"
            : "bg-white/80 border-slate-200 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/30 border border-white/20 shrink-0">
              <span className="text-white font-extrabold text-base font-sans">改</span>
            </div>
            <div>
              <p
                className={`font-extrabold text-sm tracking-wide font-serif ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                KAIZEN LUXURY ESTATES
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-[10px] tracking-widest font-mono uppercase leading-none mt-0.5 font-bold">
                PREMIUM VACATION RENTALS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono font-bold text-xs">
            <button
              onClick={() => {
                setActiveTab("properties");
                window.location.hash = "";
              }}
              className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Properties
            </button>
            <button
              onClick={() => {
                setActiveTab("experiences");
                window.location.hash = "";
              }}
              className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Experience
            </button>
            <button
              onClick={() => {
                setActiveTab("about");
                window.location.hash = "";
              }}
              className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              About Us
            </button>
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

      {/* Guest Stay & Hotel Rating Modal */}
      <RatePropertyModal
        property={rateModalProperty}
        isOpen={showRateModal}
        onClose={() => setShowRateModal(false)}
        onSuccess={() => {
          triggerNotification("Thank you! Your stay rating has been recorded.", "success");
        }}
      />
    </div>
  );
}
