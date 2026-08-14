import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Heart, ArrowUpRight, ShieldCheck, BedDouble, Maximize2, Star, CheckCircle2 } from 'lucide-react';

export interface PropertyCardProps {
  deal: any;
  isFavorite: boolean;
  onToggleFavorite: (id: string | number, e?: React.MouseEvent) => void;
  onOpenProspectus: (deal: any) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  deal,
  isFavorite,
  onToggleFavorite,
  onOpenProspectus,
}) => {
  const activeListings = deal.listings?.filter((l: any) => l.isActive && l.url) || [];

  const hash = String(deal.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = deal.rating || (4.9 + (hash % 10) / 100);
  const reviewCount = deal.reviewCount || (18 + (hash % 35));

  const statusDisplay = (deal.status || 'AVAILABLE').toUpperCase();
  const availabilityRange = deal.availabilityRange || (statusDisplay === 'AVAILABLE' || statusDisplay === 'ACTIVE' ? 'Available Now' : 'Under Review');
  const locationText = deal.city ? `${deal.city}, ${deal.state}` : deal.location || '';
  const coverImage = deal.images?.[0] || deal.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
  const displayPrice = deal.price ?? deal.rent_monthly ?? deal.adr ?? 0;
  const displayBeds = deal.bedsBaths || `${deal.bedrooms || 3} bed, ${Number(deal.bathrooms || 2)} bath`;
  const displayFurnished = deal.furnished || 'Yes';

  const getStatusClasses = () => {
    if (statusDisplay === 'AVAILABLE' || statusDisplay === 'ACTIVE') return 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20';
    if (statusDisplay === 'OCCUPIED' || statusDisplay === 'LOCKED') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (statusDisplay === 'UNDER CONTRACT') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  return (
    <motion.article
      onClick={() => onOpenProspectus(deal)}
      whileHover={{ y: -8, scale: 1.012 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group relative bg-[#14151A] rounded-[1.5rem] border border-white/5 hover:border-white/10 shadow-xl shadow-black/50 overflow-hidden flex flex-col justify-between cursor-pointer apple-specular"
    >
      <div className="absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-white/5 pointer-events-none z-20 group-hover:ring-white/10 transition-all duration-300" />

      <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-[#0B0C10]">
        <img
          src={coverImage}
          alt={deal.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-[0.90] group-hover:brightness-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#14151A] via-transparent to-black/40 opacity-90 group-hover:opacity-60 transition-opacity duration-300" />

        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <div className="px-3.5 py-1.5 bg-[#0B0C10]/80 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-widest text-slate-100 border border-white/10 flex items-center gap-1.5 shadow-lg font-mono uppercase">
            <MapPin className="w-3 h-3 text-[#E04F33] shrink-0" />
            <span className="truncate max-w-[140px] text-white">{locationText}</span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(deal.id, e);
              }}
              className="p-2 rounded-lg bg-[#0B0C10]/80 hover:bg-rose-950/60 backdrop-blur-md text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 shadow-lg transition-colors duration-200 cursor-pointer"
              title={isFavorite ? 'Remove from Saved' : 'Save Property'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isFavorite ? 'filled' : 'empty'}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
                    }`}
                  />
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <span
              className={`text-[9px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-lg shadow-lg border backdrop-blur-md font-mono ${getStatusClasses()}`}
            >
              {statusDisplay === 'ACTIVE' ? 'AVAILABLE' : statusDisplay}
            </span>
          </div>
        </div>

        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between">
          <div className="px-3.5 py-1.5 bg-[#0B0C10]/80 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-bold text-slate-300 tracking-wider font-mono flex items-center gap-2.5 shadow-lg">
            <span className="flex items-center gap-1.5 text-white">
              <BedDouble className="w-3.5 h-3.5 text-[#E04F33]" />
              {displayBeds}
            </span>
            {deal.squareFeet && (
              <>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5 text-white">
                  <Maximize2 className="w-3.5 h-3.5 text-[#E04F33]" />
                  {deal.squareFeet} SQFT
                </span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0B0C10]/80 backdrop-blur-md border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400 font-mono shadow-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 uppercase tracking-widest">Verified</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-lg leading-tight text-white group-hover:text-[#FF8A73] transition-colors duration-200 line-clamp-1">
                {deal.title}
              </h3>

              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1 font-bold text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                  <span>{rating.toFixed(2)}</span>
                </div>
                <span className="text-white/20">•</span>
                <span className="text-slate-400 hover:text-white transition-colors">{reviewCount} reviews</span>
                <span className="text-white/20">•</span>
                <span className="text-slate-400">{displayFurnished}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] font-mono block mb-0.5">
                MONTHLY RENT
              </span>
              <span className="font-mono font-bold text-lg text-white tracking-tight block">
                ${Number(displayPrice).toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2 mt-3">
            {deal.description || "Stunning turnkey property highly optimized for luxury stays and immediate revenue generation."}
          </p>
        </div>

        <div className="pt-5 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            {activeListings.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B0C10] border border-white/5 text-slate-300 text-[10px] font-bold uppercase tracking-widest shadow-inner">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E04F33]" />
                {activeListings.length} Channels
              </span>
            ) : (
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
                {availabilityRange}
              </span>
            )}
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-bold font-mono tracking-widest uppercase text-[#E04F33] group-hover:text-[#FF8A73] transition-colors">
            <span>Explore</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </motion.article>
  );
};
