import React from "react";
import { Sparkles, ChevronRight, X, type LucideIcon } from "lucide-react";

export type AdminSection =
  "properties" | "leads_bookings" | "blogs" | "stories" | "settings";

interface NavItem {
  id: AdminSection;
  label: string;
  icon: LucideIcon;
  description: string;
}

interface AdminSidebarProps {
  items: NavItem[];
  active: AdminSection;
  onSelect: (id: AdminSection) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  items,
  active,
  onSelect,
  isOpen,
  onClose,
}) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          lg:sticky lg:top-8 lg:self-start
          lg:inset-y-auto lg:left-auto lg:z-auto
          h-[100dvh] lg:h-auto
          w-[280px] lg:w-72
          bg-[#0B0C10] lg:bg-white/[0.04]
          border-r lg:border border-white/10
          lg:rounded-3xl
          p-5
          shadow-2xl
          shrink-0
          flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between mb-5 lg:mb-3 px-1 lg:px-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF8A73] font-mono block">
            Admin Navigation
          </span>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white border border-white/10 active:scale-95 transition-all"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav aria-label="Admin sections" className="space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden pr-1 lg:pr-0 pb-4 lg:pb-0 scrollbar-hide">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                aria-current={isActive ? "page" : undefined}
                className={`w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-center justify-between group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E04F33]/50 ${
                  isActive
                    ? "bg-white/[0.08] border border-white/15 text-white shadow-xl font-bold"
                    : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <span
                  className={`absolute left-0 top-2 bottom-2 w-1 bg-[#E04F33] rounded-r-full transition-all duration-200 ${
                    isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                  }`}
                  aria-hidden="true"
                />
                <div className="flex items-center gap-3 pl-1 min-w-0">
                  <div
                    className={`p-2 rounded-xl transition-colors shrink-0 ${
                      isActive
                        ? "bg-[#E04F33] text-white shadow-md shadow-[#E04F33]/30"
                        : "bg-white/5 text-slate-300 border border-white/10 group-hover:border-white/20"
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight truncate">{item.label}</p>
                    <p className={`text-[9px] mt-0.5 truncate ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-all shrink-0 ${
                    isActive
                      ? "translate-x-0.5 text-[#FF8A73] opacity-100"
                      : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-slate-400"
                  }`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </nav>

        <div className="pt-4 mt-auto border-t border-white/10 px-1 shrink-0">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E04F33]" aria-hidden="true" />
              <span className="text-white">Live System Health</span>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span className="relative flex w-1.5 h-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              All services operating normally · 12ms latency
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
