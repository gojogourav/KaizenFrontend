import React from "react";
import { Loader2, SearchX, Home, CalendarCheck } from "lucide-react";
import type { Property } from "../../types/database";

interface Props {
  results: Property[];
  loading: boolean;
  error: string | null;
  searched: boolean;
  checkIn?: string;
  checkOut?: string;
  onSelect?: (property: Property) => void;
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const PropertySearchResults: React.FC<Props> = ({
  results,
  loading,
  error,
  searched,
  checkIn,
  checkOut,
  onSelect,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#E04F33]" />
        <p className="text-sm font-mono">Searching properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-rose-400">
        <SearchX className="w-8 h-8" />
        <p className="text-sm font-mono">{error}</p>
      </div>
    );
  }

  if (!searched) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <Home className="w-10 h-10" />
        <p className="text-sm font-mono">
          Enter a location or dates to search properties
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <SearchX className="w-10 h-10" />
        <p className="text-sm font-mono font-bold text-white">
          No properties available
        </p>
        <p className="text-xs font-mono">
          {checkIn && checkOut
            ? `No available properties for ${fmt(checkIn)} → ${fmt(checkOut)}`
            : "Try adjusting your filters"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Result count + date range */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 font-mono">
          <span className="text-white font-bold">{results.length}</span> propert
          {results.length === 1 ? "y" : "ies"} found
        </p>
        {checkIn && checkOut && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E04F33]/10 border border-[#E04F33]/20">
            <CalendarCheck className="w-3 h-3 text-[#E04F33]" />
            <span className="text-[10px] font-mono text-[#FF8A73]">
              {fmt(checkIn)} → {fmt(checkOut)}
            </span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {results.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            checkIn={checkIn}
            checkOut={checkOut}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

// ── Individual card ─────────────────────────────────────────────────────────
const PropertyCard: React.FC<{
  property: Property;
  checkIn?: string;
  checkOut?: string;
  onSelect?: (p: Property) => void;
}> = ({ property, checkIn, checkOut, onSelect }) => {
  const p = property as any;
  const mediaUrl = p.media?.[0]?.cdn_url ?? p.images?.[0] ?? "";
  const rent = p.rent_monthly ?? p.price ?? 0;
  const profit = p.net_profit_monthly ?? Math.round(Number(rent) * 0.75);

  return (
    <div
      onClick={() => onSelect?.(property)}
      className={`group bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-xl hover:shadow-black/30 flex flex-col justify-between ${
        onSelect ? "cursor-pointer" : ""
      }`}
    >
      {/* Image */}
      <div className="relative h-44 bg-black/20 overflow-hidden">
        <img
          src={
            mediaUrl ||
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
          }
          alt={p.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";
          }}
        />
        {/* Available badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
            {p.status === "ACTIVE" || p.status === "AVAILABLE"
              ? "AVAILABLE"
              : p.status || "AVAILABLE"}
          </span>
        </div>
        {/* Beds/Baths badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-black/60 text-slate-300 border border-white/10 backdrop-blur-sm">
            {p.bedrooms || 0}bd · {p.bathrooms || 0}ba
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-white text-sm leading-tight truncate">
            {p.title}
          </h3>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            {p.city}, {p.state}
            {p.distance_km != null && (
              <span className="ml-2 text-slate-500">
                · {p.distance_km} km away
              </span>
            )}
          </p>
        </div>

        {/* Financials */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-white/5 rounded-xl border border-white/5">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-mono block mb-0.5">
              Monthly Rent
            </span>
            <span className="text-sm font-bold text-white font-mono">
              ${Number(rent).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-mono block mb-0.5">
              Net Profit
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              ~${Number(profit).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Date range if set */}
        {checkIn && checkOut && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <CalendarCheck className="w-3 h-3 text-[#E04F33]" />
            {fmt(checkIn)} → {fmt(checkOut)}
          </div>
        )}

        {/* Platform Links (FIXED) */}
        {p.listings?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {p.listings
              .filter((l: any) => l.isActive || l.is_active)
              .map((l: any, i: number) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-[#E04F33]/15 text-[#FF8A73] border border-[#E04F33]/30 hover:bg-[#E04F33]/25 transition-colors"
                >
                  {l.platform}
                </a>
              ))}
          </div>
        )}

        {/* CTA */}
        {onSelect && (
          <div className="pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(property);
              }}
              className="w-full py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#E04F33]/20 border border-white/20 active:scale-[0.98]"
            >
              View & Lock Property
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
