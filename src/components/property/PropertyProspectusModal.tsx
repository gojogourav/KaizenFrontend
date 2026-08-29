import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Globe,
  ExternalLink,
  Lock
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface PropertyProspectusModalProps {
  deal: any;
  onClose: () => void;
  onInitiateLock: () => void;
}

export const PropertyProspectusModal: React.FC<PropertyProspectusModalProps> = ({
  deal,
  onClose,
  onInitiateLock
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (deal) {
      document.body.style.overflow = 'hidden';
      setActiveImageIndex(0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [deal]);

  if (!deal) return null;

  // Map incoming Django backend fields or legacy Frontend fields
  const images = deal?.images?.length
    ? deal.images
    : deal?.media?.length
      ? deal.media.map((m: any) => m.cdn_url)
      : [deal?.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'];

  const locationText = deal?.city ? `${deal.city}, ${deal.state}` : deal?.location || '';
  const bedsText = deal?.bedsBaths || (deal?.bedrooms ? `${deal.bedrooms} bed, ${Number(deal.bathrooms || 0)} bath` : '');
  const sqftText = deal?.squareFeet || deal?.square_feet ? `${deal?.squareFeet || deal?.square_feet}` : '';
  const priceValue = deal?.price ?? deal?.rent_monthly ?? deal?.adr ?? deal?.monthlyRent ?? 0;
  const occupancy = deal?.occupancyEst ?? deal?.estOccupancy ?? 'N/A';
  const availability = deal?.availability ?? 'ASAP';
  const furnished = deal?.furnished ?? 'Yes';

  const activeListings = Array.isArray(deal?.listings)
    ? deal.listings.filter((l: any) => (l.isActive || l.is_active) && l.url)
    : [];

  return (
    <AnimatePresence>
      {deal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-pointer"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`rounded-3xl max-w-2xl w-full border shadow-2xl overflow-hidden flex flex-col relative z-10 transition-all ${
              isDark
                ? "bg-slate-900/95 border-slate-800 text-slate-100 shadow-slate-950/80 apple-specular"
                : "bg-white border-slate-200 text-slate-900 shadow-slate-300/50"
            }`}
          >

            {/* Header */}
            <div
              className={`p-6 flex justify-between items-start border-b transition-colors ${
                isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50/80"
              }`}
            >
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full font-bold border border-blue-500/20">
                  Luxury Villa Details
                </span>
                <h3
                  className={`text-xl font-extrabold tracking-tight mt-2 font-heading ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {deal.title}
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 font-mono font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  {locationText} {bedsText && `• ${bedsText}`} {sqftText && `• ${sqftText} SQFT`}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors border cursor-pointer ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto space-y-6 max-h-[600px] no-scrollbar">

              {/* Photo Gallery Viewer */}
              <div>
                <div className="h-64 rounded-2xl overflow-hidden relative border border-slate-800 bg-slate-950">
                  <motion.img
                    key={activeImageIndex}
                    src={images[activeImageIndex]}
                    alt={deal.title}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIndex(activeImageIndex > 0 ? activeImageIndex - 1 : images.length - 1)
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-950/70 hover:bg-slate-950 text-white rounded-full transition-all border border-white/20 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIndex(activeImageIndex < images.length - 1 ? activeImageIndex + 1 : 0)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-950/70 hover:bg-slate-950 text-white rounded-full transition-all border border-white/20 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-3 right-3 z-10 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-mono text-slate-200 border border-white/10">
                    {activeImageIndex + 1} / {images.length || 1} Photos
                  </div>
                </div>

                {/* Thumbnails strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          activeImageIndex === idx ? 'border-blue-600 scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Book / View on Platforms */}
              <div
                className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                  isDark
                    ? "bg-slate-800/50 border-slate-700/60"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4
                      className={`text-sm font-extrabold font-heading flex items-center gap-1.5 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Book / View on Platforms
                    </h4>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Select your preferred platform below to open the official active listing directly.
                    </p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold rounded-full border border-blue-500/20">
                    LIVE LISTINGS
                  </span>
                </div>

                <div className="pt-2">
                  {activeListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeListings.map((listing: any, idx: number) => (
                        <a
                          key={idx}
                          href={listing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all hover:scale-[1.02] ${
                            isDark
                              ? "bg-slate-800 border-slate-700 text-white hover:border-blue-500/40"
                              : "bg-white border-slate-200 text-slate-900 hover:border-blue-300 shadow-sm"
                          }`}
                        >
                          <span className="text-sm font-semibold">{listing.platform || "Platform"}</span>
                          <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                            <span>Open Listing</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`p-4 rounded-xl border text-center ${
                        isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                      }`}
                    >
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold inline-block border border-blue-500/20">
                        Direct Acquisition Available
                      </span>
                      <p className={`text-xs mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        This property is exclusively available for direct lock via Kaizen Real Estate.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Overview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5 font-mono">
                  Property Overview
                </h4>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {deal.description || 'This vetted corporate sublease property exhibits highly robust short-term rental performance indicators. Located in an area of exceptional tourism density with clear local HOA allowance.'}
                </p>
              </div>

              {/* Full Specs Table Grid */}
              <div
                className={`p-4 rounded-2xl border transition-colors ${
                  isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
                }`}
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 font-mono">
                  Property Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Monthly Rent</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm font-mono">
                      {typeof priceValue === 'number' ? `$${priceValue.toLocaleString()}` : priceValue}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Beds & Baths</span>
                    <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {bedsText || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Furnished Setup</span>
                    <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {furnished}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Est Occupancy</span>
                    <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {occupancy}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Square Footage</span>
                    <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {sqftText ? `${sqftText} SQFT` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Earliest Availability</span>
                    <span className="font-extrabold text-emerald-500 font-mono">{availability}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Bar */}
            <div
              className={`p-5 border-t flex flex-wrap items-center justify-between gap-3 ${
                isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-100"
              }`}
            >
              <span className="text-[10px] text-slate-400 font-mono">
                Kaizen Luxury Estates • Verified Property
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onInitiateLock}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer font-sans transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock & Secure Property (15-Min Hold)</span>
                </button>
                <button
                  onClick={onClose}
                  className={`px-4 py-2.5 border rounded-xl text-xs font-bold transition-all font-mono cursor-pointer ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
