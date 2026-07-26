/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Percent, Mail, Key, Bell } from 'lucide-react';
import { api } from '../../api/client';

export const PlatformSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    commissionRatePercent: 8.5,
    maintenanceMode: false,
    autoApproveLeases: true,
    requireCglInsurance: true,
    stripePublicKey: 'pk_test_51KaizenRealEstateKeyExample',
    contactEmail: 'concierge@kaizenestates.com',
    globalNotificationBanner: 'New Luxury Villas Added in Puri and Scottsdale - Special Summer Rates Active!'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.settings) {
          setSettings(res.settings);
        }
      } catch (err) {
        console.warn('Failed to fetch platform settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.updateSettings(settings);
      setMessage('Platform settings updated & saved successfully!');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.warn('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-mono">Loading global platform settings...</div>;
  }

  return (
    <div className="space-y-6 text-slate-100 font-sans max-w-4xl">
      
      {/* Header Bar */}
      <div className="pb-4 border-b border-white/10">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#E04F33]" />
          Global Platform <span className="text-[#E04F33]">Settings & Config</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure commission rates, automated lease locks, Stripe integration keys, and maintenance banner announcements.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: Revenue & Commission Rates */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2 text-[#FF8A73]">
            <Percent className="w-4 h-4" />
            Financial & Commission Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Platform Commission Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={settings.commissionRatePercent}
                onChange={(e) => setSettings({ ...settings, commissionRatePercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#E04F33]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Applied on each lease hold transaction.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Stripe Public API Key
              </label>
              <input
                type="text"
                value={settings.stripePublicKey}
                onChange={(e) => setSettings({ ...settings, stripePublicKey: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#E04F33]"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Security & Automation Toggles */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2 text-[#FF8A73]">
            <ShieldCheck className="w-4 h-4" />
            Security & Lease Approval Rules
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <p className="font-bold text-white">Auto-Approve 15-Minute Lease Locks</p>
                <p className="text-[10px] text-slate-400">Instantly grant exclusive hold sessions without manual admin authorization.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoApproveLeases}
                onChange={(e) => setSettings({ ...settings, autoApproveLeases: e.target.checked })}
                className="w-5 h-5 accent-[#E04F33] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <p className="font-bold text-white">Require Commercial General Liability (CGL) Insurance</p>
                <p className="text-[10px] text-slate-400">Mandate verified COI documents before lease execution.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireCglInsurance}
                onChange={(e) => setSettings({ ...settings, requireCglInsurance: e.target.checked })}
                className="w-5 h-5 accent-[#E04F33] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <p className="font-bold text-rose-300">Platform Maintenance Mode</p>
                <p className="text-[10px] text-slate-400">Restrict public bookings temporarily during system upgrades.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Communications & Notification Banner */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2 text-[#FF8A73]">
            <Bell className="w-4 h-4" />
            Global Announcements & Contact
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Concierge Support Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#E04F33]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Global Notification Banner Text
              </label>
              <input
                type="text"
                value={settings.globalNotificationBanner}
                onChange={(e) => setSettings({ ...settings, globalNotificationBanner: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 focus:outline-none focus:border-[#E04F33]"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#E04F33]/25 border border-white/20 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer font-sans"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
