import React from "react";
import { m } from "motion/react";
import {
  MapPin,
  Heart,
  ArrowUpRight,
  ShieldCheck,
  BedDouble,
  Maximize2,
  Star,
} from "lucide-react";
import type { Property } from "../../types/database";

export interface PropertyCardProps {
  deal: Property & { rating?: number; reviewCount?: number };
  isFavorite: boolean;
  onToggleFavorite: (id: string | number, e?: React.MouseEvent) => void;
  onOpenProspectus: (deal: PropertyCardProps["deal"]) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  deal,
  isFavorite,
  onToggleFavorite,
  onOpenProspectus,
}) => {
  const activeListings =
    deal.listings?.filter((l) => l.isActive && l.url) || [];
  const location = deal.city
    ? `${deal.city}, ${deal.state}`
    : deal.address || "";
  const headingId = `property-${deal.id}-title`;
  const hasSpecs = Boolean(deal.bedsBaths || deal.squareFeet);
  const priceValue = deal.adr ?? deal.price;
  const priceUnit = deal.adr ? "/ night" : deal.price ? "/ mo" : "";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenProspectus(deal);
    }
  };

  return (
    <m.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      role="button"
      tabIndex={0}
      aria-labelledby={headingId}
      onClick={() => onOpenProspectus(deal)}
      onKeyDown={handleKeyDown}
      className="group relative bg-white/70 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E04F33] shadow-xl shadow-slate-200/50 dark:shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-pointer hover:-translate-y-1.5"
    >
      <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-100 dark:bg-white/5">
        <img
          src={deal.images?.[0]}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-[0.98] dark:brightness-[0.95] group-hover:brightness-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35 opacity-85 group-hover:opacity-70 transition-opacity duration-300" />

        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          {location && (
            <div className="px-3 py-1.2 bg-black/40 backdrop-blur-xl rounded-full text-[10px] font-semibold text-slate-100 border border-white/20 flex items-center gap-1.5 shadow-lg font-mono">
              <MapPin
                className="w-3 h-3 text-[#E04F33] shrink-0"
                aria-hidden="true"
              />
              <span className="truncate max-w-[140px] text-white font-medium">
                {location}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(deal.id, e);
              }}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite
                  ? `Remove ${deal.title} from saved`
                  : `Save ${deal.title}`
              }
              className="p-2 rounded-full bg-black/40 hover:bg-rose-950/60 backdrop-blur-xl text-slate-100 hover:text-rose-400 border border-white/20 hover:border-rose-500/40 shadow-lg transition-all duration-200"
            >
              <Heart
                className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-white"}`}
                aria-hidden="true"
              />
            </button>

            {deal.status && (
              <span
                className={`text-[9px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-lg border backdrop-blur-xl font-mono ${
                  deal.status === "AVAILABLE"
                    ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/40"
                    : deal.status === "OCCUPIED"
                      ? "bg-black/50 text-slate-200 border-white/20"
                      : "bg-[#E04F33]/30 text-[#FF8A73] border-[#E04F33]/50"
                }`}
              >
                {deal.status}
              </span>
            )}
          </div>
        </div>

        {hasSpecs && (
          <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between">
            <div className="px-3 py-1 bg-black/40 backdrop-blur-xl border border-white/20 rounded-lg text-[10px] font-semibold text-slate-200 font-mono flex items-center gap-2 shadow-lg">
              {deal.bedsBaths && (
                <span className="flex items-center gap-1 text-white">
                  <BedDouble
                    className="w-3 h-3 text-[#E04F33]"
                    aria-hidden="true"
                  />
                  {deal.bedsBaths}
                </span>
              )}
              {deal.bedsBaths && deal.squareFeet && (
                <span className="text-white/30" aria-hidden="true">
                  •
                </span>
              )}
              {deal.squareFeet && (
                <span className="flex items-center gap-1 text-white">
                  <Maximize2
                    className="w-3 h-3 text-[#E04F33]"
                    aria-hidden="true"
                  />
                  {deal.squareFeet} SQFT
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex justify-between items-start gap-3 mb-2">
            <div className="space-y-1">
              <h3
                id={headingId}
                className="font-bold text-base sm:text-lg leading-snug text-slate-900 dark:text-white group-hover:text-[#E04F33] dark:group-hover:text-[#FF8A73] transition-colors"
              >
                {deal.title}
              </h3>
              {typeof deal.rating === "number" && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold">
                    <Star
                      className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400"
                      aria-hidden="true"
                    />
                    <span>{deal.rating.toFixed(2)}</span>
                  </div>
                  {typeof deal.reviewCount === "number" && (
                    <>
                      <span
                        className="text-slate-400 font-bold"
                        aria-hidden="true"
                      >
                        •
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 underline">
                        {deal.reviewCount} reviews
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            {priceValue != null && (
              <div className="text-right shrink-0">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono block">
                  FROM
                </span>
                <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight block">
                  ${priceValue.toLocaleString()}
                  <span className="text-xs font-normal text-slate-600 dark:text-slate-300">
                    {" "}
                    {priceUnit}
                  </span>
                </span>
              </div>
            )}
          </div>
          {deal.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 mt-2">
              {deal.description}
            </p>
          )}
        </div>

        <div className="pt-3.5 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2">
          {activeListings.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-[10px] font-medium">
              <ShieldCheck
                className="w-3 h-3 text-[#E04F33]"
                aria-hidden="true"
              />
              {activeListings.length} Direct Channels
            </span>
          )}
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E04F33] group-hover:text-[#ED5B3F] transition-colors ml-auto">
            <span>Explore Stay</span>
            <ArrowUpRight
              className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </m.article>
  );
};
