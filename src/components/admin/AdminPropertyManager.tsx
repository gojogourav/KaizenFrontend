/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Download,
  RotateCcw,
  Plus,
  Lock,
  Edit,
  Trash2,
  X,
  Building,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";
import { z } from "zod";
import { propertyService } from "../../api/services";
import type { Property, PlatformListing } from "../../types/database";

const AVAILABLE_PLATFORMS = ["Airbnb", "Vrbo", "Booking.com", "Zillow", "Direct Website"];

interface PropertyItem {
  id: string | number;
  title: string;
  location: string;
  bedsBaths: string;
  monthlyRent: number;
  netProfit: number;
  occupancyEst: string;
  status: "AVAILABLE" | "OCCUPIED" | "UNDER CONTRACT" | "MAINTENANCE";
  imageUrl: string;
  description: string;
  listings: PlatformListing[];
}

const DEFAULT_PROPERTIES: PropertyItem[] = [
  {
    id: 1,
    title: "Coastal Retreat",
    location: "Pensacola, FL",
    bedsBaths: "3 bed, 2 bath",
    monthlyRent: 2200,
    netProfit: 1700,
    occupancyEst: "68%",
    status: "AVAILABLE",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    description: "Newly sourced luxury property in high-demand vacation district.",
    listings: [
      { platform: "Airbnb", url: "https://airbnb.com", isActive: true },
      { platform: "Vrbo", url: "https://vrbo.com", isActive: true }
    ],
  },
  {
    id: 2,
    title: "The Desert Oasis",
    location: "Scottsdale, AZ",
    bedsBaths: "4 bed, 3 bath",
    monthlyRent: 3800,
    netProfit: 2450,
    occupancyEst: "72%",
    status: "AVAILABLE",
    imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    description: "High-yield resort style villa with private pool and patio.",
    listings: [
      { platform: "Airbnb", url: "https://airbnb.com", isActive: true }
    ],
  }
];

// Zod Schema for robust payload validation
const propertySchema = z.object({
  title: z.string().min(2, "Title is required"),
  location: z.string().min(2, "Location is required"),
  monthlyRent: z.string().min(1, "Rent is required"),
  netProfit: z.string().min(1, "Profit is required"),
  bedsBaths: z.string().min(1, "Beds/Baths is required"),
  status: z.enum(["AVAILABLE", "OCCUPIED", "UNDER CONTRACT", "MAINTENANCE"]),
  imageUrl: z.string().url("Must be a valid image URL").or(z.literal("")),
  description: z.string().optional(),
  listings: z.array(z.object({
    platform: z.string().min(1),
    url: z.string().url("Must be a valid URL (include https://)"),
    isActive: z.boolean()
  })).optional()
});

