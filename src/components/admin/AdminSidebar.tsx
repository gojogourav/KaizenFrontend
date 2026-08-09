import React from "react";
import { Sparkles, ChevronRight, type LucideIcon } from "lucide-react";

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
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  items,
  active,
  onSelect,
}) => (
  <aside className="w-full lg:w-72 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl shrink-0 space-y-6">
    <div>
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF8A73] font-mono block mb-3 px-2">
        Admin Navigation
      </span>
      <nav aria-label="Admin sections" className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group relative overflow-hidden ${
                isActive
                  ? "bg-white/15 border border-white/20 text-white shadow-xl font-bold"
                  : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-2 bottom-2 w-1 bg-[#E04F33] rounded-r-full"
                  aria-hidden="true"
                />
              )}
              <div className="flex items-center gap-3 pl-1">
                <div
                  className={`p-2 rounded-xl transition-colors ${isActive ? "bg-[#E04F33] text-white shadow-md" : "bg-white/5 text-slate-300 border border-white/10"}`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">
                    {item.label}
                  </p>
                  <p
                    className={`text-[9px] mt-0.5 ${isActive ? "text-slate-200" : "text-slate-400"}`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${isActive ? "translate-x-0.5 text-[#FF8A73]" : "opacity-0 group-hover:opacity-100 text-slate-400"}`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </nav>
    </div>

    <div className="pt-4 border-t border-white/10 px-2">
      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200">
        <div className="flex items-center gap-1.5 font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#E04F33]" aria-hidden="true" />
          <span className="text-white">Live System Health</span>
        </div>
        <p className="text-[10px] text-slate-300">
          All services operating normally.
        </p>
      </div>
    </div>
  </aside>
);
