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
import { useTheme } from "../../context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
      className={`w-full rounded-2xl border shadow-xl overflow-hidden transition-all duration-300 ${
        isDark
          ? "bg-slate-900/80 border-slate-800 shadow-slate-950/40"
          : "bg-white border-slate-200 shadow-slate-200/50"
      }`}
    >
      {/* Main Bar Row */}
      <div
        className={`flex flex-col md:flex-row items-stretch gap-0 divide-y md:divide-y-0 md:divide-x ${
          isDark ? "divide-slate-800" : "divide-slate-100"
        }`}
      >
        {/* Location */}
        <label
          className={`flex-1 flex items-center gap-2.5 px-4 py-3.5 transition-colors cursor-pointer ${
            isDark ? "focus-within:bg-slate-800/50" : "focus-within:bg-slate-50"
          }`}
        >
          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="flex flex-col min-w-0 w-full">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-bold">
              Location
            </span>
            <input
              type="text"
              value={filters.location}
              onChange={set("location")}
              placeholder="City or neighborhood"
              className={`w-full bg-transparent text-xs font-medium focus:outline-none ${
                isDark ? "text-white placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>
        </label>

        {/* Check-in */}
        <label
          className={`flex items-center gap-2.5 px-4 py-3.5 transition-colors cursor-pointer ${
            isDark ? "focus-within:bg-slate-800/50" : "focus-within:bg-slate-50"
          }`}
        >
          <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-bold">
              Check-in
            </span>
            <input
              type="date"
              value={filters.checkIn}
              onChange={set("checkIn")}
              className={`bg-transparent text-xs focus:outline-none font-mono ${
                isDark ? "text-white [color-scheme:dark]" : "text-slate-900"
              }`}
            />
          </div>
        </label>

        {/* Check-out */}
        <label
          className={`flex items-center gap-2.5 px-4 py-3.5 transition-colors cursor-pointer ${
            isDark ? "focus-within:bg-slate-800/50" : "focus-within:bg-slate-50"
          }`}
        >
          <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-bold">
              Check-out
            </span>
            <input
              type="date"
              value={filters.checkOut}
              min={filters.checkIn || undefined}
              onChange={set("checkOut")}
              className={`bg-transparent text-xs focus:outline-none font-mono ${
                isDark ? "text-white [color-scheme:dark]" : "text-slate-900"
              }`}
            />
          </div>
        </label>

        {/* Bedrooms */}
        <label
          className={`flex items-center gap-2.5 px-4 py-3.5 transition-colors cursor-pointer ${
            isDark ? "focus-within:bg-slate-800/50" : "focus-within:bg-slate-50"
          }`}
        >
          <BedDouble className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-bold">
              Beds
            </span>
            <select
              value={filters.bedrooms}
              onChange={set("bedrooms")}
              className={`bg-transparent text-xs focus:outline-none font-mono cursor-pointer ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              <option value="" className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                Any
              </option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option
                  key={n}
                  value={n}
                  className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}
                >
                  {n}+ beds
                </option>
              ))}
            </select>
          </div>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 px-4 py-3.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowAdvanced((p) => !p)}
            className={`p-2.5 rounded-xl border transition-all ${
              showAdvanced
                ? "bg-blue-600/15 border-blue-500/40 text-blue-600 dark:text-blue-400"
                : isDark
                ? "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
            title="Advanced filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDark
                  ? "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={dateError || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-widest shadow-md shadow-blue-600/25 transition-all"
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

      {/* Advanced Filters Drawer */}
      {showAdvanced && (
        <div
          className={`flex flex-wrap items-center gap-6 px-5 py-4 border-t transition-colors ${
            isDark
              ? "border-slate-800 bg-slate-950/40"
              : "border-slate-100 bg-slate-50/70"
          }`}
        >
          {/* Min rent */}
          <label className="flex items-center gap-2 min-w-[140px]">
            <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-bold">
                Min Rent
              </span>
              <input
                type="number"
                value={filters.minRent}
                onChange={set("minRent")}
                placeholder="0"
                min={0}
                className={`w-24 bg-transparent text-xs focus:outline-none font-mono ${
                  isDark ? "text-white placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>
          </label>

          <div className={`w-px h-8 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />

          {/* Max rent */}
          <label className="flex items-center gap-2 min-w-[140px]">
            <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-bold">
                Max Rent
              </span>
              <input
                type="number"
                value={filters.maxRent}
                onChange={set("maxRent")}
                placeholder="No limit"
                min={0}
                className={`w-24 bg-transparent text-xs focus:outline-none font-mono ${
                  isDark ? "text-white placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>
          </label>

          <div className={`w-px h-8 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />

          {/* Sort */}
          <label className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-bold">
                Sort by
              </span>
              <select
                value={filters.sort}
                onChange={set("sort")}
                className={`bg-transparent text-xs focus:outline-none font-mono cursor-pointer ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                <option value="" className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                  Newest
                </option>
                <option value="rent_low" className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                  Price: Low → High
                </option>
                <option value="rent_high" className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                  Price: High → Low
                </option>
                <option value="profit" className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                  Best Profit
                </option>
              </select>
            </div>
          </label>

          {/* Active Filter Chips */}
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {filters.checkIn && filters.checkOut && (
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-[10px] font-mono">
                {filters.checkIn} → {filters.checkOut}
              </span>
            )}
            {filters.bedrooms && (
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-[10px] font-mono">
                {filters.bedrooms}+ beds
              </span>
            )}
          </div>
        </div>
      )}

      {dateError && (
        <p className="px-4 pb-2 text-[10px] font-mono text-rose-500 font-medium">
          Check-out date must be after check-in date
        </p>
      )}
    </form>
  );
};
