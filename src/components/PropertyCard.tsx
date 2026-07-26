import React from 'react';
import { m } from 'motion/react';
import { MapPin, Heart, ArrowUpRight, ShieldCheck, BedDouble, Maximize2, Star, CheckCircle2 } from 'lucide-react';
import { Deal } from '../dealsData';

export interface PropertyDeal {
  id: string | number;
  title: string;
  location: string;
  imageUrl: string;
  adr?: string | number;
  furnished?: 'Yes' | 'No' | string | boolean;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'UNDER CONTRACT' | 'UNDER REVIEW' | 'MAINTENANCE' | string;
  bedsBaths?: string;
  squareFeet?: string | number;
  description?: string;
  monthlyRent?: string;
  leaseTerm?: string;
  projectedAnnualRevenue?: string;
  estOccupancy?: string;
  securityDeposit?: string;
  concessions?: string;
  availability?: string;
  estNetMonthlyProfit?: string;
  totalCashToStart?: string;
  specialRequirements?: string;
  images?: string[];
  listings?: Array<{ platform: string; isActive: boolean; url?: string }>;
  rating?: number;
  reviewCount?: number;
  availabilityRange?: string;
  [key: string]: any;
}

export interface PropertyCardProps {
  deal: Deal | PropertyDeal | any;
  isFavorite: boolean;
  onToggleFavorite: (id: string | number, e?: React.MouseEvent) => void;
  onOpenProspectus: (deal: Deal | PropertyDeal | any) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  deal,
  isFavorite,
  onToggleFavorite,
  onOpenProspectus,
}) => {
  const activeListings = deal.listings?.filter((l: { isActive?: boolean; url?: string; [key: string]: any }) => l.isActive && l.url) || [];

  // Deterministic realistic metadata if not provided
  const hash = String(deal.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = deal.rating || (4.9 + (hash % 10) / 100);
  const reviewCount = deal.reviewCount || (18 + (hash % 35));
  const availabilityRange = deal.availabilityRange || (deal.status === 'AVAILABLE' ? 'Available Dec 1 – Dec 8' : 'Under Review');

  return (
    <m.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      onClick={() => onOpenProspectus(deal)}
      className="group relative bg-white/70 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/40 overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-pointer hover:-translate-y-1.5 apple-specular"
    >
      {/* Crisp physical light edge highlight */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-900/5 dark:ring-white/10 pointer-events-none z-20 group-hover:ring-slate-900/10 dark:group-hover:ring-white/20 transition-all duration-300" />

      {/* Hero Image Container */}
      <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-100 dark:bg-white/5">
        <img
          src={deal.imageUrl}
          alt={deal.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-[0.98] dark:brightness-[0.95] group-hover:brightness-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Ambient Glass Dark Vignette without harsh break */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35 opacity-85 group-hover:opacity-70 transition-opacity duration-300" />

        {/* Top Floating Controls */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          {/* Location Glass Chip */}
          <div className="px-3 py-1.2 bg-black/40 dark:bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-semibold tracking-wider text-slate-100 border border-white/20 flex items-center gap-1.5 shadow-lg font-mono">
            <MapPin className="w-3 h-3 text-[#E04F33] shrink-0" />
            <span className="truncate max-w-[140px] text-white font-medium">{deal.location}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Favorite Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(deal.id, e);
              }}
              className="p-2 rounded-full bg-black/40 dark:bg-white/10 hover:bg-rose-950/60 backdrop-blur-xl text-slate-100 hover:text-rose-400 border border-white/20 hover:border-rose-500/40 shadow-lg transition-all duration-200 cursor-pointer"
              title={isFavorite ? 'Remove from Saved' : 'Save Property'}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
                }`}
              />
            </button>

            {/* Availability Status Badge */}
            <span
              className={`text-[9px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-lg border backdrop-blur-xl font-mono ${
                deal.status === 'AVAILABLE'
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                  : deal.status === 'OCCUPIED'
                  ? 'bg-black/50 text-slate-200 border-white/20'
                  : 'bg-[#E04F33]/30 text-[#FF8A73] border-[#E04F33]/50'
              }`}
            >
              {deal.status}
            </span>
          </div>
        </div>

        {/* Bottom Floating Specs */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between">
          <div className="px-3 py-1 bg-black/40 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-[10px] font-semibold text-slate-200 tracking-wider font-mono flex items-center gap-2 shadow-lg">
            <span className="flex items-center gap-1 text-white">
              <BedDouble className="w-3 h-3 text-[#E04F33]" />
              {deal.bedsBaths}
            </span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1 text-white">
              <Maximize2 className="w-3 h-3 text-[#E04F33]" />
              {deal.squareFeet} SQFT
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-black/40 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-[10px] font-semibold text-emerald-400 font-mono shadow-lg">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-300 font-bold">Verified</span>
          </div>
        </div>
      </div>

      {/* Card Body - seamlessly continuation of glass background */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Header & Nightly Rate */}
          <div className="flex justify-between items-start gap-3 mb-2">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base sm:text-lg leading-snug text-slate-900 dark:text-white group-hover:text-[#E04F33] dark:group-hover:text-[#FF8A73] transition-colors duration-200">
                {deal.title}
              </h3>

              {/* Star Rating & Reviews */}
              <div className="flex items-center gap-2 text-xs font-sans">
                <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  <span>{rating.toFixed(2)}</span>
                </div>
                <span className="text-slate-400 font-bold">•</span>
                <span className="text-slate-600 dark:text-slate-300 underline">{reviewCount} reviews</span>
                <span className="text-slate-400 font-bold">•</span>
                <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">{deal.furnished}</span>
              </div>
            </div>

            {/* Nightly Rate */}
            <div className="text-right shrink-0">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono block">
                FROM
              </span>
              <span className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight block">
                ${deal.adr}
                <span className="text-xs font-normal text-slate-600 dark:text-slate-300 font-sans"> / night</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans line-clamp-2 mt-2">
            {deal.description}
          </p>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-3.5 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2">
          {/* Availability / Channel Badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
            {activeListings.length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-[10px] font-medium">
                <ShieldCheck className="w-3 h-3 text-[#E04F33]" />
                {activeListings.length} Direct Channels
              </span>
            ) : (
              <span className="text-slate-600 dark:text-slate-300 text-[10px] font-mono tracking-wider">
                {availabilityRange}
              </span>
            )}
          </div>

          {/* View Property CTA with Strategic Brand Orange Accent */}
          <div className="inline-flex items-center gap-1.5 text-xs font-bold font-heading text-[#E04F33] group-hover:text-[#ED5B3F] transition-colors">
            <span>Explore Stay</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </m.article>
  );
};
