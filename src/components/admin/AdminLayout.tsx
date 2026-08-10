import React, { useState } from "react";
import {
  Building,
  Users,
  FileText,
  MessageSquareQuote,
  Settings,
} from "lucide-react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar, type AdminSection } from "./AdminSidebar";
import { AdminPropertyManager } from "./AdminPropertyManager";
import { AdminLeadsManager } from "./AdminLeadsManager";
import { AdminBlogManager } from "./AdminBlogManager";
import { AdminStoriesManager } from "./AdminStoriesManager";
import { useAuth } from "../../context/AuthContext";

interface AdminLayoutProps {
  onExitAdmin: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onExitAdmin }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("properties");

  const navItems = [
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

  return (
    <div className="min-h-screen bg-[#0B0D14] text-slate-100 font-sans flex flex-col">
      <AdminHeader admin={user} onExitAdmin={onExitAdmin} />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        <AdminSidebar
          items={navItems}
          active={activeSection}
          onSelect={(id) => setActiveSection(id)}
        />

        <main className="flex-1 min-w-0">
          {activeSection === "properties" && <AdminPropertyManager />}
          {activeSection === "leads_bookings" && <AdminLeadsManager />}
          {activeSection === "blogs" && <AdminBlogManager />}
          {activeSection === "stories" && <AdminStoriesManager />}

          {activeSection === "settings" && (
            <div className="bg-[#141824]/90 border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-[#E04F33]" />
                <h2 className="text-xl font-bold text-white font-heading">
                  Platform Settings &amp; API Keys
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Configure global service fees, API credentials, and portal notifications.
              </p>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 space-y-2">
                <p className="text-emerald-400 font-bold">✓ Django DRF REST API Connected</p>
                <p className="text-slate-400">Host: http://127.0.0.1:8000</p>
                <p className="text-slate-400">DB: Supabase (PostGIS)</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
