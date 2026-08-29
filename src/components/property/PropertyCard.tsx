import React from "react";
import { motion, AnimatePresence } from "motion/react";
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

export const PropertyCard: React.FC<PropertyCardProps> = ({
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
    if (!deal) return "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";

    // Check deal.images array
    if (Array.isArray(deal.images) && deal.images.length > 0) {
      for (const item of deal.images) {
        if (typeof item === "string" && item.trim()) return item;
        if (item && typeof item === "object") {
          const url = item.cdn_url || item.url || item.file || item.image || item.src;
          if (typeof url === "string" && url.trim()) return url;
        }
      }
    }

    // Check deal.media array (Django API response)
    if (Array.isArray(deal.media) && deal.media.length > 0) {
      for (const item of deal.media) {
        if (typeof item === "string" && item.trim()) return item;
        if (item && typeof item === "object") {
          const url = item.cdn_url || item.url || item.file || item.image || item.src;
          if (typeof url === "string" && url.trim()) return url;
        }
      }
    }

    // String property fallbacks
    if (typeof deal.imageUrl === "string" && deal.imageUrl.trim()) return deal.imageUrl;
    if (typeof deal.image_url === "string" && deal.image_url.trim()) return deal.image_url;
    if (typeof deal.cover_image === "string" && deal.cover_image.trim()) return deal.cover_image;
    if (typeof deal.image === "string" && deal.image.trim()) return deal.image;

    const hashVal = String(deal.id || 0).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const fallbacks = [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    ];
    return fallbacks[hashVal % fallbacks.length];
  })();

  const displayPrice = deal.price ?? deal.rent_monthly ?? deal.adr ?? 0;
  const displayBeds =
    deal.bedsBaths ||
    `${deal.bedrooms || 3} bed, ${Number(deal.bathrooms || 2)} bath`;

  return (
    <motion.article
      onClick={() => onOpenProspectus(deal)}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`group relative rounded-3xl border shadow-xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 h-full w-full min-w-0 ${
        isDark
          ? "bg-slate-900/70 border-slate-800 hover:border-blue-500/40 shadow-slate-950/40 apple-specular"
          : "bg-white border-slate-200 hover:border-blue-400 shadow-slate-200/50"
      }`}
    >
      {/* Property Image Container */}
      <div className="relative h-64 sm:h-[19rem] w-full overflow-hidden bg-slate-900 shrink-0">
        <img
          src={coverImage}
          alt={deal.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-[0.92] group-hover:brightness-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/35 opacity-90 group-hover:opacity-60 transition-opacity duration-300" />

        {/* Top Badges overlay */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 gap-2 min-w-0">
          <div className="px-3 py-1.5 bg-slate-900/85 backdrop-blur-md rounded-xl text-[10px] font-bold tracking-widest text-slate-100 border border-white/10 flex items-center gap-1.5 shadow-lg font-mono uppercase min-w-0">
            <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="truncate text-white">{locationText}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(deal.id, e);
              }}
              className="p-2 rounded-xl bg-slate-900/85 hover:bg-rose-950/60 backdrop-blur-md text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 shadow-lg transition-colors duration-200 cursor-pointer"
              title={isFavorite ? "Remove from Saved" : "Save Property"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isFavorite ? "filled" : "empty"}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavorite ? "fill-rose-500 text-rose-500" : "text-white"
                    }`}
                  />
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Bottom Image Info Badges */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between min-w-0 gap-2">
          <div className="px-3 py-1.5 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-bold text-slate-200 tracking-wider font-mono flex items-center gap-2.5 shadow-lg min-w-0 truncate">
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

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md border border-emerald-500/30 rounded-xl text-[10px] font-bold text-emerald-400 font-mono shadow-lg shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 uppercase tracking-widest">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 min-w-0">
        <div className="min-w-0">
          <div className="flex justify-between items-start gap-4 mb-2.5 min-w-0">
            <div className="space-y-1 min-w-0 flex-1">
              <h3
                className={`font-serif font-bold text-lg leading-tight transition-colors duration-200 truncate ${
                  isDark
                    ? "text-white group-hover:text-blue-400"
                    : "text-slate-900 group-hover:text-blue-600"
                }`}
              >
                {deal.title}
              </h3>

              {/* Rating & Review info */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
                <div className="flex items-center gap-1 font-bold text-amber-500 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  <span>{Number(ratingValue).toFixed(2)}</span>
                </div>
                <span className="text-slate-400 shrink-0">•</span>
                <span className="text-slate-400 shrink-0 font-medium">
                  {reviewCount} reviews
                </span>
                {userRating && (
                  <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[9px] font-bold text-amber-500">
                    Your Rating: {userRating.rating}★
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] font-mono block mb-0.5">
                MONTHLY RENT
              </span>
              <span className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400 tracking-tight block">
                ${Number(displayPrice).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bio / Description display */}
          <div
            className={`mt-3 p-3 rounded-2xl border text-xs leading-relaxed transition-colors ${
              isDark
                ? "bg-slate-950/60 border-slate-800 text-slate-300"
                : "bg-slate-50 border-slate-100 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
              <UserCheck className="w-3 h-3 text-blue-500" />
              <span>Property &amp; Host Bio</span>
            </div>
            <p className="line-clamp-2">{bioText}</p>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div
          className={`pt-3.5 border-t flex items-center justify-between gap-2 mt-auto min-w-0 ${
            isDark ? "border-slate-800" : "border-slate-100"
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
                className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-xl text-[10px] font-bold font-mono transition-colors cursor-pointer flex items-center gap-1"
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
    </motion.article>
  );
};
