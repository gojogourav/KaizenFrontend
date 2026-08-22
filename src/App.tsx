import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
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
import { AdminPropertyManager } from "./components/admin/AdminPropertyManager";

export type TabType =
  | "properties"
  | "how-it-works"
  | "dashboard"
  | "favorites"
  | "bookings"
  | "admin";

const DESKTOP_NAV: { key: TabType; label: string; authOnly?: boolean }[] = [
  { key: "properties", label: "Properties" },
  { key: "how-it-works", label: "How It Works" },
  { key: "dashboard", label: "Dashboard", authOnly: true },
  { key: "bookings", label: "My Locks", authOnly: true },
];

export default function App() {
  const { user, logout, favorites } = useAuth();
  const isAuthenticated = !!user;

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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0F1014] dark:text-slate-100 font-sans flex flex-col relative selection:bg-[#E04F33] selection:text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-slate-50 dark:bg-[#0F1014]" />
        <motion.div
          className="absolute -top-[12%] -left-[12%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full bg-[#E04F33]/10 dark:bg-[#E04F33]/15 blur-[120px]"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-[12%] -right-[12%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-slate-200/60 dark:bg-slate-800/30 blur-[140px]"
          animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

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

      <header className="sticky top-0 z-40 bg-white/2 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-apple-glass apple-specular">
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
              <span className="text-white font-extrabold text-base font-sans">
                改
              </span>
            </motion.div>
            <div>
              <span className="font-extrabold text-lg tracking-[0.08em] text-slate-900 dark:text-white leading-none block font-heading">
                KAIZEN
              </span>
              <span className="text-[9px] text-[#E04F33] dark:text-[#FF8A73] font-mono font-bold tracking-widest block uppercase mt-0.5">
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
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
                  : "text-slate-300 hover:text-rose-400 hover:bg-white/5 border-white/10"
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
                  className="flex items-center gap-2.5 p-1.5 pr-3 bg-[#1A2130]/90 border border-white/15 rounded-full hover:bg-white/10 transition-colors"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || "User"}
                      className="w-8 h-8 rounded-full border border-[#E04F33] object-cover shrink-0"
                      onError={(e) => {
                        // If image fails to load, hide it so the fallback shows
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
                        className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-white/10 rounded-xl flex items-center gap-2 transition-colors"
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10">
        <div className="flex md:hidden overflow-x-auto pb-4 gap-2 no-scrollbar mb-4">
          {(["properties", "how-it-works"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap capitalize text-slate-300 border border-white/10"
            >
              {activeTab === tab && (
                <motion.span
                  layoutId="mobile-tab-pill"
                  className="absolute inset-0 bg-white/20 border border-white/25 rounded-xl shadow-md"
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
          </motion.div>
        </AnimatePresence>
      </main>

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

      <PropertyProspectusModal
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onInitiateLock={() => requireAuth(() => setShowLockPurchaseModal(true))}
      />

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
