import React, { useState } from "react";
import {
  MapPin,
  CalendarDays,
  Search,
  X,
  SlidersHorizontal,
  BedDouble,
  DollarSign,
  ArrowUpDown,
} from "lucide-react";

export interface PropertySearchFilters {
  location: string;
  checkIn: string;
  checkOut: string;
  bedrooms: number | "";
  minRent: number | "";
  maxRent: number | "";
  sort: "newest" | "rent_low" | "rent_high" | "profit" | "";
}

interface PropertySearchBarProps {
  onSearch: (filters: PropertySearchFilters) => void;
  initialFilters?: Partial<PropertySearchFilters>;
  loading?: boolean;
}

const EMPTY: PropertySearchFilters = {
  location: "",
  checkIn: "",
  checkOut: "",
  bedrooms: "",
  minRent: "",
  maxRent: "",
  sort: "",
};

export const PropertySearchBar: React.FC<PropertySearchBarProps> = ({
  onSearch,
  initialFilters,
  loading = false,
}) => {
  const [filters, setFilters] = useState<PropertySearchFilters>({
    ...EMPTY,
    ...initialFilters,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasFilters = Object.entries(filters).some(
    ([, v]) => v !== "" && v !== null,
  );
  const dateError = Boolean(
    filters.checkIn && filters.checkOut && filters.checkOut < filters.checkIn,
  );

  const set =
    (key: keyof PropertySearchFilters) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateError) return;
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters(EMPTY);
    onSearch(EMPTY);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl shadow-black/40 overflow-hidden"
    >
      {/* ── Main row ── */}
      <div className="flex flex-col md:flex-row items-stretch gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
        {/* Location */}
        <label className="flex-1 flex items-center gap-2.5 px-4 py-3.5 focus-within:bg-white/5 transition-colors">
          <MapPin className="w-4 h-4 text-[#E04F33] shrink-0" />
          <div className="flex flex-col min-w-0 w-full">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">
              Location
            </span>
            <input
              type="text"
              value={filters.location}
              onChange={set("location")}
              placeholder="City or neighborhood"
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </label>

        {/* Check-in */}
        <label className="flex items-center gap-2.5 px-4 py-3.5 focus-within:bg-white/5 transition-colors">
          <CalendarDays className="w-4 h-4 text-[#E04F33] shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">
              Check-in
            </span>
            <input
              type="date"
              value={filters.checkIn}
              onChange={set("checkIn")}
              className="bg-transparent text-xs text-white focus:outline-none font-mono [color-scheme:dark]"
            />
          </div>
        </label>

        {/* Check-out */}
        <label className="flex items-center gap-2.5 px-4 py-3.5 focus-within:bg-white/5 transition-colors">
          <CalendarDays className="w-4 h-4 text-[#E04F33] shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">
              Check-out
            </span>
            <input
              type="date"
              value={filters.checkOut}
              min={filters.checkIn || undefined}
              onChange={set("checkOut")}
              className="bg-transparent text-xs text-white focus:outline-none font-mono [color-scheme:dark]"
            />
          </div>
        </label>

        {/* Bedrooms */}
        <label className="flex items-center gap-2.5 px-4 py-3.5 focus-within:bg-white/5 transition-colors">
          <BedDouble className="w-4 h-4 text-[#E04F33] shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">
              Beds
            </span>
            <select
              value={filters.bedrooms}
              onChange={set("bedrooms")}
              className="bg-transparent text-xs text-white focus:outline-none font-mono"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </div>
        </label>

        {/* Action buttons */}
        <div className="flex items-center gap-2 px-4 py-3.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowAdvanced((p) => !p)}
            className={`p-2 rounded-xl border transition-all ${
              showAdvanced
                ? "bg-[#E04F33]/20 border-[#E04F33]/50 text-[#FF8A73]"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
            title="Advanced filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={dateError || loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#E04F33] hover:bg-[#ED5B3F] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#E04F33]/25 border border-white/20 transition-colors"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            Search
          </button>
        </div>
      </div>

      {/* ── Advanced filters row ── */}
      {showAdvanced && (
        <div className="flex flex-wrap items-center gap-4 px-4 py-3.5 border-t border-white/10 bg-white/[0.02]">
          {/* Min rent */}
          <label className="flex items-center gap-2 min-w-[140px]">
            <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">
                Min Rent
              </span>
              <input
                type="number"
                value={filters.minRent}
                onChange={set("minRent")}
                placeholder="0"
                min={0}
                className="w-24 bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
              />
            </div>
          </label>

          <div className="w-px h-8 bg-white/10" />

          {/* Max rent */}
          <label className="flex items-center gap-2 min-w-[140px]">
            <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">
                Max Rent
              </span>
              <input
                type="number"
                value={filters.maxRent}
                onChange={set("maxRent")}
                placeholder="No limit"
                min={0}
                className="w-24 bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
              />
            </div>
          </label>

          <div className="w-px h-8 bg-white/10" />

          {/* Sort */}
          <label className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">
                Sort by
              </span>
              <select
                value={filters.sort}
                onChange={set("sort")}
                className="bg-transparent text-xs text-white focus:outline-none font-mono"
              >
                <option value="">Newest</option>
                <option value="rent_low">Price: Low → High</option>
                <option value="rent_high">Price: High → Low</option>
                <option value="profit">Best Profit</option>
              </select>
            </div>
          </label>

          {/* Active filter chips */}
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {filters.checkIn && filters.checkOut && (
              <span className="px-2.5 py-1 rounded-full bg-[#E04F33]/15 border border-[#E04F33]/30 text-[#FF8A73] text-[10px] font-mono">
                {filters.checkIn} → {filters.checkOut}
              </span>
            )}
            {filters.bedrooms && (
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-slate-300 text-[10px] font-mono">
                {filters.bedrooms}+ beds
              </span>
            )}
            {filters.minRent && (
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-slate-300 text-[10px] font-mono">
                From ${Number(filters.minRent).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {dateError && (
        <p className="px-4 pb-2 text-[10px] font-mono text-rose-400">
          Check-out must be after check-in
        </p>
      )}
    </form>
  );
};
