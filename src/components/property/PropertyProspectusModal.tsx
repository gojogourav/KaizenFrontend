import React, { useState, useEffect } from 'react';
import { X, MapPin, ChevronLeft, ChevronRight, Globe, ExternalLink, Lock } from 'lucide-react';

interface PropertyProspectusModalProps {
  deal: any; // Accepts Django Property models or frontend Deal types
  onClose: () => void;
  onInitiateLock: () => void;
}

const PLATFORM_ICONS: Record<string, string> = {
  'Airbnb': '🏠',
  'Vrbo': '🏖️',
  'Booking.com': '🏨',
  'Zillow': '🏡',
  'Direct Website': '🌐',
};

export const PropertyProspectusModal: React.FC<PropertyProspectusModalProps> = ({
  deal,
  onClose,
  onInitiateLock
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (deal) {
      document.body.style.overflow = 'hidden';
      setActiveImageIndex(0); // Reset image index when opening a new deal
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [deal]);

  if (!deal) return null;

  // -------------------------------------------------------------
  // Dynamic Data Mapping
  // -------------------------------------------------------------

  // Extract images from Django's media array OR legacy string array
  const images = Array.isArray(deal.images) && deal.images.length > 0
    ? deal.images
    : deal.media?.map((m: any) => m.cdn_url) || [deal.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'];

  // Map locations and specs dynamically
  const locationText = deal.city ? `${deal.city}, ${deal.state}` : deal.location || '';
  const bedsText = deal.bedrooms ? `${deal.bedrooms} bed, ${Number(deal.bathrooms || 0)} bath` : deal.bedsBaths || '';
  const sqftText = deal.squareFeet ? ` • ${deal.squareFeet} SQFT` : '';
  const subtitle = `${locationText} ${bedsText ? `• ${bedsText}` : ''}${sqftText}`;

  // Filter active platform listings
  const activeListings = Array.isArray(deal.listings)
    ? deal.listings.filter((l: any) => l.isActive && l.url)
    : [];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">

      {/* Blurred Backdrop - Uses Tailwind animate-fade-in */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in cursor-pointer"
      />

      {/* Modal Container - Uses Tailwind animate-fade-in instead of framer-motion */}
      <div
        className="relative w-full max-w-[850px] bg-[#12131A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-fade-in apple-specular"
      >
        {/* 1. Header (Sticky) */}
        <div className="p-6 sm:px-8 sm:pt-8 flex justify-between items-start shrink-0 relative z-10 bg-[#12131A]">
          <div>
            <div className="inline-block px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 mb-4">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#FF8A73] font-mono">
                Luxury Villa Details
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
              {deal.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-400 mt-3 font-mono">
              <MapPin className="w-4 h-4 text-[#E04F33] shrink-0" />
              <span className="truncate">{subtitle}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Content Body */}
        <div className="px-6 sm:px-8 pb-8 overflow-y-auto overflow-x-hidden relative z-0 custom-scrollbar">

          {/* Main Image Gallery */}
          <div className="relative w-full h-[280px] sm:h-[400px] rounded-2xl overflow-hidden group border border-white/5 bg-black/40">
            <img
              src={images[activeImageIndex]}
              alt={deal.title}
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white border border-white/20 font-mono tracking-widest shadow-lg">
              {activeImageIndex + 1} / {images.length} Photos
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#E04F33] scale-[1.02] shadow-lg shadow-[#E04F33]/20'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Platform Links Section */}
          <div className="mt-8 bg-[#181920] border border-white/10 rounded-3xl p-6 sm:p-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#E04F33]" />
                  Book / View on Platforms
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Select your preferred platform below to open the official active listing directly.
                </p>
              </div>
              <div className="shrink-0">
                <span className="px-3 py-1.5 bg-[#E04F33]/10 text-[#FF8A73] text-[10px] font-bold rounded-full border border-[#E04F33]/20 tracking-widest font-mono uppercase">
                  LIVE LISTINGS
                </span>
              </div>
            </div>

            {activeListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeListings.map((listing: any, idx: number) => {
                  const icon = PLATFORM_ICONS[listing.platform] || '🔗';
                  return (
                    <a
                      key={idx}
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{icon}</span>
                        <span className="font-bold text-slate-200 group-hover:text-white transition-colors text-sm">
                          {listing.platform}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 group-hover:text-[#FF8A73] transition-colors">
                        <span>Open Listing</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-slate-300 font-bold text-sm">Direct Lease Only</p>
                <p className="text-xs text-slate-500 mt-1">This property is exclusively available for direct acquisition via Kaizen.</p>
              </div>
            )}
          </div>

        </div>

        {/* 3. Footer (Sticky) */}
        <div className="p-6 sm:px-8 border-t border-white/10 bg-[#12131A] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
          <span className="text-xs text-slate-400 font-mono tracking-wide hidden md:block">
            Kaizen Luxury Estates • Verified Property
          </span>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
            <button
              onClick={onInitiateLock}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E04F33]/25 border border-white/20 active:scale-95 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Lock & Secure Property (15-Min Hold)</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
