/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight, MapPin, Calendar, Users } from 'lucide-react';

export interface GuestCount {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface SearchPayload {
  location: string;
  startDate: string | null;
  endDate: string | null;
  guests: GuestCount;
}

interface AirbnbSearchBarProps {
  where: string;
  setWhere: (val: string) => void;
  whenDisplay: string;
  setWhenDisplay: (val: string) => void;
  startDate: Date | null;
  setStartDate: (d: Date | null) => void;
  endDate: Date | null;
  setEndDate: (d: Date | null) => void;
  guestCount: GuestCount;
  setGuestCount: React.Dispatch<React.SetStateAction<GuestCount>>;
  onSearch: (payload?: SearchPayload) => void;
}

const POPULAR_DESTINATIONS = [
  { name: 'Scottsdale, AZ', label: 'Desert Oasis & Heated Pools', query: 'Scottsdale' },
  { name: 'Pensacola, FL', label: 'Emerald Coast Luxury Beachfront', query: 'Pensacola' },
  { name: 'Puri, Odisha', label: 'Coastal Beach & Temple Hub', query: 'Puri' },
  { name: 'Blue Ridge, GA', label: 'Alpine Mountain Retreats', query: 'Blue Ridge' },
];

export const AirbnbSearchBar: React.FC<AirbnbSearchBarProps> = ({
  where,
  setWhere,
  whenDisplay,
  setWhenDisplay,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  guestCount,
  setGuestCount,
  onSearch,
}) => {
  // Active Popover State: 'none' | 'where' | 'when' | 'who'
  const [activePopover, setActivePopover] = useState<'none' | 'where' | 'when' | 'who'>('none');
  const [dateTab, setDateTab] = useState<'dates' | 'flexible'>('dates');

  // Month navigation for date picker
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePopover('none');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Total Guests Count Calculation
  const totalGuests = guestCount.adults + guestCount.children;
  const getGuestLabel = () => {
    if (totalGuests === 0) return 'Add guests';
    let label = `${totalGuests} guest${totalGuests > 1 ? 's' : ''}`;
    if (guestCount.infants > 0) {
      label += `, ${guestCount.infants} infant${guestCount.infants > 1 ? 's' : ''}`;
    }
    if (guestCount.pets > 0) {
      label += `, ${guestCount.pets} pet${guestCount.pets > 1 ? 's' : ''}`;
    }
    return label;
  };

  // Clear Guests
  const handleClearGuests = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGuestCount({ adults: 0, children: 0, infants: 0, pets: 0 });
  };

