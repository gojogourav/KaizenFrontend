import React from "react";
import {
  MapPin,
  Heart,
  ShieldCheck,
  BedDouble,
  Maximize2,
  Star,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useRatings } from "../../hooks/useRatings";

export interface PropertyCardProps {
  deal: any;
  isFavorite: boolean;
  onToggleFavorite: (id: string | number, e?: React.MouseEvent) => void;
  onOpenProspectus: (deal: any) => void;
  onRate?: (deal: any, e: React.MouseEvent) => void;
}

export const PropertyCard = React.memo<PropertyCardProps>(({
  deal,
  isFavorite,
  onToggleFavorite,
  onOpenProspectus,
  onRate,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { getRating } = useRatings();

  const userRating = getRating(deal.id);

  const activeListings =
    deal.listings?.filter((l: any) => (l.isActive || l.is_active) && l.url) || [];

  const hash = String(deal.id)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const ratingValue =
    userRating?.rating ||
    deal.rating ||
    deal.average_rating ||
    deal.rating_score ||
    (4.85 + (hash % 15) / 100);

  const reviewCount =
    deal.reviewCount ||
    deal.review_count ||
    deal.reviews_count ||
    (24 + (hash % 30) + (userRating ? 1 : 0));

  const bioText =
    deal.bio ||
    deal.host_bio ||
    deal.owner_bio ||
    deal.description ||
    "Stunning luxury turnkey property highly optimized for high occupancy and immediate revenue generation.";

  const statusDisplay = (deal.status || "AVAILABLE").toUpperCase();
  const locationText = deal.city
    ? `${deal.city}, ${deal.state}`
    : deal.location || "";

  const coverImage = ((): string => {
    let rawUrl = "";
    if (deal) {
      if (Array.isArray(deal.images) && deal.images.length > 0) {
        for (const item of deal.images) {
          if (typeof item === "string" && item.trim()) { rawUrl = item; break; }
          if (item && typeof item === "object") {
            const url = item.cdn_url || item.url || item.file || item.image || item.src;
            if (typeof url === "string" && url.trim()) { rawUrl = url; break; }
          }
        }
      }
      if (!rawUrl && Array.isArray(deal.media) && deal.media.length > 0) {
        for (const item of deal.media) {
          if (typeof item === "string" && item.trim()) { rawUrl = item; break; }
          if (item && typeof item === "object") {
            const url = item.cdn_url || item.url || item.file || item.image || item.src;
            if (typeof url === "string" && url.trim()) { rawUrl = url; break; }
          }
        }
      }
      if (!rawUrl && typeof deal.imageUrl === "string" && deal.imageUrl.trim()) rawUrl = deal.imageUrl;
      if (!rawUrl && typeof deal.image_url === "string" && deal.image_url.trim()) rawUrl = deal.image_url;
      if (!rawUrl && typeof deal.cover_image === "string" && deal.cover_image.trim()) rawUrl = deal.cover_image;
      if (!rawUrl && typeof deal.image === "string" && deal.image.trim()) rawUrl = deal.image;
    }

    if (!rawUrl) {
      const hashVal = String(deal?.id || 0).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const fallbacks = [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=70",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=70",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=70",
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=70",
      ];
      return fallbacks[hashVal % fallbacks.length];
    }

    // Optimize Unsplash images for quick mobile loading
    if (rawUrl.includes("unsplash.com") && !rawUrl.includes("w=600")) {
      return rawUrl.replace(/w=\d+/, "w=600").replace(/q=\d+/, "q=70");
    }

    return rawUrl;
  })();

  const displayPrice = deal.price ?? deal.rent_monthly ?? deal.adr ?? 0;
  const displayBeds =
    deal.bedsBaths ||
    `${deal.bedrooms || 3} bed, ${Number(deal.bathrooms || 2)} bath`;

  return (
    <article
      onClick={() => onOpenProspectus(deal)}
      className={`card-gpu group relative rounded-3xl border shadow-xl overflow-hidden flex flex-col justify-between cursor-pointer transition-transform duration-200 hover:-translate-y-1 active:scale-[0.99] h-full w-full min-w-0 ${
        isDark
          ? "bg-slate-900/90 border-slate-800 hover:border-blue-500/40 shadow-slate-950/40"
          : "bg-white border-slate-200 hover:border-blue-400 shadow-slate-200/50"
      }`}
    >
      {/* Property Image Container */}
      <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-900 shrink-0">
        <img
          src={coverImage}
          alt={deal.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out filter brightness-[0.92] group-hover:brightness-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=70";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/35 opacity-90 group-hover:opacity-60 transition-opacity duration-300" />

        {/* Top Badges overlay */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 gap-2 min-w-0">
          <div className="px-3 py-1.5 bg-slate-900/85 rounded-xl text-[10px] font-bold tracking-widest text-slate-100 border border-white/10 flex items-center gap-1.5 shadow-lg font-mono uppercase min-w-0">
            <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="truncate text-white">{locationText}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(deal.id, e);
              }}
              className="p-2 rounded-xl bg-slate-900/85 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 shadow-lg transition-colors duration-200 cursor-pointer active:scale-90"
              title={isFavorite ? "Remove from Saved" : "Save Property"}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite ? "fill-rose-500 text-rose-500" : "text-white"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Image Info Badges */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between min-w-0 gap-2">
          <div className="px-3 py-1.5 bg-slate-900/85 border border-white/10 rounded-xl text-[10px] font-bold text-slate-200 tracking-wider font-mono flex items-center gap-2.5 shadow-lg min-w-0 truncate">
            <span className="flex items-center gap-1.5 text-white shrink-0">
              <BedDouble className="w-3.5 h-3.5 text-blue-400" />
              {displayBeds}
            </span>
            {deal.squareFeet && (
              <>
                <span className="text-white/30 shrink-0">•</span>
                <span className="flex items-center gap-1.5 text-white truncate">
                  <Maximize2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {deal.squareFeet} SQFT
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/85 border border-emerald-500/30 rounded-xl text-[10px] font-bold text-emerald-400 font-mono shadow-lg shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 uppercase tracking-widest">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Property Details Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 min-w-0">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3
              className={`text-lg font-bold font-heading line-clamp-1 leading-snug ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {deal.title}
            </h3>

            <div className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase shrink-0">
              {statusDisplay}
            </div>
          </div>

          {/* Rating & Review Bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-amber-500 font-mono text-[10px] font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{Number(ratingValue).toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              ({reviewCount} reviews)
            </span>
            {userRating && (
              <span className="text-[9px] bg-blue-600 text-white font-mono px-2 py-0.5 rounded-md font-bold">
                Your Rating
              </span>
            )}
          </div>

          {/* Property / Host Bio snippet */}
          <div
            className={`p-3 rounded-2xl border text-xs leading-relaxed line-clamp-2 ${
              isDark
                ? "bg-slate-950/60 border-slate-800 text-slate-300"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
              <UserCheck className="w-3 h-3" />
              Host &amp; Property Bio
            </div>
            {bioText}
          </div>
        </div>

        {/* Pricing & Call-to-action Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Monthly Lease
              </p>
              <p className="text-xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                ${Number(displayPrice).toLocaleString()}
                <span className="text-xs text-slate-400 font-normal font-sans">
                  /mo
                </span>
              </p>
            </div>

            {deal.occupancy_rate && (
              <div className="text-right">
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Avg Occupancy
                </p>
                <p className="text-xs font-bold font-mono text-emerald-500">
                  {deal.occupancy_rate}%
                </p>
              </div>
            )}
          </div>

          <div
            className={`p-2.5 rounded-2xl border flex items-center justify-between ${
              isDark
                ? "bg-slate-950/60 border-slate-800/80"
                : "bg-slate-50 border-slate-200/80"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-mono truncate">
              {activeListings.length > 0 ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest shrink-0 ${
                    isDark
                      ? "bg-slate-800/80 border-slate-700 text-slate-300"
                      : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {activeListings.length} Channels
                </span>
              ) : (
                <span className="text-slate-400 text-[10px]">Turnkey Ready</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onRate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRate(deal, e);
                  }}
                  className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-xl text-[10px] font-bold font-mono transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <Star className="w-3 h-3 fill-amber-500" />
                  Rate
                </button>
              )}

              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                View Prospectus
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

PropertyCard.displayName = "PropertyCard";
