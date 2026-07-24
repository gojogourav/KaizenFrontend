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
    <div className="min-h-screen bg-[#080312] text-slate-100 font-sans flex flex-col">
      
      {/* 1. DEDICATED ADMIN TOP HEADER BAR (STRICTLY NO PUBLIC SIGN IN BUTTON) */}
      <header className="sticky top-0 z-40 bg-[#0d041e]/90 backdrop-blur-md border-b border-purple-800/60 px-6 py-3.5 flex items-center justify-between">
        
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-pink-600 p-0.5 shadow-lg shadow-fuchsia-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d041e] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-fuchsia-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-serif">KAIZEN</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-900/80 text-fuchsia-300 font-mono text-[9px] font-bold uppercase tracking-widest border border-purple-500/40">
                Admin Control Portal
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Enterprise Management Suite</p>
          </div>
        </div>

        {/* Right Admin Profile & Exit/SignOut */}
        <div className="flex items-center gap-4">
          
          {/* Admin Badge */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-[#170830] border border-purple-700/60 rounded-full">
            <img src={adminAvatar} alt={adminName} className="w-7 h-7 rounded-full object-cover border border-fuchsia-400" />
            <div className="text-left">
              <p className="text-xs font-bold text-white leading-tight">{adminName}</p>
              <p className="text-[9px] text-purple-300 font-mono truncate max-w-[140px]">{adminEmail}</p>
            </div>
          </div>

          {/* Exit Admin / Sign Out Button */}
          <button
            onClick={() => {
              onExitAdmin();
            }}
            className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md font-sans"
            title="Exit Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Exit Portal</span>
          </button>
        </div>

      </header>

      {/* 2. ADMIN MAIN BODY WITH DEDICATED SIDEBAR */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* DEDICATED ADMIN SIDEBAR */}
        <aside className="w-full lg:w-72 bg-[#120524] border border-purple-800/60 rounded-3xl p-5 shadow-2xl shrink-0 space-y-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 font-mono block mb-3 px-2">
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
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-600/30 font-bold'
                        : 'text-slate-300 hover:bg-purple-900/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        isActive ? 'bg-white/20 text-white' : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{item.label}</p>
                        <p className={`text-[9px] mt-0.5 ${isActive ? 'text-pink-100' : 'text-slate-400'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0.5 text-white' : 'opacity-0 group-hover:opacity-100 text-slate-400'}`} />
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-purple-900/60 px-2 space-y-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-950 to-fuchsia-950 border border-purple-700/40 text-xs text-purple-200">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Live System Health</span>
              </div>
              <p className="text-[10px] text-slate-300">All services operating normally. Server latency: 12ms.</p>
            </div>
          </div>
        </aside>

        {/* ADMIN CONTENT PANEL */}
        <main className="flex-1 w-full bg-[#120524] border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl min-h-[620px]">
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