  // Clear Location
  const handleClearLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWhere('');
    if (locationInputRef.current) {
      locationInputRef.current.focus();
    }
  };

  // Location Submit Auto-Advance
  const handleLocationSubmit = (selectedLocation?: string) => {
    const finalLoc = selectedLocation !== undefined ? selectedLocation : where;
    setWhere(finalLoc);
    setActivePopover('when');
  };

  // Calendar calculations
  const today = new Date();
  const getMonthData = (offsetMonth: number) => {
    const year = today.getFullYear();
    const month = today.getMonth() + offsetMonth;
    const date = new Date(year, month, 1);
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDayIndex = date.getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    return { monthName, firstDayIndex, daysInMonth, year: date.getFullYear(), month: date.getMonth() };
  };

  const month1 = getMonthData(currentMonthIndex);
  const month2 = getMonthData(currentMonthIndex + 1);

  // Date Selection Handler
  const handleDateClick = (year: number, month: number, day: number) => {
    const selected = new Date(year, month, day);
    if (!startDate || (startDate && endDate)) {
      setStartDate(selected);
      setEndDate(null);
      setWhenDisplay(`${selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ...`);
    } else if (startDate && !endDate) {
      if (selected < startDate) {
        setStartDate(selected);
        setEndDate(null);
        setWhenDisplay(`${selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ...`);
      } else {
        setEndDate(selected);
        const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        setWhenDisplay(`${startStr} – ${endStr}`);
        
        setTimeout(() => {
          setActivePopover('who');
        }, 150);
      }
    }
  };

  const isDateSelected = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    if (startDate && date.getTime() === startDate.getTime()) return 'start';
    if (endDate && date.getTime() === endDate.getTime()) return 'end';
    if (startDate && endDate && date > startDate && date < endDate) return 'range';
    return null;
  };

  const updateGuestCategory = (category: keyof GuestCount, delta: number) => {
    setGuestCount((prev) => {
      const current = prev[category];
      const updated = Math.max(0, current + delta);

      let newAdults = prev.adults;
      if (category !== 'adults' && updated > 0 && newAdults === 0) {
        newAdults = 1;
      }
      if (category === 'adults' && updated === 0 && (prev.children > 0 || prev.infants > 0)) {
        return prev;
      }

      return { ...prev, adults: newAdults, [category]: updated };
    });
  };

  const renderCalendarDays = (monthInfo: ReturnType<typeof getMonthData>) => {
    const days = [];
    for (let i = 0; i < monthInfo.firstDayIndex; i++) {
      days.push(<div key={`blank-${i}`} className="h-9 w-9" />);
    }
    for (let d = 1; d <= monthInfo.daysInMonth; d++) {
      const dateObj = new Date(monthInfo.year, monthInfo.month, d);
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const status = isDateSelected(monthInfo.year, monthInfo.month, d);

      let dayClasses = "h-9 w-9 flex items-center justify-center text-xs font-medium rounded-full transition-all cursor-pointer font-sans ";

      if (isPast) {
        dayClasses += "text-slate-600 cursor-not-allowed pointer-events-none line-through ";
      } else if (status === 'start' || status === 'end') {
        dayClasses += "bg-[#E04F33] text-white font-bold shadow-md scale-105 ";
      } else if (status === 'range') {
        dayClasses += "bg-[#E04F33]/25 text-[#FF9E8B] rounded-none font-medium ";
      } else {
        dayClasses += "hover:bg-white/10 text-slate-200 ";
      }

      days.push(
        <button
          key={`day-${d}`}
          disabled={isPast}
          onClick={() => handleDateClick(monthInfo.year, monthInfo.month, d)}
          className={dayClasses}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  // Trigger search payload
  const handleTriggerSearch = () => {
    setActivePopover('none');
    const payload: SearchPayload = {
      location: where,
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null,
      guests: guestCount
    };
    onSearch(payload);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto my-4 font-sans select-none z-30 px-1 sm:px-0">
      
      {/* DESKTOP ENHANCED APPLE VISION GLASS SEARCH BAR PILL */}
      <div 
        className={`hidden md:flex w-full bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 backdrop-blur-2xl transition-all duration-300 rounded-full shadow-xl shadow-slate-200/60 dark:shadow-2xl dark:shadow-black/40 border border-slate-200/80 dark:border-white/10 p-2 items-center justify-between relative apple-specular ${
          activePopover !== 'none' ? 'ring-1 ring-slate-300 dark:ring-white/20 bg-white/90 dark:bg-white/10 border-slate-300 dark:border-white/20' : ''
        }`}
      >

        {/* SECTION 1: LOCATION */}
        <div 
          onClick={() => setActivePopover('where')}
          className={`flex-1 px-7 py-3 rounded-full cursor-pointer transition-all duration-200 flex flex-col justify-center relative group ${
            activePopover === 'where' ? 'bg-slate-100 dark:bg-white/15 shadow-md border border-slate-200 dark:border-white/10' : 'hover:bg-slate-100/60 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-300 uppercase font-mono mb-0.5">
            LOCATION
          </span>
          <div className="flex items-center gap-2">
            <input 
              ref={locationInputRef}
              type="text" 
              placeholder="Search by city or landmark" 
              value={where}
              onChange={(e) => {
                setWhere(e.target.value);
                setActivePopover('where');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLocationSubmit();
                }
              }}
              onFocus={() => setActivePopover('where')}
              className="bg-transparent border-none outline-none text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal w-full font-sans cursor-text"
            />
            {where && (
              <button 
                type="button"
                onClick={handleClearLocation}
                className="text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* SUBTLE GLASS DIVIDER */}
        <div className={`h-8 border-r border-slate-200 dark:border-white/10 transition-opacity ${activePopover === 'where' || activePopover === 'when' ? 'opacity-0' : 'opacity-100'}`} />

        {/* SECTION 2: DATES */}
        <div 
          onClick={() => setActivePopover('when')}
          className={`flex-1 px-7 py-3 rounded-full cursor-pointer transition-all duration-200 flex flex-col justify-center relative group ${
            activePopover === 'when' ? 'bg-slate-100 dark:bg-white/15 shadow-md border border-slate-200 dark:border-white/10' : 'hover:bg-slate-100/60 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-300 uppercase font-mono mb-0.5">
            DATES
          </span>
          <span className={`text-sm font-sans truncate ${whenDisplay ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400'}`}>
            {whenDisplay || 'Check-in – Check-out'}
          </span>
        </div>

        {/* SUBTLE GLASS DIVIDER */}
        <div className={`h-8 border-r border-slate-200 dark:border-white/10 transition-opacity ${activePopover === 'when' || activePopover === 'who' ? 'opacity-0' : 'opacity-100'}`} />

        {/* SECTION 3: GUESTS */}
        <div 
          onClick={() => setActivePopover('who')}
          className={`flex-1 px-7 py-3 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-between relative group ${
            activePopover === 'who' ? 'bg-slate-100 dark:bg-white/15 shadow-md border border-slate-200 dark:border-white/10' : 'hover:bg-slate-100/60 dark:hover:bg-white/5'
          }`}
        >
          <div className="flex flex-col justify-center min-w-0 pr-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-300 uppercase font-mono mb-0.5">
              GUESTS
            </span>
            <span className={`text-sm font-sans truncate ${totalGuests > 0 ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400'}`}>
              {getGuestLabel()}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {totalGuests > 0 && (
              <button 
                type="button"
                onClick={handleClearGuests}
                className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors text-xs cursor-pointer"
                title="Reset guests"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* ACTION SEARCH BUTTON IN STRATEGIC KAIZEN CAPITAL BURNT ORANGE */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerSearch();
              }}
              className="bg-[#E04F33] hover:bg-[#ED5B3F] active:bg-[#C73E24] text-white font-bold rounded-full px-5 py-2.5 flex items-center gap-2 shadow-lg shadow-[#E04F33]/25 border border-white/20 transition-all duration-200 shrink-0 font-heading cursor-pointer ml-1 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span className="text-xs font-bold tracking-wider uppercase">Search</span>
            </button>
          </div>
        </div>

      </div>

      {/* MOBILE GLASS SEARCH BAR */}
      <div 
        className={`flex md:hidden flex-col gap-2 p-3 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl w-full max-w-full overflow-hidden relative ${
          activePopover !== 'none' ? 'ring-1 ring-white/20' : ''
        }`}
      >
        {/* ROW 1: LOCATION */}
        <div 
          onClick={() => setActivePopover('where')}
          className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between ${
            activePopover === 'where' ? 'bg-white/15 border-white/20' : 'bg-white/5 border-white/10'
          }`}
        >
          <div className="flex flex-col flex-1 min-w-0 pr-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase font-mono">
              LOCATION
            </span>
            <input 
              type="text" 
              placeholder="Search location..." 
              value={where}
              onChange={(e) => {
                setWhere(e.target.value);
                setActivePopover('where');
              }}
              onFocus={() => setActivePopover('where')}
              className="bg-transparent border-none outline-none text-xs font-semibold text-white placeholder:text-slate-400 w-full font-sans cursor-text"
            />
          </div>
          {where ? (
            <button 
              type="button"
              onClick={handleClearLocation}
              className="text-slate-300 p-1 hover:text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <MapPin className="w-4 h-4 text-[#E04F33] shrink-0" />
          )}
        </div>

        {/* ROW 2: DATE & GUESTS */}
        <div className="grid grid-cols-2 gap-2">
          <div 
            onClick={() => setActivePopover('when')}
            className={`p-2.5 rounded-xl cursor-pointer transition-all border flex flex-col justify-center ${
              activePopover === 'when' ? 'bg-white/15 border-white/20' : 'bg-white/5 border-white/10'
            }`}
          >
            <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase font-mono">
              DATES
            </span>
            <span className={`text-xs font-sans truncate ${whenDisplay ? 'text-white font-semibold' : 'text-slate-400'}`}>
              {whenDisplay || 'Check-in'}
            </span>
          </div>

          <div 
            onClick={() => setActivePopover('who')}
            className={`p-2.5 rounded-xl cursor-pointer transition-all border flex flex-col justify-center ${
              activePopover === 'who' ? 'bg-white/15 border-white/20' : 'bg-white/5 border-white/10'
            }`}
          >
            <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase font-mono">
              GUESTS
            </span>
            <span className={`text-xs font-sans truncate ${totalGuests > 0 ? 'text-white font-semibold' : 'text-slate-400'}`}>
              {getGuestLabel()}
            </span>
          </div>
        </div>

        {/* ROW 3: SEARCH BUTTON */}
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleTriggerSearch();
          }}
          className="w-full bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 shadow-lg shadow-[#E04F33]/25 border border-white/20 transition-all font-heading cursor-pointer mt-1"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
          <span className="text-xs font-bold uppercase tracking-wider">Search Properties</span>
        </button>
      </div>

      {/* POPOVER 1: LOCATION SUGGESTIONS */}
      {activePopover === 'where' && (
        <div className="absolute top-full left-0 right-0 md:right-auto mt-3 w-full md:w-80 bg-[#0F1014]/95 rounded-2xl shadow-2xl shadow-black/60 border border-white/15 p-4 text-white z-50 backdrop-blur-2xl apple-specular">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-3 font-mono">
            Popular Destinations
          </p>
          <div className="space-y-1">
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                type="button"
                onClick={() => handleLocationSubmit(dest.query)}
                className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 text-[#E04F33] flex items-center justify-center group-hover:bg-[#E04F33] group-hover:text-white transition-colors border border-white/10 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white font-sans">{dest.name}</p>
                  <p className="text-[10px] text-slate-300 font-sans">{dest.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* POPOVER 2: DATE CALENDAR PICKER */}
      {activePopover === 'when' && (
        <div className="absolute top-full left-0 right-0 md:left-1/2 md:-translate-x-1/2 mt-3 w-full max-w-full md:max-w-2xl bg-[#0F1014]/95 rounded-2xl shadow-2xl shadow-black/60 border border-white/15 p-5 sm:p-6 text-white z-50 backdrop-blur-2xl apple-specular">
          
          <div className="flex justify-center mb-4">
            <div className="bg-white/5 p-1 rounded-full border border-white/10 inline-flex gap-1 text-xs font-bold">
              <button 
                type="button"
                onClick={() => setDateTab('dates')}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer text-xs ${
                  dateTab === 'dates' ? 'bg-white/20 text-white shadow-sm border border-white/15' : 'text-slate-300 hover:text-white'
                }`}
              >
                Specific Dates
              </button>
              <button 
                type="button"
                onClick={() => setDateTab('flexible')}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer text-xs ${
                  dateTab === 'flexible' ? 'bg-white/20 text-white shadow-sm border border-white/15' : 'text-slate-300 hover:text-white'
                }`}
              >
                Flexible Presets
              </button>
            </div>
          </div>

          {dateTab === 'flexible' ? (
            <div className="space-y-4">
              <p className="text-center font-bold text-xs text-slate-200">Choose staying duration</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Any weekend', desc: 'Fri – Sun' },
                  { label: 'Any week', desc: '7 days' },
                  { label: 'Full month', desc: '30 days' },
                  { label: 'Anytime', desc: 'Flexible' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setWhenDisplay(item.label);
                      setStartDate(null);
                      setEndDate(null);
                      setActivePopover('who');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      whenDisplay === item.label
                        ? 'border-[#E04F33] bg-[#E04F33]/20 text-[#FF9E8B] font-bold'
                        : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-200'
                    }`}
                  >
                    <p className="text-xs font-bold font-sans">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <button 
                  type="button"
                  disabled={currentMonthIndex <= 0}
                  onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-20 text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-8 font-bold text-xs text-white">
                  <span>{month1.monthName}</span>
                  <span className="hidden sm:inline">{month2.monthName}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setCurrentMonthIndex((prev) => prev + 1)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 justify-items-center">
                    {renderCalendarDays(month1)}
                  </div>
                </div>

                <div className="hidden sm:block">
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 justify-items-center">
                    {renderCalendarDays(month2)}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <button 
                  type="button"
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setWhenDisplay('');
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-white underline transition-colors cursor-pointer"
                >
                  Clear dates
                </button>
                <button 
                  type="button"
                  onClick={() => setActivePopover('who')}
                  className="px-4 py-2 bg-[#E04F33] hover:bg-[#ED5B3F] text-white text-xs font-bold rounded-full shadow-md cursor-pointer font-heading"
                >
                  Next: Guests →
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* POPOVER 3: GUESTS COUNTER DROPDOWN */}
      {activePopover === 'who' && (
        <div className="absolute top-full right-0 left-0 md:left-auto mt-3 w-full md:w-80 bg-[#141A26]/95 rounded-2xl shadow-apple-glass border border-white/10 p-5 text-white z-50 backdrop-blur-2xl apple-specular">
          <div className="space-y-4">
            
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white font-sans">Adults</p>
                <p className="text-[10px] text-slate-400 font-sans">Ages 13 or above</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  disabled={guestCount.adults <= 0 || (guestCount.adults <= 1 && (guestCount.children > 0 || guestCount.infants > 0))}
                  onClick={() => updateGuestCategory('adults', -1)}
                  className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-slate-300 hover:border-white/40 hover:text-white disabled:opacity-20 font-bold text-xs transition-colors cursor-pointer"
                >
                  –
                </button>
                <span className="w-4 text-center font-bold text-xs text-white">{guestCount.adults}</span>
                <button 
                  type="button"
                  onClick={() => updateGuestCategory('adults', 1)}
                  className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-slate-300 hover:border-white/40 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div>
                <p className="text-xs font-bold text-white font-sans">Children</p>
                <p className="text-[10px] text-slate-400 font-sans">Ages 2–12</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  disabled={guestCount.children <= 0}
                  onClick={() => updateGuestCategory('children', -1)}
                  className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-slate-300 hover:border-white/40 hover:text-white disabled:opacity-20 font-bold text-xs transition-colors cursor-pointer"
                >
                  –
                </button>
                <span className="w-4 text-center font-bold text-xs text-white">{guestCount.children}</span>
                <button 
                  type="button"
                  onClick={() => updateGuestCategory('children', 1)}
                  className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-slate-300 hover:border-white/40 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div>
                <p className="text-xs font-bold text-white font-sans">Infants</p>
                <p className="text-[10px] text-slate-400 font-sans">Under 2</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  disabled={guestCount.infants <= 0}
                  onClick={() => updateGuestCategory('infants', -1)}
                  className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-slate-300 hover:border-white/40 hover:text-white disabled:opacity-20 font-bold text-xs transition-colors cursor-pointer"
                >
                  –
                </button>
                <span className="w-4 text-center font-bold text-xs text-white">{guestCount.infants}</span>
                <button 
                  type="button"
                  onClick={() => updateGuestCategory('infants', 1)}
                  className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-slate-300 hover:border-white/40 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Pets */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div>
                <p className="text-xs font-bold text-white font-sans">Pets</p>
                <p className="text-[10px] text-slate-400 font-sans">Service animals welcome</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  disabled={guestCount.pets <= 0}
                  onClick={() => updateGuestCategory('pets', -1)}
                  className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-slate-300 hover:border-white/40 hover:text-white disabled:opacity-20 font-bold text-xs transition-colors cursor-pointer"
                >
                  –
                </button>
                <span className="w-4 text-center font-bold text-xs text-white">{guestCount.pets}</span>
                <button 
                  type="button"
                  onClick={() => updateGuestCategory('pets', 1)}
                  className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-slate-300 hover:border-white/40 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
            <button 
              type="button"
              onClick={() => setGuestCount({ adults: 0, children: 0, infants: 0, pets: 0 })}
              className="text-xs font-bold text-slate-400 hover:text-white underline transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button 
              type="button"
              onClick={() => handleTriggerSearch()}
              className="px-5 py-2 bg-[#E04F33] hover:bg-[#ED5B3F] text-white text-xs font-bold rounded-full shadow-md cursor-pointer font-heading"
            >
              Search Properties
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