export const AdminPropertyManager: React.FC = () => {
  const [properties, setProperties] = useState<PropertyItem[]>(DEFAULT_PROPERTIES);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    bedsBaths: "3 bed, 2 bath",
    monthlyRent: "2400",
    netProfit: "1800",
    status: "AVAILABLE" as "AVAILABLE" | "OCCUPIED" | "UNDER CONTRACT" | "MAINTENANCE",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    description: "Newly sourced luxury property in high-demand vacation district.",
    listings: [] as PlatformListing[]
  });

  const loadPropertiesFromApi = async () => {
    try {
      setLoading(true);
      const apiProps = await propertyService.getProperties();
      if (apiProps && apiProps.length > 0) {
        const mapped: PropertyItem[] = apiProps.map((p: any, idx: number) => {
          const rent = p.rent_monthly ?? p.price ?? p.adr ?? 2400;
          const profit = p.net_profit_monthly ?? Math.round(Number(rent) * 0.75);
          const mediaUrl = p.media?.[0]?.cdn_url ?? p.images?.[0];
          return {
            id: p.id,
            title: p.title,
            location: `${p.city || "Pensacola"}, ${p.state || "FL"}`,
            bedsBaths: p.bedsBaths || `${p.bedrooms || 3} bed, ${p.bathrooms || 2} bath`,
            monthlyRent: Number(rent),
            netProfit: Number(profit),
            occupancyEst: `${60 + (idx % 20)}%`,
            status: p.status || "AVAILABLE",
            imageUrl: mediaUrl || DEFAULT_PROPERTIES[idx % DEFAULT_PROPERTIES.length].imageUrl,
            description: p.description || "Newly sourced luxury property.",
            listings: p.listings || [],
          };
        });
        setProperties(mapped);
      }
    } catch {
      // Keep default properties if API error or empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropertiesFromApi();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFieldErrors({});
    setSubmitError(null);
    setFormData({
      title: "", location: "", bedsBaths: "3 bed, 2 bath",
      monthlyRent: "2400", netProfit: "1800", status: "AVAILABLE",
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      description: "Newly sourced luxury property in high-demand vacation district.",
      listings: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: PropertyItem) => {
    setEditingId(item.id);
    setFieldErrors({});
    setSubmitError(null);
    setFormData({
      title: item.title,
      location: item.location,
      bedsBaths: item.bedsBaths,
      monthlyRent: String(item.monthlyRent),
      netProfit: String(item.netProfit),
      status: item.status,
      imageUrl: item.imageUrl,
      description: item.description,
      listings: item.listings || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this property listing?")) return;
    try {
      await propertyService.deleteProperty(id).catch(() => {});
    } catch {}
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});
    setSubmitting(true);

    // 1. Zod Validation
    const validation = propertySchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        errors[issue.path.join('.')] = issue.message;
      });
      setFieldErrors(errors);
      setSubmitting(false);
      return;
    }

    const rentNum = parseFloat(formData.monthlyRent.replace(/[^0-9.]/g, "")) || 2400;
    const profitNum = parseFloat(formData.netProfit.replace(/[^0-9.]/g, "")) || 1800;
    const parts = formData.location.split(",");
    const city = parts[0]?.trim() || "Pensacola";
    const state = parts[1]?.trim() || "FL";

    const payload: any = {
      title: formData.title,
      city,
      state,
      price: rentNum,
      rent_monthly: rentNum,
      net_profit_monthly: profitNum,
      cash_to_start: Math.round(rentNum * 2),
      bedrooms: 3,
      bathrooms: 2,
      bedsBaths: formData.bedsBaths,
      status: formData.status,
      description: formData.description,
      image_url: formData.imageUrl,
      images: [formData.imageUrl],
      listings: formData.listings // Passes links directly to API
    };

    try {
      if (editingId) {
        await propertyService.updateProperty(editingId, payload);
      } else {
        await propertyService.createProperty(payload);
      }
      setIsModalOpen(false);
      loadPropertiesFromApi(); // Refresh table to show changes
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to save property. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = properties.filter((p) => p.status === "AVAILABLE").length;
  const totalYield = properties.reduce((acc, p) => acc + p.netProfit, 0);
  const totalPlatforms = properties.reduce((acc, p) => acc + (p.listings?.filter(l => l.isActive).length || 0), 0);

  return (
    <div className="space-y-6 text-slate-100 font-sans max-w-7xl mx-auto pb-12">
      {/* Top Workspace Header Card */}
      <div className="bg-[#141824]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold tracking-widest text-[#FF8A73] uppercase">
              <Lock className="w-3 h-3 text-[#E04F33]" />
              <span>Kaizen Property Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Property Management Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
              Manage luxury villa listings, specs, photo galleries, and platform booking links
              (Airbnb, Vrbo, Booking.com, Zillow, Direct Site). Changes update the customer portal
              instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => loadPropertiesFromApi()}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Refresh</span>
            </button>

            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-[#E04F33]/30 flex items-center gap-2 transition-all border border-white/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Property</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">Total Properties</p>
            <p className="text-2xl font-extrabold text-white font-mono">{properties.length} Units</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">Active Listings</p>
            <p className="text-2xl font-extrabold text-[#34D399] font-mono">{activeCount} Available</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">Active Platform Links</p>
            <p className="text-2xl font-extrabold text-[#FF8A73] font-mono">{totalPlatforms} Active</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">Total Net Monthly Yield</p>
            <p className="text-2xl font-extrabold text-[#34D399] font-mono">~${totalYield.toLocaleString()}/mo</p>
          </div>
        </div>
      </div>

      {/* Property Management Table Section */}
      <div className="bg-[#141824]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E04F33]/20 border border-[#E04F33]/40 rounded-xl text-[#FF8A73]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading">Property Management Table</h2>
              <p className="text-xs text-slate-400">Toggle platform links, edit financial specs, or add new luxury listings.</p>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 font-mono text-[10px] uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-4 font-bold tracking-wider">Property & Address</th>
                <th className="p-4 font-bold tracking-wider">Status / Occupancy</th>
                <th className="p-4 font-bold tracking-wider">Monthly Rent</th>
                <th className="p-4 font-bold tracking-wider">Active Platforms</th>
                <th className="p-4 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {properties.map((item) => {
                const activeLinks = item.listings?.filter(l => l.isActive) || [];
                return (
                <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{item.location} • {item.bedsBaths}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          item.status === "AVAILABLE" ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40" :
                          item.status === "OCCUPIED" ? "bg-amber-950/60 text-amber-400 border-amber-500/40" :
                          item.status === "UNDER CONTRACT" ? "bg-purple-950/60 text-purple-400 border-purple-500/40" :
                          "bg-rose-950/60 text-rose-400 border-rose-500/40"
                        }`}>
                        {item.status}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">Est. Occ: {item.occupancyEst}</p>
                    </div>
                  </td>

                  <td className="p-4 font-mono font-bold text-white whitespace-nowrap text-sm">
                    ${item.monthlyRent.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <div className="space-y-1 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {activeLinks.map((plat, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-[#FF8A73]/30 text-[#FF8A73] text-[10px] font-mono">
                            {plat.platform}
                          </span>
                        ))}
                      </div>
                      <p className="text-[9px] text-slate-400 font-mono">{activeLinks.length} Active</p>
                    </div>
                  </td>

                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(item)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all">
                        <Edit className="w-3.5 h-3.5 text-slate-400" /><span>Edit</span>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 rounded-lg text-xs transition-all" title="Delete listing">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#121622] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">

            <div className="flex items-center justify-between border-b border-white/10 pb-4 sticky top-0 bg-[#121622] z-10">
              <h3 className="text-xl font-bold text-white font-heading">
                {editingId ? "Edit Luxury Property" : "Create New Luxury Property"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="px-4 py-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#FF8A73]">Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={`w-full px-4 py-2.5 bg-black/40 border rounded-xl text-white focus:outline-none transition-colors ${fieldErrors.title ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#E04F33]'}`} />
                  {fieldErrors.title && <span className="text-[10px] text-red-500">{fieldErrors.title}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#FF8A73]">Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className={`w-full px-4 py-2.5 bg-black/40 border rounded-xl text-white focus:outline-none transition-colors ${fieldErrors.location ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#E04F33]'}`} />
                  {fieldErrors.location && <span className="text-[10px] text-red-500">{fieldErrors.location}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#FF8A73]">Beds/Baths</label>
                  <input type="text" value={formData.bedsBaths} onChange={e => setFormData({...formData, bedsBaths: e.target.value})} className={`w-full px-4 py-2.5 bg-black/40 border rounded-xl text-white focus:outline-none transition-colors ${fieldErrors.bedsBaths ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#E04F33]'}`} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#FF8A73]">Monthly Rent</label>
                  <input type="text" value={formData.monthlyRent} onChange={e => setFormData({...formData, monthlyRent: e.target.value})} className={`w-full px-4 py-2.5 bg-black/40 border rounded-xl text-white focus:outline-none transition-colors ${fieldErrors.monthlyRent ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#E04F33]'}`} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#FF8A73]">Net Profit</label>
                  <input type="text" value={formData.netProfit} onChange={e => setFormData({...formData, netProfit: e.target.value})} className={`w-full px-4 py-2.5 bg-black/40 border rounded-xl text-white focus:outline-none transition-colors ${fieldErrors.netProfit ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#E04F33]'}`} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#FF8A73]">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E04F33] transition-colors">
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="UNDER CONTRACT">UNDER CONTRACT</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#FF8A73]">Cover Image URL</label>
                <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className={`w-full px-4 py-2.5 bg-black/40 border rounded-xl text-white focus:outline-none transition-colors truncate ${fieldErrors.imageUrl ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#E04F33]'}`} />
                {fieldErrors.imageUrl && <span className="text-[10px] text-red-500">{fieldErrors.imageUrl}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#FF8A73]">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E04F33] transition-colors font-sans" />
              </div>

              {/* ---------------------------------------------------- */}
              {/* PLATFORM LINKS MANAGER */}
              {/* ---------------------------------------------------- */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-[#FF8A73] uppercase tracking-widest font-mono flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" /> External Platform Links
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, listings: [...formData.listings, { platform: 'Airbnb', url: '', isActive: true }] })}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.listings?.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3">

                      <select
                        value={item.platform}
                        onChange={(e) => {
                          const updated = [...formData.listings];
                          updated[idx].platform = e.target.value;
                          setFormData({ ...formData, listings: updated });
                        }}
                        className="px-3 py-2 bg-[#1A1C22] border border-white/10 rounded-lg text-white font-bold focus:border-[#E04F33] w-full sm:w-auto"
                      >
                        {AVAILABLE_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>

                      <div className="flex-1 w-full relative">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={item.url}
                          onChange={(e) => {
                            const updated = [...formData.listings];
                            updated[idx].url = e.target.value;
                            setFormData({ ...formData, listings: updated });
                          }}
                          className={`w-full px-3 py-2 bg-black/40 border rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none transition-all ${
                            fieldErrors[`listings.${idx}.url`] ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#E04F33]'
                          }`}
                        />
                        {fieldErrors[`listings.${idx}.url`] && (
                          <p className="text-[10px] text-red-500 mt-1 absolute -bottom-4 left-0">{fieldErrors[`listings.${idx}.url`]}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formData.listings];
                            updated[idx].isActive = !updated[idx].isActive;
                            setFormData({ ...formData, listings: updated });
                          }}
                          className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-[10px] font-bold transition-all border flex justify-center items-center gap-1 ${
                            item.isActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-slate-400 border-white/10'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Hidden'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.listings.filter((_: any, i: number) => i !== idx);
                            setFormData({ ...formData, listings: updated });
                          }}
                          className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-lg border border-white/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {formData.listings?.length === 0 && (
                    <div className="p-4 text-center border border-dashed border-white/20 rounded-xl bg-white/5 text-slate-400 text-xs italic">
                      No external platform links added. Property will display as "Direct Lease Only".
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-white/10 sticky bottom-0 bg-[#121622] py-2 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] disabled:opacity-60 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#E04F33]/30 transition-all border border-white/20"
                >
                  {submitting ? (editingId ? "Saving…" : "Creating…") : (editingId ? "Save Changes" : "Create Property")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
