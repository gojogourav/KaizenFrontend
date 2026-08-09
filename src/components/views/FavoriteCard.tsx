import React from "react";
import { MapPin, Trash2, ArrowRight } from "lucide-react";
import type { Favorite } from "../../types/database";

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
  const prop = favorite.property;
  const imageUrl =
    (prop.images && prop.images.length > 0 && prop.images[0]) ||
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
    <div
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
      className="bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E04F33] overflow-hidden shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
    >
      <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-[#06040a]">
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
          className="absolute top-3.5 right-3.5 p-2.5 rounded-full bg-black/50 hover:bg-rose-950/90 text-rose-400 border border-white/20 backdrop-blur-md transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        {priceText && (
          <div className="absolute bottom-3.5 left-3.5 bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold text-white font-mono">
            {priceText}
          </div>
        )}
      </div>
      <div className="p-5 sm:p-6 space-y-4">
        <div>
          <h3
            id={headingId}
            className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#E04F33] dark:group-hover:text-[#FF8A73] transition-colors"
          >
            {prop.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#E04F33]" aria-hidden="true" />
            {location}
          </p>
        </div>
        <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#E04F33] dark:group-hover:text-[#FF8A73] transition-colors">
          <span>View Villa Details</span>
          <ArrowRight
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};
