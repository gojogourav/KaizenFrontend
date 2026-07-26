/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { m } from 'motion/react';
import { 
  getStoredDeals, 
  saveDeals, 
  resetDealsToDefault, 
  normalizeDeal,
  Deal,
  PlatformListing
} from './dealsData';
import { 
  Building, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  MapPin, 
  Maximize2, 
  Sparkles, 
  Clock, 
  Info, 
  Lock, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Check, 
  Settings, 
  Send, 
  FileText, 
  RefreshCw, 
  Download, 
  Users, 
  Eye, 
  AlertTriangle, 
  Sliders, 
  Layers,
  Heart,
  MessageSquare,
  Compass,
  Award,
  BookOpen,
  HeartHandshake,
  Star,
  CheckCircle,
  ShieldCheck,
  ExternalLink,
  Globe,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  User as UserIcon,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { FavoritesView } from './components/FavoritesView';
import { BookingsView } from './components/BookingsView';
import { LockPurchaseModal } from './components/LockPurchaseModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { HowItWorks } from './components/HowItWorks';
import { PropertyCard } from './components/PropertyCard';

// Platform Colors & Icons map
const PLATFORM_CONFIG: Record<string, { bg: string; text: string; border: string; iconLabel: string }> = {
  'Airbnb': {
    bg: 'bg-white/5 hover:bg-white/15',
    text: 'text-white',
    border: 'border-white/15',
    iconLabel: '🏠 Airbnb'
  },
  'Vrbo': {
    bg: 'bg-white/5 hover:bg-white/15',
    text: 'text-white',
    border: 'border-white/15',
    iconLabel: '🏖️ Vrbo'
  },
  'Booking.com': {
    bg: 'bg-white/5 hover:bg-white/15',
    text: 'text-white',
    border: 'border-white/15',
    iconLabel: '🏨 Booking.com'
  },
  'Zillow': {
    bg: 'bg-white/5 hover:bg-white/15',
    text: 'text-white',
    border: 'border-white/15',
    iconLabel: '🏡 Zillow'
  },
  'Direct Website': {
    bg: 'bg-white/5 hover:bg-white/15',
    text: 'text-white',
    border: 'border-white/15',
    iconLabel: '🌐 Direct Website'
  },
  'Custom': {
    bg: 'bg-white/5 hover:bg-white/15',
    text: 'text-white',
    border: 'border-white/15',
    iconLabel: '🔗 Platform'
  }
};

const AVAILABLE_PLATFORMS = ['Airbnb', 'Vrbo', 'Booking.com', 'Zillow', 'Direct Website', 'Custom'];

import { AirbnbSearchBar, GuestCount, SearchPayload } from './components/AirbnbSearchBar';

export default function App() {
  const { user, isAuthenticated, logout, favorites, toggleFavorite } = useAuth();

  // Zero-JS First Paint Hybrid Splash State
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFading(true);
      const removeTimer = setTimeout(() => {
        setShowSplash(false);
      }, 450);
      return () => clearTimeout(removeTimer);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'properties' | 'how-it-works' | 'blogs' | 'stories' | 'experiences' | 'about' | 'admin' | 'dashboard' | 'favorites' | 'bookings'>('properties');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'UNDER CONTRACT' | 'UNDER REVIEW'>('ALL');
  
  // Airbnb Search Bar States
  const [searchWhere, setSearchWhere] = useState('');
  const [searchWhenDisplay, setSearchWhenDisplay] = useState('');
  const [searchStartDate, setSearchStartDate] = useState<Date | null>(null);
  const [searchEndDate, setSearchEndDate] = useState<Date | null>(null);
  const [searchGuestCount, setSearchGuestCount] = useState<GuestCount>({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });
  
  // Storage & Core Data States
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Authentication & Lock Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLockPurchaseModal, setShowLockPurchaseModal] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  
  // Property Modal & Image Gallery States
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Admin Property Editor Modal State
  const [showPropertyEditorModal, setShowPropertyEditorModal] = useState(false);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  
  // Admin Form State
  const [adminForm, setAdminForm] = useState<{
    title: string;
    location: string;
    bedsBaths: string;
    squareFeet: string;
    furnished: 'Yes' | 'No';
    monthlyRent: string;
    leaseTerm: string;
    projectedAnnualRevenue: string;
    estOccupancy: string;
    adr: string;
    securityDeposit: string;
    concessions: string;
    availability: string;
    estNetMonthlyProfit: string;
    totalCashToStart: string;
    specialRequirements: string;
    imageUrl: string;
    images: string[];
    status: 'AVAILABLE' | 'UNDER CONTRACT' | 'UNDER REVIEW' | 'OCCUPIED' | 'MAINTENANCE';
    description: string;
    listings: PlatformListing[];
  }>({
    title: '',
    location: '',
    bedsBaths: '3 bed, 2 bath',
    squareFeet: '1,200',
    furnished: 'Yes',
    monthlyRent: '$2,200',
    leaseTerm: '12 months',
    projectedAnnualRevenue: '$55,000',
    estOccupancy: '70%',
    adr: '$210',
    securityDeposit: '$4,000',
    concessions: 'None',
    availability: 'ASAP',
    estNetMonthlyProfit: '~$1,700',
    totalCashToStart: '$9,000',
    specialRequirements: 'CGL insurance + COI',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    status: 'AVAILABLE',
    description: 'Vetted luxury vacation rental property with proven occupancy and turn-key amenities.',
    listings: [
      { platform: 'Airbnb', url: 'https://www.airbnb.com', isActive: true },
      { platform: 'Vrbo', url: 'https://www.vrbo.com', isActive: true }
    ]
  });

  const [newImageUrlInput, setNewImageUrlInput] = useState('');

  // Initialize Data
  useEffect(() => {
    setDeals(getStoredDeals());
  }, []);

  // Sync state helper
  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const isAdmin = Boolean(
    user?.is_staff ||
    user?.is_superuser ||
    user?.role === 'ADMIN' ||
    user?.role === 'admin'
  );

  // Lazy Auth Guard helper for Phase 2 Transactional Actions & Protected Routes
  const requireAuth = (onAuthSuccess: () => void, targetTabName?: string) => {
    if (isAuthenticated) {
      onAuthSuccess();
    } else {
      setPendingAction(() => onAuthSuccess);
      if (targetTabName) setPendingTab(targetTabName);
      setShowAuthModal(true);
      triggerNotification('Please sign in to proceed with your booking transaction.', 'info');
    }
  };

  // Handle URL route checking (e.g. /admin or #admin) & route protection guard
  useEffect(() => {
    const handleLocationCheck = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        if (!isAuthenticated) {
          setActiveTab('properties');
          if (window.location.hash === '#admin') window.location.hash = '';
          setPendingTab('admin');
          setShowAuthModal(true);
          triggerNotification('Admin Area Protected: Please sign in with admin credentials (admin / admin123).', 'info');
        } else if (!isAdmin) {
          setActiveTab('properties');
          if (window.location.hash === '#admin') window.location.hash = '';
          triggerNotification('403 Access Denied: Admin privileges required.', 'error');
        } else {
          setActiveTab('admin');
        }
      }
    };

    handleLocationCheck();
    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);
    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, [isAuthenticated, isAdmin]);

  // Backend Search State
  const [isSearching, setIsSearching] = useState(false);

  // Handle Search Execution from Airbnb Bar with full backend API integration
  const handleExecuteSearch = async (payload?: SearchPayload) => {
    setIsSearching(true);
    const searchPayload: SearchPayload = payload || {
      location: searchWhere,
      startDate: searchStartDate ? searchStartDate.toISOString().split('T')[0] : null,
      endDate: searchEndDate ? searchEndDate.toISOString().split('T')[0] : null,
      guests: searchGuestCount
    };

    try {
      const response = await fetch('/api/properties/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: searchPayload.location,
          startDate: searchPayload.startDate,
          endDate: searchPayload.endDate,
          guests: searchPayload.guests,
          statusFilter
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.deals)) {
          setDeals(data.deals.map(normalizeDeal));
          setSearchQuery(searchPayload.location);
          const totalG = searchPayload.guests.adults + searchPayload.guests.children;
          triggerNotification(`Found ${data.count} luxury ${data.count === 1 ? 'villa' : 'villas'} matching "${searchPayload.location || 'All Locations'}".`, 'info');
        }
      } else {
        // Fallback for offline / static client filtering
        setSearchQuery(searchWhere);
      }
    } catch (err) {
      console.warn('Backend search API unreachable, using client state:', err);
      setSearchQuery(searchWhere);
    } finally {
      setIsSearching(false);
    }
  };

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const q = (searchWhere || searchQuery).toLowerCase().trim();
      const matchesSearch = !q || 
                            deal.location.toLowerCase().includes(q) ||
                            deal.title.toLowerCase().includes(q) ||
                            (deal.description && deal.description.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'ALL' || deal.status === statusFilter;
      const matchesFavorite = !showFavoritesOnly || favorites.includes(deal.id);
      return matchesSearch && matchesStatus && matchesFavorite;
    });
  }, [deals, searchWhere, searchQuery, statusFilter, showFavoritesOnly, favorites]);

  // Open property details
  const handleOpenProspectus = (deal: Deal) => {
    setSelectedDeal(deal);
    setActiveImageIndex(0);
  };

  // Admin: Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingDealId(null);
    setAdminForm({
      title: '',
      location: '',
      bedsBaths: '3 bed, 2 bath',
      squareFeet: '1,300',
      furnished: 'Yes',
      monthlyRent: '$2,400',
      leaseTerm: '12 months',
      projectedAnnualRevenue: '$58,000',
      estOccupancy: '70%',
      adr: '$220',
      securityDeposit: '$4,500',
      concessions: 'None',
      availability: 'ASAP',
      estNetMonthlyProfit: '~$1,800',
      totalCashToStart: '$9,500',
      specialRequirements: 'CGL insurance + COI',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'AVAILABLE',
      description: 'Newly sourced luxury property in high-demand vacation district.',
      listings: [
        { platform: 'Airbnb', url: 'https://www.airbnb.com', isActive: true },
        { platform: 'Vrbo', url: 'https://www.vrbo.com', isActive: true },
        { platform: 'Booking.com', url: 'https://www.booking.com', isActive: true }
      ]
    });
    setNewImageUrlInput('');
    setShowPropertyEditorModal(true);
  };

  // Admin: Open Edit Modal
  const handleOpenEditModal = (deal: Deal) => {
    setEditingDealId(deal.id);
    setAdminForm({
      title: deal.title || '',
      location: deal.location || '',
      bedsBaths: deal.bedsBaths || '',
      squareFeet: String(deal.squareFeet || ''),
      furnished: (deal.furnished as 'Yes' | 'No') || 'Yes',
      monthlyRent: deal.monthlyRent || '',
      leaseTerm: deal.leaseTerm || '12 months',
      projectedAnnualRevenue: deal.projectedAnnualRevenue || '',
      estOccupancy: deal.estOccupancy || '',
      adr: deal.adr || '',
      securityDeposit: deal.securityDeposit || '',
      concessions: deal.concessions || '',
      availability: deal.availability || '',
      estNetMonthlyProfit: deal.estNetMonthlyProfit || '',
      totalCashToStart: deal.totalCashToStart || '',
      specialRequirements: deal.specialRequirements || '',
      imageUrl: deal.imageUrl || '',
      images: Array.isArray(deal.images) && deal.images.length > 0 ? [...deal.images] : [deal.imageUrl],
      status: deal.status || 'AVAILABLE',
      description: deal.description || '',
      listings: Array.isArray(deal.listings) ? deal.listings.map(l => ({ ...l })) : []
    });
    setNewImageUrlInput('');
    setShowPropertyEditorModal(true);
  };

  // Admin: Save Deal
  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.title || !adminForm.location || !adminForm.monthlyRent) {
      triggerNotification('Please complete required fields (Title, Location, Rent)', 'error');
      return;
    }

    const primaryImage = adminForm.images[0] || adminForm.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';

    let updatedDeals: Deal[] = [];
    if (editingDealId) {
      updatedDeals = deals.map(d => {
        if (d.id === editingDealId) {
          return {
            ...d,
            ...adminForm,
            imageUrl: primaryImage,
            images: adminForm.images.length > 0 ? adminForm.images : [primaryImage]
          };
        }
        return d;
      });
      triggerNotification('Property updated successfully!');
    } else {
      const newDeal: Deal = {
        id: 'prop-' + Date.now(),
        ...adminForm,
        imageUrl: primaryImage,
        images: adminForm.images.length > 0 ? adminForm.images : [primaryImage]
      };
      updatedDeals = [newDeal, ...deals];
      triggerNotification('New property added to catalog!');
    }

    setDeals(updatedDeals);
    saveDeals(updatedDeals);
    setShowPropertyEditorModal(false);
  };

  // Admin: Delete deal
  const handleDeleteProperty = (id: string) => {
    if (confirm('Are you sure you want to delete this property listing?')) {
      const updated = deals.filter(d => d.id !== id);
      setDeals(updated);
      saveDeals(updated);
      triggerNotification('Property deleted successfully.', 'info');
    }
  };

  // Admin: Toggle Property Status
  const handleToggleStatus = (id: string) => {
    const updated = deals.map(d => {
      if (d.id === id) {
        const nextStatus: Deal['status'] = 
          d.status === 'AVAILABLE' ? 'OCCUPIED' :
          d.status === 'OCCUPIED' ? 'UNDER CONTRACT' : 'AVAILABLE';
        return { ...d, status: nextStatus };
      }
      return d;
    });
    setDeals(updated);
    saveDeals(updated);
    triggerNotification('Property status updated.', 'info');
  };

  // Admin: Toggle Listing Active State directly from Overview
  const handleToggleListingActive = (dealId: string, platformIndex: number) => {
    const updated = deals.map(d => {
      if (d.id === dealId) {
        const newListings = d.listings.map((item, idx) => {
          if (idx === platformIndex) {
            return { ...item, isActive: !item.isActive };
          }
          return item;
        });
        return { ...d, listings: newListings };
      }
      return d;
    });
    setDeals(updated);
    saveDeals(updated);
    triggerNotification('Platform listing status toggled.', 'info');
  };

  // Admin: Reset deals
  const handleResetToDefault = () => {
    if (confirm('Reset property database back to default initial listings?')) {
      const defaults = resetDealsToDefault();
      setDeals(defaults);
      triggerNotification('Property database reset to default.', 'info');
    }
  };

  // Export JSON Schema
  const handleDownloadDealsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "kaizen_properties.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerNotification('Property catalog exported to JSON.');
  };

  // Render Isolated Admin Layout if activeTab === 'admin'
  if (activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-[#0F1014] text-slate-100 font-sans selection:bg-[#E04F33] selection:text-white">
        
        {/* Toast Notification Banner */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl transition-all duration-300 animate-slide-in ${
            notification.type === 'success' ? 'bg-black/90 border-emerald-500/40 text-emerald-300 shadow-emerald-950/50' :
            notification.type === 'error' ? 'bg-black/90 border-red-500/40 text-red-300 shadow-red-950/50' :
            'bg-black/90 border-[#E04F33]/40 text-[#FF8A73] shadow-black/50'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              notification.type === 'success' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
              notification.type === 'error' ? 'bg-red-400 shadow-[0_0_8px_#f87171]' : 'bg-[#E04F33] shadow-[0_0_8px_#E04F33]'
            }`} />
            <p className="text-xs font-bold tracking-wide uppercase font-mono">
              {notification.message}
            </p>
          </div>
        )}

        {/* Dedicated Isolated Admin Layout */}
        <AdminLayout
          onExitAdmin={() => {
            setActiveTab('properties');
            window.location.hash = '';
          }}
          propertyManagementView={
            <div className="space-y-8 animate-fade-in">
              
              {/* Admin Header & Stats Banner */}
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full mb-3 border border-white/10">
                      <Lock className="w-3.5 h-3.5 text-[#E04F33]" />
                      <span className="text-[10px] font-bold text-[#FF8A73] tracking-wider uppercase font-mono">Kaizen Property Portal</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
                      Property Management Workspace
                    </h1>
                    <p className="text-slate-400 text-xs mt-1 max-w-xl leading-relaxed">
                      Manage luxury villa listings, specs, photo galleries, and platform booking links (Airbnb, Vrbo, Booking.com, Zillow, Direct Site). Changes update the customer portal instantly.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={handleDownloadDealsJson}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-mono"
                    >
                      <Download className="w-4 h-4 text-[#E04F33]" />
                      Export Schema
                    </button>
                    <button 
                      onClick={handleResetToDefault}
                      className="px-4 py-2.5 bg-white/5 hover:bg-red-950/60 border border-red-900/40 text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-mono"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset Defaults
                    </button>
                    <button 
                      onClick={handleOpenCreateModal}
                      className="px-6 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#E04F33]/25 flex items-center gap-2 font-mono border border-white/20 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      + Add New Property
                    </button>
                  </div>
                </div>

                {/* Quick High-Level Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Total Properties</span>
                    <span className="text-2xl font-black text-white font-mono mt-0.5 block">{deals.length} Units</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Active Listings</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
                      {deals.filter(d => d.status === 'AVAILABLE').length} Available
                    </span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Active Platform Links</span>
                    <span className="text-2xl font-black text-[#FF8A73] font-mono mt-0.5 block">
                      {deals.reduce((acc, d) => acc + d.listings.filter(l => l.isActive).length, 0)} Active
                    </span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Total Net Monthly Yield</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
                      ~${deals.reduce((acc, d) => acc + (parseInt(d.estNetMonthlyProfit.replace(/[^0-9]/g, '')) || 0), 0).toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Property Overview Management Table */}
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-extrabold text-xl text-white font-serif flex items-center gap-2">
                      <Building className="w-5 h-5 text-[#E04F33]" />
                      Property Management Table
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Toggle platform links, edit financial specs, or add new luxury listings.</p>
                  </div>

                  <button 
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 font-mono shadow-md cursor-pointer border border-white/10"
                  >
                    <Plus className="w-4 h-4" />
                    Add Property
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[720px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/10 font-mono text-[11px] text-slate-300">
                        <th className="py-3.5 px-4 font-bold min-w-[220px]">Property & Address</th>
                        <th className="py-3.5 px-4 font-bold min-w-[140px]">Status / Occupancy</th>
                        <th className="py-3.5 px-4 font-bold min-w-[110px]">Monthly Rent</th>
                        <th className="py-3.5 px-4 font-bold min-w-[130px]">Net Monthly Profit</th>
                        <th className="py-3.5 px-4 font-bold min-w-[160px]">Active Platforms</th>
                        <th className="py-3.5 px-4 text-right font-bold min-w-[110px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {deals.map(deal => {
                        const activeCount = deal.listings.filter(l => l.isActive).length;
                        return (
                          <tr key={deal.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 min-w-[220px]">
                              <div className="flex items-center gap-4 min-w-0">
                                <img 
                                  src={deal.imageUrl} 
                                  alt={deal.title}
                                  className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-extrabold text-white text-sm font-serif truncate">{deal.title}</p>
                                  <p className="text-[10px] text-slate-400 font-mono break-words leading-tight mt-0.5">{deal.location} • {deal.bedsBaths}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 min-w-[140px]">
                              <div className="flex flex-col gap-1 min-w-0">
                                <button
                                  onClick={() => handleToggleStatus(deal.id)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black font-mono border transition-all cursor-pointer w-max ${
                                    deal.status === 'AVAILABLE' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900' :
                                    deal.status === 'OCCUPIED' ? 'bg-slate-900/90 text-slate-300 border-slate-700/40 hover:bg-slate-800' :
                                    'bg-amber-950/90 text-amber-300 border-amber-500/40 hover:bg-amber-900'
                                  }`}
                                  title="Click to cycle status"
                                >
                                  {deal.status}
                                </button>
                                <span className="block text-[10px] text-slate-400 font-mono">Est. Occ: {deal.estOccupancy}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                              {deal.monthlyRent}
                            </td>

                            <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">
                              {deal.estNetMonthlyProfit}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap items-center gap-1.5 max-w-[200px]">
                                {deal.listings.map((item, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleToggleListingActive(deal.id, idx)}
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono transition-all border cursor-pointer ${
                                      item.isActive 
                                        ? 'bg-[#E04F33]/20 text-[#FF8A73] border-[#E04F33]/40' 
                                        : 'bg-white/5 text-slate-500 border-white/10 line-through'
                                    }`}
                                    title={`Toggle ${item.platform} ON/OFF`}
                                  >
                                    {item.platform}
                                  </button>
                                ))}
                                {deal.listings.length === 0 && (
                                  <span className="text-[10px] text-slate-500 italic font-mono">No platforms</span>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-400 font-mono block mt-1">
                                {activeCount} of {deal.listings.length} Active
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleOpenEditModal(deal)}
                                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg border border-white/10 transition-colors flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteProperty(deal.id)}
                                  className="p-1.5 bg-white/5 hover:bg-red-950/60 text-red-400 rounded-lg border border-white/10 transition-colors cursor-pointer"
                                  title="Delete Property"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          }
        />

        {/* Global Property Editor Modal if triggered in Admin */}
        {showPropertyEditorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
            <div className="relative w-full max-w-3xl bg-[#0F1014] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-100 apple-specular">
              <button 
                onClick={() => setShowPropertyEditorModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-4 font-serif">
                {editingDealId ? 'Edit Property Specs' : 'Create New Luxury Property'}
              </h2>

              <form onSubmit={handleSaveProperty} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#FF8A73] uppercase mb-1 font-mono">Title</label>
                    <input 
                      type="text" 
                      required
                      value={adminForm.title}
                      onChange={(e) => setAdminForm({...adminForm, title: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#FF8A73] uppercase mb-1 font-mono">Location</label>
                    <input 
                      type="text" 
                      required
                      value={adminForm.location}
                      onChange={(e) => setAdminForm({...adminForm, location: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#FF8A73] uppercase mb-1 font-mono">Beds/Baths</label>
                    <input 
                      type="text" 
                      value={adminForm.bedsBaths}
                      onChange={(e) => setAdminForm({...adminForm, bedsBaths: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#FF8A73] uppercase mb-1 font-mono">Monthly Rent</label>
                    <input 
                      type="text" 
                      value={adminForm.monthlyRent}
                      onChange={(e) => setAdminForm({...adminForm, monthlyRent: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#FF8A73] uppercase mb-1 font-mono">Net Profit</label>
                    <input 
                      type="text" 
                      value={adminForm.estNetMonthlyProfit}
                      onChange={(e) => setAdminForm({...adminForm, estNetMonthlyProfit: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#FF8A73] uppercase mb-1 font-mono">Status</label>
                    <select
                      value={adminForm.status}
                      onChange={(e) => setAdminForm({...adminForm, status: e.target.value as any})}
                      className="w-full px-3.5 py-2.5 bg-[#0F1014] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="UNDER CONTRACT">UNDER CONTRACT</option>
                      <option value="UNDER REVIEW">UNDER REVIEW</option>
                      <option value="OCCUPIED">OCCUPIED</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FF8A73] uppercase mb-1 font-mono">Cover Image URL</label>
                  <input 
                    type="text" 
                    required
                    value={adminForm.imageUrl}
                    onChange={(e) => setAdminForm({...adminForm, imageUrl: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FF8A73] uppercase mb-1 font-mono">Description</label>
                  <textarea 
                    rows={3}
                    value={adminForm.description}
                    onChange={(e) => setAdminForm({...adminForm, description: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end gap-3 font-mono">
                  <button 
                    type="button"
                    onClick={() => setShowPropertyEditorModal(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-xl text-xs font-black uppercase tracking-widest border border-white/20 shadow-lg shadow-[#E04F33]/25 cursor-pointer"
                  >
                    {editingDealId ? 'Save Changes' : 'Create Property'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0F1014] dark:text-slate-100 font-sans flex flex-col transition-colors duration-300 relative selection:bg-[#E04F33] selection:text-white">
      
      {/* 1. Pure Tailwind Ambient Mesh Gradient Background Spanning Viewport */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
        {/* Base Layer */}
        <div className="absolute inset-0 bg-slate-50 dark:bg-[#0F1014] transition-colors duration-500" />
        
        {/* Top-Left / Corner Burnt Orange Orb */}
        <div className="absolute -top-[12%] -left-[12%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full bg-[#E04F33]/10 dark:bg-[#E04F33]/15 blur-[120px] pointer-events-none" />
        
        {/* Opposing Bottom-Right Slate / Pearl Orb */}
        <div className="absolute -bottom-[12%] -right-[12%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-slate-200/60 dark:bg-slate-800/30 blur-[140px] pointer-events-none" />

        {/* Luminous Center Accent Orb */}
        <div className="absolute top-[35%] right-[10%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-amber-100/40 dark:bg-slate-700/20 blur-[130px] pointer-events-none" />
      </div>

      {/* Zero-JS First Paint Hybrid Splash Overlay (GPU keyframes) */}
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[9999] bg-slate-50 dark:bg-[#0F1014] flex flex-col items-center justify-center p-6 ${
            splashFading ? 'animate-splash-fade-out' : 'opacity-100'
          }`}
        >
          <div className="relative flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#E04F33] p-0.5 shadow-2xl shadow-[#E04F33]/30 border border-white/20 animate-kaizen-logo flex items-center justify-center">
              <span className="text-white font-extrabold text-2xl font-sans">改</span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-heading font-extrabold tracking-[0.25em] text-slate-900 dark:text-white uppercase">
                KAIZEN ESTATES
              </h2>
              <p className="text-[10px] font-mono text-[#E04F33] uppercase tracking-[0.3em] font-bold">
                Bespoke Luxury Stays
              </p>
            </div>

            {/* Zero-JS Pure CSS Keyframe Progress Bar */}
            <div className="w-48 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#E04F33] rounded-full animate-kaizen-bar" />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl transition-all duration-300 animate-slide-in ${
          notification.type === 'success' ? 'bg-white/90 dark:bg-[#121124]/90 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-emerald-950/20' :
          notification.type === 'error' ? 'bg-white/90 dark:bg-[#121124]/90 border-red-500/40 text-red-700 dark:text-red-300 shadow-red-950/20' :
          'bg-white/90 dark:bg-[#121124]/90 border-[#E04F33]/40 text-slate-900 dark:text-slate-200 shadow-slate-300/50 dark:shadow-black/50'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            notification.type === 'success' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
            notification.type === 'error' ? 'bg-red-400 shadow-[0_0_8px_#f87171]' : 'bg-[#E04F33] shadow-[0_0_8px_#E04F33]'
          }`} />
          <p className="text-xs font-bold tracking-wide uppercase font-mono">
            {notification.message}
          </p>
        </div>
      )}

      {/* Main Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0E121B]/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-apple-glass apple-specular transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Kaizen Logo & Emblem */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => { setActiveTab('properties'); setShowFavoritesOnly(false); window.location.hash = ''; }}
          >
            <div className="w-10 h-10 bg-[#E04F33] rounded-lg flex items-center justify-center shadow-lg shadow-[#E04F33]/25 border border-white/20 group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-extrabold text-base tracking-normal font-sans">改</span>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-[0.08em] text-slate-900 dark:text-white leading-none block font-heading">KAIZEN</span>
              <span className="text-[9px] text-[#E04F33] dark:text-[#FF8A73] font-mono font-bold tracking-widest block uppercase mt-0.5">REAL ESTATE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
            <button 
              onClick={() => { setActiveTab('properties'); setShowFavoritesOnly(false); setSearchQuery(''); window.location.hash = ''; }}
              className={`pb-1 border-b-2 transition-colors ${activeTab === 'properties' && !showFavoritesOnly ? 'border-[#E04F33] text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Properties
            </button>

            <button 
              onClick={() => { setActiveTab('how-it-works'); window.location.hash = ''; }}
              className={`pb-1 border-b-2 transition-colors ${activeTab === 'how-it-works' ? 'border-[#E04F33] text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              How It Works
            </button>

            {isAuthenticated && (
              <>
                <button 
                  onClick={() => { setActiveTab('dashboard'); window.location.hash = ''; }}
                  className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'dashboard' ? 'border-[#E04F33] text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#E04F33]" />
                  Dashboard
                </button>
                <button 
                  onClick={() => { setActiveTab('favorites'); window.location.hash = ''; }}
                  className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'favorites' ? 'border-[#E04F33] text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  Favorites
                </button>
                <button 
                  onClick={() => { setActiveTab('bookings'); window.location.hash = ''; }}
                  className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'bookings' ? 'border-[#E04F33] text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Lock className="w-3.5 h-3.5 text-[#E04F33]" />
                  My Bookings
                </button>
              </>
            )}

            <button 
              onClick={() => { setActiveTab('experiences'); window.location.hash = ''; }}
              className={`pb-1 border-b-2 transition-colors ${activeTab === 'experiences' ? 'border-[#E04F33] text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Experience
            </button>
            <button 
              onClick={() => { setActiveTab('about'); window.location.hash = ''; }}
              className={`pb-1 border-b-2 transition-colors ${activeTab === 'about' ? 'border-[#E04F33] text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              About
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Saved Favorites Trigger */}
            <button 
              onClick={() => {
                if (isAuthenticated) {
                  setActiveTab('favorites');
                } else {
                  setShowFavoritesOnly(!showFavoritesOnly);
                  setActiveTab('properties');
                }
              }}
              className={`p-2.5 rounded-full transition-all duration-300 relative border ${
                activeTab === 'favorites' || showFavoritesOnly 
                  ? 'text-rose-400 bg-rose-950/50 border-rose-500/40' 
                  : 'text-slate-300 hover:text-rose-400 hover:bg-white/5 border-white/10 hover:border-white/20'
              }`}
              title="Saved Favorites"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#E04F33] text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#0E121B]">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Auth Button or User Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 bg-[#1A2130]/90 hover:bg-[#222C3E] border border-white/15 rounded-full transition-colors cursor-pointer"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border border-[#E04F33] object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#E04F33] text-white flex items-center justify-center text-xs font-bold font-mono">
                      {user?.name?.[0] || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-white hidden sm:inline">{user?.name}</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#141A26]/95 border border-white/15 rounded-2xl p-2 shadow-apple-glass z-50 text-white font-sans space-y-1 backdrop-blur-2xl">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-xs font-bold text-white">{user?.name}</p>
                      <p className="text-[10px] text-slate-300 font-mono truncate">{user?.email}</p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => { setActiveTab('admin'); window.location.hash = 'admin'; setUserDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#FF8A73] hover:bg-[#E04F33]/20 rounded-xl flex items-center gap-2 transition-colors border border-[#E04F33]/30 my-1"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#E04F33]" />
                        <span>Admin Workspace</span>
                      </button>
                    )}

                    <button
                      onClick={() => { setActiveTab('dashboard'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-white/10 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#E04F33]" />
                      Buyer Dashboard
                    </button>
                    <button
                      onClick={() => { setActiveTab('favorites'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-white/10 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-rose-400" />
                      Saved Favorites
                    </button>
                    <button
                      onClick={() => { setActiveTab('bookings'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-white/10 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Lock className="w-4 h-4 text-[#E04F33]" />
                      My Bookings & Holds
                    </button>
                    <div className="border-t border-white/10 pt-1">
                      <button
                        onClick={() => { logout(); setUserDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-950/60 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-full text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-[#E04F33]/20 flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Amenities Ticker */}
      <div className="bg-[#12141C] py-3 border-b border-white/10 relative overflow-hidden select-none flex items-center">
        <div className="flex whitespace-nowrap text-[9px] md:text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
          <div className="inline-flex items-center shrink-0 gap-8 px-4 animate-marquee-ltr">
            <span>HEATED PRIVATE INFINITY POOLS</span>
            <span className="text-[#E04F33]">✦</span>
            <span>24/7 PERSONAL CONCIERGE SERVICES</span>
            <span className="text-[#E04F33]">✦</span>
            <span>DIRECT PLATFORM BOOKINGS (AIRBNB, VRBO, BOOKING.COM)</span>
            <span className="text-[#E04F33]">✦</span>
            <span>SCOTTSDALE & PENSACOLA LUXURY ESTATES</span>
            <span className="text-[#E04F33]">✦</span>
          </div>
          <div className="inline-flex items-center shrink-0 gap-8 px-4 animate-marquee-ltr" aria-hidden="true">
            <span>HEATED PRIVATE INFINITY POOLS</span>
            <span className="text-[#E04F33]">✦</span>
            <span>24/7 PERSONAL CONCIERGE SERVICES</span>
            <span className="text-[#E04F33]">✦</span>
            <span>DIRECT PLATFORM BOOKINGS (AIRBNB, VRBO, BOOKING.COM)</span>
            <span className="text-[#E04F33]">✦</span>
            <span>SCOTTSDALE & PENSACOLA LUXURY ESTATES</span>
            <span className="text-[#E04F33]">✦</span>
          </div>
          <div className="inline-flex items-center shrink-0 gap-8 px-4 animate-marquee-ltr" aria-hidden="true">
            <span>HEATED PRIVATE INFINITY POOLS</span>
            <span className="text-[#E04F33]">✦</span>
            <span>24/7 PERSONAL CONCIERGE SERVICES</span>
            <span className="text-[#E04F33]">✦</span>
            <span>DIRECT PLATFORM BOOKINGS (AIRBNB, VRBO, BOOKING.COM)</span>
            <span className="text-[#E04F33]">✦</span>
            <span>SCOTTSDALE & PENSACOLA LUXURY ESTATES</span>
            <span className="text-[#E04F33]">✦</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">

        {/* VIEW: USER DASHBOARD */}
        {activeTab === 'dashboard' ? (
          <DashboardView
            onNavigateToFavorites={() => setActiveTab('favorites')}
            onNavigateToBookings={() => setActiveTab('bookings')}
          />
        ) : activeTab === 'favorites' ? (
          <FavoritesView
            onSelectDeal={(deal) => handleOpenProspectus(deal)}
          />
        ) : activeTab === 'bookings' ? (
          <BookingsView />
        ) : (

          /* CUSTOMER PUBLIC VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-w-full overflow-hidden">
            
            {/* Left Brand Sidebar (Hidden on mobile, visible on lg screens side-by-side) */}
            <m.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.15 }}
              className="hidden lg:flex lg:col-span-4 bg-white/5 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl shadow-black/40 flex-col justify-between min-h-0 lg:min-h-[520px] relative overflow-hidden apple-specular"
            >
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xl rounded-full mb-6 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-[#E04F33] animate-pulse" />
                  <span className="text-[9px] font-bold text-[#FF8A73] tracking-[0.2em] uppercase font-mono">Kaizen Luxury Collection</span>
                </div>
                
                {/* Headline with Staggered Word / Character Reveal */}
                <m.h1 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.2,
                      }
                    }
                  }}
                  className="text-2xl sm:text-4xl font-display font-extrabold leading-tight tracking-tight mb-4 text-white flex flex-wrap gap-x-2"
                >
                  <m.span variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } } }} className="inline-block">
                    Luxury
                  </m.span>
                  <m.span variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } } }} className="inline-block">
                    stays,
                  </m.span>
                  <m.span variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } } }} className="inline-block text-[#FF8A73] italic font-serif">
                    unforgettable
                  </m.span>
                  <m.span variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } } }} className="inline-block">
                    memories.
                  </m.span>
                </m.h1>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 font-sans">
                  Indulge in our collection of meticulously curated luxury villas. Heated pools, private chefs, 24/7 concierge, and bespoke hospitality crafted to perfection.
                </p>
                
                {/* Navigation Doors in Sleek Frosted Glass */}
                <div className="space-y-3.5">
                  
                  <div 
                    onClick={() => { setActiveTab('properties'); setShowFavoritesOnly(false); }}
                    className={`p-4 rounded-xl border cursor-pointer group transition-all duration-300 backdrop-blur-2xl ${
                      activeTab === 'properties' && !showFavoritesOnly
                        ? 'bg-white/15 border-white/20 shadow-2xl shadow-black/40 ring-1 ring-white/20' 
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold text-[#FF8A73] uppercase mb-1 tracking-[0.2em] font-mono">Collection Catalog</p>
                        <p className="text-sm font-heading font-bold text-white">Browse Turnkey Villas</p>
                        <p className="text-xs text-slate-300 mt-1 font-sans">Explore verified luxury properties ready to operate & stay.</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#E04F33] group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('how-it-works')}
                    className={`p-4 rounded-xl border cursor-pointer group transition-all duration-300 backdrop-blur-2xl ${
                      activeTab === 'how-it-works' 
                        ? 'bg-white/15 border-white/20 shadow-2xl shadow-black/40 ring-1 ring-white/20' 
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold text-[#FF8A73] uppercase mb-1 tracking-[0.2em] font-mono">Turnkey Process</p>
                        <p className="text-sm font-heading font-bold text-white">How It Works</p>
                        <p className="text-xs text-slate-300 mt-1 font-sans">4-step guide to locking, verifying, and operating properties.</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#E04F33] group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('experiences')}
                    className={`p-4 rounded-xl border cursor-pointer group transition-all duration-300 backdrop-blur-2xl ${
                      activeTab === 'experiences' 
                        ? 'bg-white/15 border-white/20 shadow-2xl shadow-black/40 ring-1 ring-white/20' 
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold text-[#FF8A73] uppercase mb-1 tracking-[0.2em] font-mono">Our Experience</p>
                        <p className="text-sm font-heading font-bold text-white">Guest Experience</p>
                        <p className="text-xs text-slate-300 mt-1 font-sans">Private infinity pools, gourmet chefs, and custom catering.</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#E04F33] group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                </div>
              </div>

              {/* Trust Badge */}
              <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono text-[10px] text-[#FF8A73] uppercase tracking-widest">Airbtics Verified</span>
                <span className="font-bold text-white font-heading tracking-wider">KAIZEN REAL ESTATE</span>
              </div>
            </m.section>

            {/* Right Main Content Panel */}
            <section className="lg:col-span-8 space-y-6 min-w-0 max-w-full">

              {/* Mobile Filter Pill Tabs in Frosted Glass */}
              <div className="flex md:hidden overflow-x-auto pb-2 gap-2 max-w-full no-scrollbar">
                {[
                  { id: 'properties', label: 'Properties' },
                  { id: 'how-it-works', label: 'How It Works' },
                  { id: 'blogs', label: 'Blogs' },
                  { id: 'stories', label: 'Stories' },
                  { id: 'experiences', label: 'Experience' },
                  { id: 'about', label: 'About' },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setShowFavoritesOnly(false); setSearchQuery(''); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap transition-all backdrop-blur-xl ${
                      activeTab === item.id && !showFavoritesOnly 
                        ? 'bg-white/20 text-white border border-white/25 shadow-md' 
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* VIEW A: ACTIVE PROPERTIES CATALOG */}
              {activeTab === 'properties' && (
                <div className="space-y-6 animate-fade-in w-full max-w-full overflow-hidden">
                  
                  {/* Airbnb-style Interactive Search Bar */}
                  <m.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 110,
                      damping: 18,
                      delay: 0.25,
                    }}
                  >
                    <AirbnbSearchBar 
                      where={searchWhere}
                      setWhere={setSearchWhere}
                      whenDisplay={searchWhenDisplay}
                      setWhenDisplay={setSearchWhenDisplay}
                      startDate={searchStartDate}
                      setStartDate={setSearchStartDate}
                      endDate={searchEndDate}
                      setEndDate={setSearchEndDate}
                      guestCount={searchGuestCount}
                      setGuestCount={setSearchGuestCount}
                      onSearch={handleExecuteSearch}
                    />
                  </m.div>

                  {/* Status Filters Bar in Sleek Frosted Glass */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 w-full max-w-full overflow-hidden">
                    <span className="text-xs font-mono text-slate-300 shrink-0">
                      Showing {filteredDeals.length} luxury {filteredDeals.length === 1 ? 'property' : 'properties'}
                    </span>
                    <div className="flex bg-white/5 backdrop-blur-2xl p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full w-full sm:w-auto no-scrollbar">
                      {(['ALL', 'AVAILABLE', 'UNDER CONTRACT', 'UNDER REVIEW'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setStatusFilter(filter)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                            statusFilter === filter 
                              ? 'bg-white/20 text-white border border-white/25 shadow-md' 
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {filter === 'ALL' ? 'All Listings' : filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deals Grid */}
                  {isSearching ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                      {[1, 2].map((n) => (
                        <div key={n} className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 p-5 space-y-4">
                          <div className="h-48 bg-white/10 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-[#E04F33]/60 animate-spin" />
                          </div>
                          <div className="h-5 bg-white/10 rounded w-2/3" />
                          <div className="h-4 bg-white/5 rounded w-1/3" />
                          <div className="grid grid-cols-3 gap-2 pt-2">
                            <div className="h-12 bg-white/5 rounded-lg" />
                            <div className="h-12 bg-white/5 rounded-lg" />
                            <div className="h-12 bg-white/5 rounded-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredDeals.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 p-12 text-center shadow-2xl">
                      <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="font-bold text-white">No matching luxury villas found</p>
                      <p className="text-xs text-slate-300 mt-1">Try resetting the status filter or clearing your search term.</p>
                      <button 
                        onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setShowFavoritesOnly(false); }}
                        className="mt-4 px-4 py-2 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-[#E04F33]/20"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredDeals.map((deal) => (
                        <PropertyCard
                          key={deal.id}
                          deal={deal}
                          isFavorite={favorites.includes(deal.id)}
                          onToggleFavorite={(id) => toggleFavorite(id)}
                          onOpenProspectus={handleOpenProspectus}
                        />
                      ))}
                    </div>
                  )}

                  {/* Reassurance Footer */}
                  <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3 overflow-hidden shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-[#0F1014] bg-white/10 backdrop-blur-md text-white text-xs font-medium tracking-wide shadow-sm">SM</div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-[#0F1014] bg-white/10 backdrop-blur-md text-white text-xs font-medium tracking-wide shadow-sm">JD</div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-[#0F1014] bg-white/10 backdrop-blur-md text-white text-xs font-medium tracking-wide shadow-sm">LH</div>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        Guiding <span className="font-bold text-white">100% verified guest stays</span> across Arizona and Florida.
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-[#FF8A73] font-mono tracking-widest uppercase">
                      KAIZEN REAL ESTATE • LUXURY REDEFINED
                    </div>
                  </div>

                </div>
              )}

              {/* VIEW: HOW IT WORKS */}
              {activeTab === 'how-it-works' && (
                <HowItWorks onBrowseProperties={() => setActiveTab('properties')} />
              )}

              {/* VIEW B: BLOGS */}
              {activeTab === 'blogs' && (
                <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
                  <div className="glass-card bg-white/80 dark:bg-white/5 rounded-3xl border border-slate-200/80 dark:border-white/10 p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl apple-specular">
                    <span className="text-[10px] font-extrabold text-[#E04F33] dark:text-[#FF8A73] bg-[#E04F33]/10 dark:bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#E04F33]/20 dark:border-white/15 font-mono">
                      Kaizen Editorial
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-4 font-serif">
                      The Art of Luxury Vacation Rentals & Design
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                      Exclusive columns on luxury real estate curation, interior design secrets, and guest experience benchmarks.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col justify-between transition-all shadow-xl shadow-slate-200/50 dark:shadow-2xl apple-specular">
                      <div>
                        <div className="h-40 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80" 
                            alt="Luxury Scottsdale Villa design" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-5 space-y-2">
                          <p className="text-[10px] text-[#E04F33] dark:text-[#FF8A73] font-bold uppercase tracking-wider font-mono">July 18, 2026 • 5 min read</p>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                            Curating Kaizen Scottsdale: Inside Our Design Playbook
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                            How we integrated custom local cactus gardens, heated infinity pools, and warm neutral linens to boost Scottsdale guest satisfaction.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col justify-between transition-all shadow-xl shadow-slate-200/50 dark:shadow-2xl apple-specular">
                      <div>
                        <div className="h-40 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80" 
                            alt="Private Chef Table Experience" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-5 space-y-2">
                          <p className="text-[10px] text-[#E04F33] dark:text-[#FF8A73] font-bold uppercase tracking-wider font-mono">July 14, 2026 • 7 min read</p>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                            The Jain-Friendly Gourmet Advantage in Modern Luxury
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                            A 5-star trip is more than just handing over a check-in code. We explore how catering to specialized dietary travelers secures top reviews.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col justify-between transition-all shadow-xl shadow-slate-200/50 dark:shadow-2xl apple-specular">
                      <div>
                        <div className="h-40 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1450622238302-a223f43d35fc?auto=format&fit=crop&w=600&q=80" 
                            alt="Florida Coastal Villa" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-5 space-y-2">
                          <p className="text-[10px] text-[#E04F33] dark:text-[#FF8A73] font-bold uppercase tracking-wider font-mono">June 29, 2026 • 6 min read</p>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                            Pensacola Coastal Living: High Amenities & Unmatched Comfort
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                            Coastal luxury requires absolute precision in design and private beach club access.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW C: STORIES */}
              {activeTab === 'stories' && (
                <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
                  <div className="glass-card bg-white/80 dark:bg-white/5 rounded-3xl border border-slate-200/80 dark:border-white/10 p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl apple-specular">
                    <span className="text-[10px] font-extrabold text-[#E04F33] dark:text-[#FF8A73] bg-[#E04F33]/10 dark:bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#E04F33]/20 dark:border-white/15 font-mono">
                      Guest Chronicles
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-4 font-serif">
                      The Stories Behind Kaizen
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                      Read real testimonials from travelers who have experienced the Kaizen difference.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card bg-white/80 dark:bg-white/5 p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-2xl apple-specular">
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                        "Finding rental homes that accommodate specialized dietary needs and custom concierge dining is challenging. Kaizen curated a flawless family experience for us in Scottsdale. The absolute gold standard."
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                        <div className="w-10 h-10 rounded-full bg-[#E04F33]/10 dark:bg-white/10 text-[#E04F33] dark:text-[#FF8A73] font-bold flex items-center justify-center font-mono text-xs border border-[#E04F33]/20 dark:border-white/15">
                          AK
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white text-xs">Anand Kapoor</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Scottsdale Villa Guest</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card bg-white/80 dark:bg-white/5 p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-2xl apple-specular">
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                        "Kaizen handles designer styling, 24/7 guest check-ins, and bespoke concierge requests effortlessly. Highly recommend their collection."
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                        <div className="w-10 h-10 rounded-full bg-[#E04F33]/10 dark:bg-white/10 text-[#E04F33] dark:text-[#FF8A73] font-bold flex items-center justify-center font-mono text-xs border border-[#E04F33]/20 dark:border-white/15">
                          MR
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white text-xs">Marcus Roberts</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Pensacola Retreat Guest</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW D: EXPERIENCE */}
              {activeTab === 'experiences' && (
                <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
                  <div className="glass-card bg-white/80 dark:bg-white/5 rounded-3xl border border-slate-200/80 dark:border-white/10 p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl apple-specular">
                    <span className="text-[10px] font-extrabold text-[#E04F33] dark:text-[#FF8A73] bg-[#E04F33]/10 dark:bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#E04F33]/20 dark:border-white/15 font-mono">
                      The Kaizen Signature
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-4 font-serif">
                      Elevating Travel into Artistry
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                      We believe hospitality lies in custom, invisible luxuries. At every Kaizen villa, your trip is accompanied by curated personal services, premium amenities, and dedicated concierge lines.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="glass-card bg-white/80 dark:bg-white/5 p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3 shadow-xl shadow-slate-200/50 dark:shadow-2xl apple-specular">
                      <Sparkles className="w-6 h-6 text-[#E04F33]" />
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-serif">Heated Infinity Pools</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Year-round temperature control, resort lighting, and private cabana loungers.
                      </p>
                    </div>

                    <div className="glass-card bg-white/80 dark:bg-white/5 p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3 shadow-xl shadow-slate-200/50 dark:shadow-2xl apple-specular">
                      <Award className="w-6 h-6 text-[#E04F33]" />
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-serif">24/7 Concierge Service</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Instant WhatsApp communication for dining reservations, airport transfers, and private chefs.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW E: ABOUT */}
              {activeTab === 'about' && (
                <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
                  <div className="glass-card bg-white/80 dark:bg-white/5 rounded-3xl border border-slate-200/80 dark:border-white/10 p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl apple-specular">
                    <span className="text-[10px] font-extrabold text-[#E04F33] dark:text-[#FF8A73] bg-[#E04F33]/10 dark:bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#E04F33]/20 dark:border-white/15 font-mono">
                      The Kaizen Philosophy
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-4 font-serif">
                      Continuous Improvement. Exceptional Hospitality.
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                      At Kaizen, we merge high-end, culturally-inclusive hospitality with continuous operational improvement.
                    </p>
                  </div>
                </div>
              )}

            </section>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="backdrop-blur-xl bg-white/40 dark:bg-black/20 border-t border-slate-200/50 dark:border-white/10 mt-16 py-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E04F33] rounded-lg flex items-center justify-center shadow-lg shadow-[#E04F33]/25 border border-white/20 shrink-0">
              <span className="text-white font-extrabold text-base tracking-normal font-sans">改</span>
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white font-semibold tracking-wide font-serif">KAIZEN LUXURY ESTATES</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs tracking-widest font-mono uppercase leading-none mt-0.5">PREMIUM VACATION RENTALS</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono font-bold">
            <button onClick={() => { setActiveTab('properties'); window.location.hash = ''; }} className="text-slate-600 dark:text-slate-300 transition-colors duration-200 hover:text-orange-600 dark:hover:text-orange-400 text-sm">Properties</button>
            <button onClick={() => { setActiveTab('experiences'); window.location.hash = ''; }} className="text-slate-600 dark:text-slate-300 transition-colors duration-200 hover:text-orange-600 dark:hover:text-orange-400 text-sm">Experience</button>
            <button onClick={() => { setActiveTab('about'); window.location.hash = ''; }} className="text-slate-600 dark:text-slate-300 transition-colors duration-200 hover:text-orange-600 dark:hover:text-orange-400 text-sm">About Us</button>
          </div>

          <p className="text-slate-400 dark:text-slate-500 text-xs font-mono text-center md:text-right">
            © 2026 Kaizen Luxury Real Estate LLC. All rights reserved.
          </p>
        </div>
      </footer>


      {/* ==========================================
          MODAL A: PROPERTY DETAILS & PLATFORMS
         ========================================== */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F1014]/90 backdrop-blur-3xl rounded-3xl max-w-2xl w-full border border-white/15 shadow-2xl shadow-black/80 overflow-hidden flex flex-col animate-scale-in text-slate-100 apple-specular">
            
            {/* Header */}
            <div className="bg-white/5 p-6 text-white flex justify-between items-start border-b border-white/10 backdrop-blur-xl">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#FF8A73] bg-white/10 px-3 py-1 rounded-full font-bold border border-white/15">
                  Luxury Villa Details
                </span>
                <h3 className="text-xl font-extrabold tracking-tight mt-2 font-heading">{selectedDeal.title}</h3>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#E04F33]" />
                  {selectedDeal.location} • {selectedDeal.bedsBaths} • {selectedDeal.squareFeet} SQFT
                </p>
              </div>
              <button 
                onClick={() => setSelectedDeal(null)}
                className="p-2 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-full transition-colors border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto space-y-6 max-h-[600px]">
              
              {/* Photo Gallery Viewer */}
              <div>
                <div className="h-64 rounded-2xl overflow-hidden relative border border-white/10 bg-black/40">
                  <img 
                    src={selectedDeal.images[activeImageIndex] || selectedDeal.imageUrl} 
                    alt={selectedDeal.title}
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {selectedDeal.images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : selectedDeal.images.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all border border-white/20"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActiveImageIndex((prev) => (prev < selectedDeal.images.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all border border-white/20"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-200 border border-white/10">
                    {activeImageIndex + 1} / {selectedDeal.images.length || 1} Photos
                  </div>
                </div>

                {/* Thumbnails strip */}
                {selectedDeal.images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {selectedDeal.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                          activeImageIndex === idx ? 'border-[#E04F33] scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Book / View on Platforms - CRUCIAL CUSTOMER SECTION */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3 backdrop-blur-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-white font-heading flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-[#E04F33]" />
                      Book / View on Platforms
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">Select your preferred platform below to open the official active listing directly.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-white/10 text-[#FF8A73] text-[10px] font-mono font-bold rounded-full border border-white/15">
                    LIVE LISTINGS
                  </span>
                </div>

                <div className="pt-2">
                  {selectedDeal.listings.filter(l => l.isActive && l.url).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedDeal.listings.filter(l => l.isActive && l.url).map((listing, idx) => {
                        const cfg = PLATFORM_CONFIG[listing.platform] || PLATFORM_CONFIG['Custom'];
                        return (
                          <a
                            key={idx}
                            href={listing.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-3.5 rounded-xl border text-xs font-extrabold flex items-center justify-between transition-all duration-200 shadow-md ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            <span className="text-sm">{cfg.iconLabel}</span>
                            <div className="flex items-center gap-1 text-[11px] opacity-90 font-mono">
                              <span>Open Listing</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                      <span className="px-3 py-1 rounded-full bg-black/40 text-slate-300 text-xs font-mono font-bold inline-block border border-white/10">
                        Currently Unavailable / Fully Booked
                      </span>
                      <p className="text-xs text-slate-400 mt-2">This property is currently not accepting new platform reservations.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description text */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF8A73] mb-1.5 font-mono">Property Overview</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedDeal.description || 'This vetted corporate sublease property exhibits highly robust short-term rental performance indicators. Located in an area of exceptional tourism density with clear local HOA allowance.'}
                </p>
              </div>

              {/* Full Specs Table Grid */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF8A73] mb-3 font-mono">Property Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Nightly Rate</span>
                    <span className="font-extrabold text-white text-sm font-mono">{selectedDeal.adr}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Beds & Baths</span>
                    <span className="font-bold text-slate-200">{selectedDeal.bedsBaths}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Furnished Setup</span>
                    <span className="font-bold text-slate-200">{selectedDeal.furnished}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Est Occupancy</span>
                    <span className="font-bold text-slate-200">{selectedDeal.estOccupancy}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Square Footage</span>
                    <span className="font-bold text-slate-200">{selectedDeal.squareFeet} SQFT</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Earliest Availability</span>
                    <span className="font-extrabold text-[#FF8A73] font-mono">{selectedDeal.availability}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom bar */}
            <div className="bg-white/5 p-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 backdrop-blur-xl">
              <span className="text-[10px] text-slate-400 font-mono">Kaizen Luxury Estates • Verified Property</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    requireAuth(() => setShowLockPurchaseModal(true));
                  }}
                  className="px-5 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#E04F33]/25 border border-white/20 flex items-center gap-2 cursor-pointer font-sans"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock & Secure Property (15-Min Hold)</span>
                </button>
                <button 
                  onClick={() => setSelectedDeal(null)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 rounded-xl text-xs font-bold transition-all font-mono cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* ==========================================
          MODAL B: ADMIN PROPERTY EDITOR MODAL
         ========================================== */}
      {showPropertyEditorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F1014]/90 backdrop-blur-3xl rounded-3xl max-w-3xl w-full border border-white/15 shadow-2xl shadow-black/80 overflow-hidden flex flex-col animate-scale-in text-white apple-specular">
            
            {/* Header */}
            <div className="bg-white/5 p-6 text-white flex justify-between items-center border-b border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-white/10 rounded-xl border border-white/15 text-[#FF8A73]">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold font-heading">
                    {editingDealId ? `Edit Property: ${adminForm.title}` : 'Create New Luxury Property'}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">Update specs, images, and external platform listing links.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPropertyEditorModal(false)}
                className="p-2 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-full transition-colors border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSaveProperty} className="p-6 overflow-y-auto space-y-6 max-h-[70vh]">
              
              {/* Section 1: Core Specs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#FF8A73] uppercase tracking-widest font-mono border-b border-white/10 pb-1">
                  1. Core Property Specs
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Property Title / Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Coastal Modern Retreat"
                      value={adminForm.title}
                      onChange={(e) => setAdminForm({...adminForm, title: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Location / Address *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Pensacola, FL"
                      value={adminForm.location}
                      onChange={(e) => setAdminForm({...adminForm, location: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Beds / Baths</label>
                    <input 
                      type="text" 
                      placeholder="3 bed, 2 bath"
                      value={adminForm.bedsBaths}
                      onChange={(e) => setAdminForm({...adminForm, bedsBaths: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#E04F33] focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Square Feet</label>
                    <input 
                      type="text" 
                      placeholder="1,300"
                      value={adminForm.squareFeet}
                      onChange={(e) => setAdminForm({...adminForm, squareFeet: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#E04F33] focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Furnished Status</label>
                    <select
                      value={adminForm.furnished}
                      onChange={(e) => setAdminForm({...adminForm, furnished: e.target.value as 'Yes' | 'No'})}
                      className="w-full px-3 py-2 bg-[#1A1C22] border border-white/10 rounded-xl text-white text-xs focus:border-[#E04F33] transition-all"
                    >
                      <option value="Yes">Yes (Furnished)</option>
                      <option value="No">No (Unfurnished)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Status</label>
                    <select
                      value={adminForm.status}
                      onChange={(e) => setAdminForm({...adminForm, status: e.target.value as any})}
                      className="w-full px-3 py-2 bg-[#1A1C22] border border-white/10 rounded-xl text-white text-xs focus:border-[#E04F33] transition-all"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="OCCUPIED">OCCUPIED</option>
                      <option value="UNDER CONTRACT">UNDER CONTRACT</option>
                      <option value="UNDER REVIEW">UNDER REVIEW</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Financials & Analytics */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#FF8A73] uppercase tracking-widest font-mono border-b border-white/10 pb-1">
                  2. Financials & Analytics (Airbtics)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Monthly Rent *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="$2,200"
                      value={adminForm.monthlyRent}
                      onChange={(e) => setAdminForm({...adminForm, monthlyRent: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono font-bold focus:border-[#E04F33] focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Net Monthly Profit</label>
                    <input 
                      type="text" 
                      placeholder="~$1,700"
                      value={adminForm.estNetMonthlyProfit}
                      onChange={(e) => setAdminForm({...adminForm, estNetMonthlyProfit: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-emerald-400 text-xs font-mono font-bold focus:border-[#E04F33] focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Nightly Rate (ADR)</label>
                    <input 
                      type="text" 
                      placeholder="$215"
                      value={adminForm.adr}
                      onChange={(e) => setAdminForm({...adminForm, adr: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-[#E04F33] focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Est Occupancy</label>
                    <input 
                      type="text" 
                      placeholder="68%"
                      value={adminForm.estOccupancy}
                      onChange={(e) => setAdminForm({...adminForm, estOccupancy: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-[#E04F33] focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Proj. Annual Revenue</label>
                    <input 
                      type="text" 
                      placeholder="$55,683"
                      value={adminForm.projectedAnnualRevenue}
                      onChange={(e) => setAdminForm({...adminForm, projectedAnnualRevenue: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-[#E04F33] focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Total Cash To Start</label>
                    <input 
                      type="text" 
                      placeholder="$9,400"
                      value={adminForm.totalCashToStart}
                      onChange={(e) => setAdminForm({...adminForm, totalCashToStart: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-amber-300 text-xs font-mono focus:border-[#E04F33] focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Lease Term</label>
                    <input 
                      type="text" 
                      placeholder="12 months"
                      value={adminForm.leaseTerm}
                      onChange={(e) => setAdminForm({...adminForm, leaseTerm: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#E04F33] focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Image URL Manager */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#FF8A73] uppercase tracking-widest font-mono border-b border-white/10 pb-1 flex items-center justify-between">
                  <span>3. Image Gallery Manager</span>
                  <span className="text-[10px] text-slate-400 font-normal">({adminForm.images.length} Photos)</span>
                </h4>

                {/* Current Image List */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {adminForm.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 h-24 bg-black/40">
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button 
                          type="button"
                          onClick={() => {
                            const filtered = adminForm.images.filter((_, i) => i !== idx);
                            setAdminForm({ ...adminForm, images: filtered });
                          }}
                          className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs transition-colors"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#E04F33] text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/20">
                          PRIMARY
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add new image input */}
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="Paste image URL (https://...)"
                    value={newImageUrlInput}
                    onChange={(e) => setNewImageUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:border-[#E04F33] focus:bg-white/10 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (newImageUrlInput.trim()) {
                        setAdminForm({
                          ...adminForm,
                          images: [...adminForm.images, newImageUrlInput.trim()]
                        });
                        setNewImageUrlInput('');
                      }
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
                  >
                    + Add Photo
                  </button>
                </div>
              </div>

              {/* Section 4: Platform Listing Link Manager (CRUCIAL) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-1">
                  <h4 className="text-xs font-bold text-[#FF8A73] uppercase tracking-widest font-mono">
                    4. Platform Listing Link Manager
                  </h4>
                  <button 
                    type="button"
                    onClick={() => {
                      setAdminForm({
                        ...adminForm,
                        listings: [
                          ...adminForm.listings,
                          { platform: 'Airbnb', url: 'https://www.airbnb.com', isActive: true }
                        ]
                      });
                    }}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold font-mono border border-white/15 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-[#E04F33]" /> Add Platform
                  </button>
                </div>

                <div className="space-y-3">
                  {adminForm.listings.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      
                      {/* Platform Choice */}
                      <select
                        value={item.platform}
                        onChange={(e) => {
                          const updated = [...adminForm.listings];
                          updated[idx].platform = e.target.value;
                          setAdminForm({ ...adminForm, listings: updated });
                        }}
                        className="px-3 py-2 bg-[#1A1C22] border border-white/10 rounded-lg text-white text-xs font-bold font-mono focus:border-[#E04F33]"
                      >
                        {AVAILABLE_PLATFORMS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>

                      {/* URL Input */}
                      <input 
                        type="url" 
                        required
                        placeholder="Listing URL (https://...)"
                        value={item.url}
                        onChange={(e) => {
                          const updated = [...adminForm.listings];
                          updated[idx].url = e.target.value;
                          setAdminForm({ ...adminForm, listings: updated });
                        }}
                        className="flex-1 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-mono placeholder-slate-500 focus:border-[#E04F33] transition-all"
                      />

                      {/* Active Toggle Switch */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...adminForm.listings];
                            updated[idx].isActive = !updated[idx].isActive;
                            setAdminForm({ ...adminForm, listings: updated });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                            item.isActive 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                              : 'bg-white/5 text-slate-400 border-white/10'
                          }`}
                        >
                          {item.isActive ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                          {item.isActive ? 'Active' : 'Inactive'}
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            const updated = adminForm.listings.filter((_, i) => i !== idx);
                            setAdminForm({ ...adminForm, listings: updated });
                          }}
                          className="p-1.5 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-lg border border-white/10 transition-colors"
                          title="Remove platform link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}

                  {adminForm.listings.length === 0 && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-slate-400 italic">
                      No platform listing links added yet. Click "+ Add Platform" to add Airbnb, Vrbo, etc.
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1 font-mono">Property Description</label>
                <textarea 
                  rows={3}
                  placeholder="Detail the property layout, location perks, and key guest amenities..."
                  value={adminForm.description}
                  onChange={(e) => setAdminForm({...adminForm, description: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] focus:bg-white/10 transition-all"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 font-mono">
                <button 
                  type="button"
                  onClick={() => setShowPropertyEditorModal(false)}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#E04F33]/25 border border-white/20 cursor-pointer"
                >
                  {editingDealId ? 'Save Changes' : 'Create Property'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingAction(null);
          setPendingTab(null);
        }}
        onSuccess={(loggedInUser) => {
          setShowAuthModal(false);
          const currentUser = loggedInUser || user;
          const userIsAdmin = Boolean(
            currentUser?.is_staff ||
            currentUser?.is_superuser ||
            currentUser?.role === 'ADMIN' ||
            currentUser?.role === 'admin'
          );

          if (userIsAdmin) {
            setActiveTab('admin');
            window.location.hash = 'admin';
            triggerNotification('Authenticated as Admin! Redirected to Admin Workspace.', 'success');
            setPendingAction(null);
            setPendingTab(null);
          } else {
            if (pendingAction) {
              pendingAction();
              setPendingAction(null);
            } else if (pendingTab) {
              setActiveTab(pendingTab as any);
              setPendingTab(null);
            } else {
              setActiveTab('dashboard');
            }
            window.location.hash = '';
            triggerNotification(`Welcome back, ${currentUser?.name || 'Customer'}!`, 'success');
          }
        }}
      />

      {/* Global Lock & Purchase Modal */}
      <LockPurchaseModal
        isOpen={showLockPurchaseModal}
        deal={selectedDeal}
        onClose={() => setShowLockPurchaseModal(false)}
        onSuccess={() => {
          setShowLockPurchaseModal(false);
          setSelectedDeal(null);
          setActiveTab('bookings');
        }}
      />

    </div>
  );
}
