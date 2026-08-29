import React from "react";
import { motion } from "motion/react";
import { MapPin, Trash2, ArrowRight } from "lucide-react";
import type { Favorite } from "../../types/database";
import { useTheme } from "../../context/ThemeContext";

interface FavoriteCardProps {
  favorite: Favorite;
  onSelect: (property: Favorite["property"]) => void;
  onRemove: (propertyId: string | number) => void;
}

export const FavoriteCard: React.FC<FavoriteCardProps> = ({
  favorite,
  onSelect,
  onRemove,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const prop = favorite.property;
  const imageUrl =
    (prop.images && prop.images.length > 0 && prop.images[0]) ||
    (prop.media && prop.media.length > 0 && prop.media[0].cdn_url) ||
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200";
  const priceText = prop.price
    ? `$${prop.price.toLocaleString()}/mo`
    : prop.adr
      ? `$${prop.adr}/night`
      : "";
  const location = prop.city
    ? `${prop.city}, ${prop.state}`
    : prop.address || "";
  const headingId = `favorite-${prop.id}-title`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      whileHover={{ y: -6 }}
      role="button"
      tabIndex={0}
      aria-labelledby={headingId}
      onClick={() => onSelect(prop)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(prop);
        }
      }}
      className={`rounded-2xl border overflow-hidden shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between ${
        isDark
          ? "bg-slate-900/80 border-slate-800 hover:border-blue-500/40 shadow-slate-950/40"
          : "bg-white border-slate-200 hover:border-blue-400 shadow-slate-200/50"
      }`}
    >
      <div className="relative h-52 overflow-hidden bg-slate-950">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(prop.id);
          }}
          aria-label={`Remove ${prop.title} from favorites`}
          className="absolute top-3.5 right-3.5 p-2.5 rounded-full bg-slate-950/70 hover:bg-rose-950/90 text-rose-400 border border-white/20 backdrop-blur-md transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        {priceText && (
          <div className="absolute bottom-3.5 left-3.5 bg-slate-950/70 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold text-white font-mono">
            {priceText}
          </div>
        )}
      </div>
      <div className="p-5 sm:p-6 space-y-4">
        <div>
          <h3
            id={headingId}
            className={`text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {prop.title}
          </h3>
          <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 font-mono font-semibold">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            {location}
          </p>
        </div>
        <div className="pt-2 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
          <span>View Villa Details</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>
    </motion.div>
  );
};
