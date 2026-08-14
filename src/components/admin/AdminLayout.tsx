import React, { useState } from "react";
import {
  Building,
  Users,
  FileText,
  MessageSquareQuote,
  Settings,
  Database,
  KeyRound,
  Bell,
} from "lucide-react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar, type AdminSection } from "./AdminSidebar";
import { AdminPropertyManager } from "./AdminPropertyManager";
import { AdminLeadsManager } from "./AdminLeadsManager";
import { AdminBlogManager } from "./AdminBlogManager";
import { AdminStoriesManager } from "./AdminStoriesManager";
import { useAuth } from "../../context/AuthContext";
import { AdminUIProvider } from "./AdminUIProvider";
import { AdminAnimations } from "./Animations";
import { Panel } from "./Primitives";

interface AdminLayoutProps {
  onExitAdmin: () => void;
}

const NAV_ITEMS = [
  {
    id: "properties" as AdminSection,
    label: "Properties & Listings",
    icon: Building,
    description: "Manage villa listings, pricing & platforms",
  },
  {
    id: "leads_bookings" as AdminSection,
    label: "Leads & Bookings",
    icon: Users,
    description: "Inbound inquiries & leaseholds",
  },
  {
    id: "blogs" as AdminSection,
    label: "Editorial Blogs",
    icon: FileText,
    description: "Articles & design playbooks",
  },
  {
    id: "stories" as AdminSection,
    label: "Success Stories",
    icon: MessageSquareQuote,
    description: "Customer reviews & testimonials",
  },
  {
    id: "settings" as AdminSection,
    label: "Platform Settings",
    icon: Settings,
    description: "Global fees, keys & announcements",
  },
];

const SettingsPanel: React.FC = () => (
  <Panel className="p-6 sm:p-8 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-[#E04F33]/15 border border-[#E04F33]/30 flex items-center justify-center shrink-0">
        <Settings className="w-5 h-5 text-[#E04F33]" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white font-heading">
          Platform Settings &amp; API Keys
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure global service fees, API credentials, and portal notifications.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        { icon: Database, label: "Database", value: "Supabase (PostGIS)", tone: "text-emerald-400" },
        { icon: KeyRound, label: "API Host", value: "127.0.0.1:8000", tone: "text-sky-400" },
        { icon: Bell, label: "Notifications", value: "Email + in-app", tone: "text-[#FF8A73]" },
      ].map(({ icon: Icon, label, value, tone }) => (
        <div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-3.5 h-3.5 ${tone}`} />
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400">
              {label}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-200">{value}</p>
        </div>
      ))}
    </div>

    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 space-y-2">
      <p className="text-emerald-400 font-bold flex items-center gap-2">
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
        </span>
        Django DRF REST API Connected
      </p>
      <p className="text-slate-500">Detailed billing, key rotation, and webhook settings are on the roadmap for this panel.</p>
    </div>
  </Panel>
);

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onExitAdmin }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("properties");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeMeta = NAV_ITEMS.find((n) => n.id === activeSection);

  return (
    <AdminUIProvider>
      <AdminAnimations />
      <div
        className="min-h-screen bg-[#0B0C10] text-slate-100 font-sans flex flex-col selection:bg-[#E04F33]/30 selection:text-white"
        style={{ "--admin-header-height": "73px" } as React.CSSProperties}
      >
        <AdminHeader
          admin={user}
          onExitAdmin={onExitAdmin}
          onToggleMenu={() => setIsSidebarOpen((prev) => !prev)}
        />

        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <AdminSidebar
            items={NAV_ITEMS}
            active={activeSection}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onSelect={(id) => setActiveSection(id)}
          />

          <main className="flex-1 min-w-0 w-full space-y-6">
            {activeSection === "properties" && <AdminPropertyManager />}
            {activeSection === "leads_bookings" && <AdminLeadsManager />}
            {activeSection === "blogs" && <AdminBlogManager />}
            {activeSection === "stories" && <AdminStoriesManager />}
            {activeSection === "settings" && <SettingsPanel />}
          </main>
        </div>
      </div>
    </AdminUIProvider>
  );
};
