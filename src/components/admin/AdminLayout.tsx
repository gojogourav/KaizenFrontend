/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Building, Users, FileText, Quote, Settings, LogOut, ShieldCheck, Sparkles, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BlogManager } from './BlogManager';
import { StoryManager } from './StoryManager';
import { LeadsBookingsManager } from './LeadsBookingsManager';
import { PlatformSettings } from './PlatformSettings';

interface AdminLayoutProps {
  onExitAdmin: () => void;
  // Existing Property Table children or props
  propertyManagementView: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onExitAdmin, propertyManagementView }) => {
  const { user, logout } = useAuth();
  const [activeAdminSection, setActiveAdminSection] = useState<'properties' | 'leads_bookings' | 'blogs' | 'stories' | 'settings'>('properties');

  const adminName = user?.name || 'Admin Shakti Sahoo';
  const adminEmail = user?.email || 'shaktisahoo24@gmail.com';
  const adminAvatar = user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  const navItems = [
    {
      id: 'properties',
      label: 'Properties & Listings',
      icon: Building,
      description: 'Manage villa listings, pricing & platforms'
    },
    {
      id: 'leads_bookings',
      label: 'Leads & Bookings',
      icon: Users,
      description: 'Inbound inquiries & lease holds'
    },
    {
      id: 'blogs',
      label: 'Editorial Blogs',
      icon: FileText,
      description: 'Articles & design playbooks'
    },
    {
      id: 'stories',
      label: 'Success Stories',
      icon: Quote,
      description: 'Customer reviews & testimonials'
    },
    {
      id: 'settings',
      label: 'Platform Settings',
      icon: Settings,
      description: 'Global fees, keys & announcements'
    }
  ] as const;

  return (
    <div className="min-h-screen bg-[#0F1014] text-slate-100 font-sans flex flex-col">
      
      {/* 1. DEDICATED ADMIN TOP HEADER BAR (STRICTLY NO PUBLIC SIGN IN BUTTON) */}
      <header className="sticky top-0 z-40 bg-[#0F1014]/90 backdrop-blur-2xl border-b border-white/10 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4 shadow-apple-glass apple-specular">
        
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3 min-w-0 max-w-full">
          <div className="w-10 h-10 rounded-2xl bg-[#E04F33] p-0.5 shadow-lg shadow-[#E04F33]/25 flex items-center justify-center border border-white/20 shrink-0">
            <div className="w-full h-full bg-[#0F1014] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#E04F33]" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-heading shrink-0">KAIZEN</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#FF8A73] font-mono text-[9px] font-bold uppercase tracking-widest border border-white/15 shrink-0 whitespace-nowrap">
                Admin Control Portal
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate">Enterprise Management Suite</p>
          </div>
        </div>

        {/* Right Admin Profile & Exit/SignOut */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          
          {/* Admin Badge */}
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 bg-white/5 border border-white/15 rounded-full backdrop-blur-xl">
            <img src={adminAvatar} alt={adminName} className="w-7 h-7 rounded-full object-cover border border-[#E04F33] shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-white leading-tight truncate">{adminName}</p>
              <p className="text-[9px] text-slate-300 font-mono truncate max-w-[140px]">{adminEmail}</p>
            </div>
          </div>

          {/* Exit Admin / Sign Out Button */}
          <button
            onClick={() => {
              onExitAdmin();
            }}
            className="px-3.5 sm:px-4 py-2 bg-rose-950/50 hover:bg-rose-900/70 text-rose-200 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md font-sans backdrop-blur-xl shrink-0"
            title="Exit Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="whitespace-nowrap">Exit Portal</span>
          </button>
        </div>

      </header>

      {/* 2. ADMIN MAIN BODY WITH DEDICATED SIDEBAR */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* DEDICATED ADMIN SIDEBAR */}
        <aside className="w-full lg:w-72 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl shadow-black/40 shrink-0 space-y-6 apple-specular">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF8A73] font-mono block mb-3 px-2">
              ADMIN NAVIGATION
            </span>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeAdminSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveAdminSection(item.id as any)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'bg-white/15 border border-white/20 text-white shadow-xl shadow-black/30 font-bold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#E04F33] rounded-r-full" />
                    )}
                    <div className="flex items-center gap-3 pl-1">
                      <div className={`p-2 rounded-xl transition-colors ${
                        isActive ? 'bg-[#E04F33] text-white shadow-md shadow-[#E04F33]/25' : 'bg-white/5 text-slate-300 border border-white/10'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{item.label}</p>
                        <p className={`text-[9px] mt-0.5 ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0.5 text-[#FF8A73]' : 'opacity-0 group-hover:opacity-100 text-slate-400'}`} />
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-white/10 px-2 space-y-3">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 backdrop-blur-xl">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#E04F33]" />
                <span className="text-white">Live System Health</span>
              </div>
              <p className="text-[10px] text-slate-300">All services operating normally. Server latency: 12ms.</p>
            </div>
          </div>
        </aside>

        {/* ADMIN CONTENT PANEL */}
        <main className="flex-1 w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 min-h-[620px] apple-specular">
          {activeAdminSection === 'properties' && propertyManagementView}
          {activeAdminSection === 'leads_bookings' && <LeadsBookingsManager />}
          {activeAdminSection === 'blogs' && <BlogManager />}
          {activeAdminSection === 'stories' && <StoryManager />}
          {activeAdminSection === 'settings' && <PlatformSettings />}
        </main>

      </div>

    </div>
  );
};
