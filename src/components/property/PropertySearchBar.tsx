import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, CalendarDays, Search, X, SlidersHorizontal } from 'lucide-react';

export interface PropertySearchFilters {
  location: string;
  checkIn: string; // ISO date string, e.g. "2026-09-01"
  checkOut: string; // ISO date string
}

interface PropertySearchBarProps {
  onSearch: (filters: PropertySearchFilters) => void;
  initialFilters?: Partial<PropertySearchFilters>;
}

const EMPTY: PropertySearchFilters = { location: '', checkIn: '', checkOut: '' };

export const PropertySearchBar: React.FC<PropertySearchBarProps> = ({
  onSearch,
  initialFilters,
}) => {
  const [location, setLocation] = useState(initialFilters?.location ?? '');
  const [checkIn, setCheckIn] = useState(initialFilters?.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(initialFilters?.checkOut ?? '');

  const hasFilters = Boolean(location || checkIn || checkOut);
  const dateError = Boolean(checkIn && checkOut && checkOut < checkIn);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateError) return;
    onSearch({ location: location.trim(), checkIn, checkOut });
  };

  const handleClear = () => {
    setLocation(EMPTY.location);
    setCheckIn(EMPTY.checkIn);
    setCheckOut(EMPTY.checkOut);
    onSearch(EMPTY);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mx-6 relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl shadow-black/40 p-3 flex flex-col md:flex-row items-stretch gap-2 apple-specular"
    >
      {/* Ambient accent glow, purely decorative */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-[#E04F33]/0 via-[#E04F33]/5 to-[#E04F33]/0 opacity-0 group-focus-within:opacity-100" />

      <div className="flex items-center gap-2 md:hidden px-1 pb-1">
        <SlidersHorizontal className="w-3.5 h-3.5 text-[#E04F33]" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
          Find a property
        </span>
      </div>

      {/* Location */}
      <label className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus-within:border-[#E04F33]/50 focus-within:bg-white/10 transition-colors duration-200">
        <MapPin className="w-4 h-4 text-[#E04F33] shrink-0" />
        <div className="flex flex-col min-w-0 w-full">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">
            Location
          </span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or neighborhood"
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none font-sans"
          />
        </div>
      </label>

      <div className="hidden md:block w-px bg-white/10 my-1.5" />

      {/* Check-in */}
      <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus-within:border-[#E04F33]/50 focus-within:bg-white/10 transition-colors duration-200">
        <CalendarDays className="w-4 h-4 text-[#E04F33] shrink-0" />
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">
            Check-in
          </span>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none font-mono [color-scheme:dark]"
          />
        </div>
      </label>

      {/* Check-out */}
      <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus-within:border-[#E04F33]/50 focus-within:bg-white/10 transition-colors duration-200">
        <CalendarDays className="w-4 h-4 text-[#E04F33] shrink-0" />
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">
            Check-out
          </span>
          <input
            type="date"
            value={checkOut}
            min={checkIn || undefined}
            onChange={(e) => setCheckOut(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none font-mono [color-scheme:dark]"
          />
        </div>
      </label>

      <div className="flex items-center gap-2 shrink-0">
        <AnimatePresence>
          {hasFilters && (
            <motion.button
              key="clear"
              type="button"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto' }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white transition-colors overflow-hidden cursor-pointer"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={dateError}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#E04F33] hover:bg-[#ED5B3F] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#E04F33]/25 border border-white/20 transition-colors cursor-pointer font-sans"
        >
          <Search className="w-3.5 h-3.5" />
          Search
        </motion.button>
      </div>

      {dateError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-6 left-4 text-[10px] font-mono text-rose-400"
        >
          Check-out must be after check-in
        </motion.p>
      )}
    </motion.form>
  );
};
