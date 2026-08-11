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

interface PropertyProspectusModalProps {
  deal: any; // Accepts your backend Property model OR frontend Deal model
  onClose: () => void;
  onInitiateLock: () => void;
}

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

export const PropertyProspectusModal: React.FC<PropertyProspectusModalProps> = ({
  deal,
  onClose,
  onInitiateLock
}) => {
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

  // Safely map incoming Django backend fields or legacy Frontend fields
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

  // Maps backend link payload safely
  const activeListings = Array.isArray(deal?.listings)
    ? deal.listings.filter((l: any) => (l.isActive || l.is_active) && l.url)
    : [];

  return (
    <AnimatePresence>
      {deal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">

          {/* Backdrop clickable overlay */}
          <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-[#0F1014]/90 backdrop-blur-3xl rounded-3xl max-w-2xl w-full border border-white/15 shadow-2xl shadow-black/80 overflow-hidden flex flex-col relative z-10 text-slate-100 apple-specular"
          >

            {/* Header */}
            <div className="bg-white/5 p-6 text-white flex justify-between items-start border-b border-white/10 backdrop-blur-xl">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#FF8A73] bg-white/10 px-3 py-1 rounded-full font-bold border border-white/15">
                  Luxury Villa Details
                </span>
                <h3 className="text-xl font-extrabold tracking-tight mt-2 font-heading">{deal.title}</h3>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#E04F33]" />
                  {locationText} {bedsText && `• ${bedsText}`} {sqftText && `• ${sqftText} SQFT`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-full transition-colors border border-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto space-y-6 max-h-[600px] custom-scrollbar">

              {/* Photo Gallery Viewer */}
              <div>
                <div className="h-64 rounded-2xl overflow-hidden relative border border-white/10 bg-black/40">
                  <img
                    src={images[activeImageIndex]}
                    alt={deal.title}
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all border border-white/20 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all border border-white/20 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-200 border border-white/10">
                    {activeImageIndex + 1} / {images.length || 1} Photos
                  </div>
                </div>

                {/* Thumbnails strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          activeImageIndex === idx ? 'border-[#E04F33] scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Book / View on Platforms */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3 backdrop-blur-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-white font-heading flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-[#E04F33]" />
                      Book / View on Platforms
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">Select your preferred platform below to open the official active listing directly.</p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 bg-white/10 text-[#FF8A73] text-[10px] font-mono font-bold rounded-full border border-white/15">
                    LIVE LISTINGS
                  </span>
                </div>

                <div className="pt-2">
                  {activeListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeListings.map((listing: any, idx: number) => {
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
                      <p className="text-xs text-slate-400 mt-2">This property is exclusively available for direct acquisition via Kaizen.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description text */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF8A73] mb-1.5 font-mono">Property Overview</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {deal.description || 'This vetted corporate sublease property exhibits highly robust short-term rental performance indicators. Located in an area of exceptional tourism density with clear local HOA allowance.'}
                </p>
              </div>

              {/* Full Specs Table Grid */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF8A73] mb-3 font-mono">Property Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Nightly Rate</span>
                    <span className="font-extrabold text-white text-sm font-mono">
                      {typeof priceValue === 'number' ? `$${priceValue.toLocaleString()}` : priceValue}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Beds & Baths</span>
                    <span className="font-bold text-slate-200">{bedsText || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Furnished Setup</span>
                    <span className="font-bold text-slate-200">{furnished}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Est Occupancy</span>
                    <span className="font-bold text-slate-200">{occupancy}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Square Footage</span>
                    <span className="font-bold text-slate-200">{sqftText ? `${sqftText} SQFT` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Earliest Availability</span>
                    <span className="font-extrabold text-[#FF8A73] font-mono">{availability}</span>
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
                  onClick={onInitiateLock}
                  className="px-5 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#E04F33]/25 border border-white/20 flex items-center gap-2 cursor-pointer font-sans"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock & Secure Property (15-Min Hold)</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 rounded-xl text-xs font-bold transition-all font-mono cursor-pointer"
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
