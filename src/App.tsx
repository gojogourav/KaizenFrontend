import React, { useState, useEffect } from "react";
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
        propertyManagementView={<AdminPropertyManager />}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0F1014] dark:text-slate-100 font-sans flex flex-col relative selection:bg-[#E04F33] selection:text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-slate-50 dark:bg-[#0F1014]" />
        <div className="absolute -top-[12%] -left-[12%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full bg-[#E04F33]/10 dark:bg-[#E04F33]/15 blur-[120px]" />
        <div className="absolute -bottom-[12%] -right-[12%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-slate-200/60 dark:bg-slate-800/30 blur-[140px]" />
      </div>

      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl animate-slide-in ${
            notification.type === "success"
              ? "bg-[#121124]/90 border-emerald-500/40 text-emerald-300"
              : notification.type === "error"
                ? "bg-[#121124]/90 border-red-500/40 text-red-300"
                : "bg-[#121124]/90 border-[#E04F33]/40 text-slate-200"
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <p className="text-xs font-bold tracking-wide uppercase font-mono">
            {notification.message}
          </p>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0E121B]/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-apple-glass apple-specular">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab("properties")}
          >
            <div className="w-10 h-10 bg-[#E04F33] rounded-lg flex items-center justify-center shadow-lg shadow-[#E04F33]/25 border border-white/20 group-hover:scale-105 transition-all">
              <span className="text-white font-extrabold text-base font-sans">
                改
              </span>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-[0.08em] text-slate-900 dark:text-white leading-none block font-heading">
                KAIZEN
              </span>
              <span className="text-[9px] text-[#E04F33] dark:text-[#FF8A73] font-mono font-bold tracking-widest block uppercase mt-0.5">
                REAL ESTATE
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
            <button
              onClick={() => setActiveTab("properties")}
              className={`pb-1 border-b-2 transition-colors ${activeTab === "properties" ? "border-[#E04F33] text-slate-900 dark:text-white" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab("how-it-works")}
              className={`pb-1 border-b-2 transition-colors ${activeTab === "how-it-works" ? "border-[#E04F33] text-slate-900 dark:text-white" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              How It Works
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`pb-1 border-b-2 transition-colors ${activeTab === "dashboard" ? "border-[#E04F33] text-slate-900 dark:text-white" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`pb-1 border-b-2 transition-colors ${activeTab === "bookings" ? "border-[#E04F33] text-slate-900 dark:text-white" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  My Locks
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                requireAuth(() => setActiveTab("favorites"), "favorites")
              }
              className={`p-2.5 rounded-full transition-all relative border ${
                activeTab === "favorites"
                  ? "text-rose-400 bg-rose-950/50 border-rose-500/40"
                  : "text-slate-300 hover:text-rose-400 hover:bg-white/5 border-white/10"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${favorites.length > 0 ? "fill-rose-500 text-rose-500" : ""}`}
              />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#E04F33] text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#0E121B]">
                  {favorites.length}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 bg-[#1A2130]/90 border border-white/15 rounded-full hover:bg-white/10 transition-colors"
                >
                  <img
                    src={user?.avatarUrl || "https://via.placeholder.com/150"}
                    alt="User"
                    className="w-8 h-8 rounded-full border border-[#E04F33] object-cover"
                  />
                  <span className="text-xs font-bold text-white hidden sm:inline">
                    {user?.name}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#141A26]/95 border border-white/15 rounded-2xl p-2 shadow-2xl z-50 text-white backdrop-blur-2xl">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-bold truncate">{user?.name}</p>
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
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-full text-xs font-bold tracking-wider uppercase shadow-md shadow-[#E04F33]/20 flex items-center gap-1.5 transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" /> Sign In
              </button>
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
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap capitalize ${activeTab === tab ? "bg-white/20 text-white border border-white/25 shadow-md" : "bg-white/5 text-slate-300 border border-white/10"}`}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "favorites" && (
          <FavoriteView onSelectDeal={setSelectedDeal} />
        )}
        {activeTab === "bookings" && <BookingsView />}
        {activeTab === "how-it-works" && (
          <HowItWorks onBrowseProperties={() => setActiveTab("properties")} />
        )}
        {activeTab === "properties" && (
          <PropertiesView
            onOpenProspectus={setSelectedDeal}
            triggerNotification={triggerNotification}
          />
        )}
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
