// pages/DiscoveryPage.tsx (or wherever your property listing lives)
import React from "react";
import { PropertySearchBar } from "../property/PropertySearchBar";
import { PropertySearchResults } from "../property/PropertyResults";
import { usePropertySearch } from "../../hooks/usePropertySearch"
import type { PropertySearchFilters } from "../property/PropertySearchBar";

export const DiscoveryPage: React.FC = () => {
  const { results, loading, error, searched, search, reset } = usePropertySearch();
  const [activeFilters, setActiveFilters] = React.useState<PropertySearchFilters | null>(null);

  const handleSearch = (filters: PropertySearchFilters) => {
    setActiveFilters(filters);
    search(filters);
  };

  return (
    <div className="min-h-screen bg-[#0F1014] text-slate-100">
      {/* Hero / Search section */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Find Your <span className="text-[#E04F33]">Luxury Property</span>
          </h1>
          <p className="text-slate-400 text-sm font-mono">
            Search available listings · Filter by dates, beds, and budget
          </p>
        </div>

        <PropertySearchBar
          onSearch={handleSearch}
          loading={loading}
        />
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <PropertySearchResults
          results={results}
          loading={loading}
          error={error}
          searched={searched}
          checkIn={activeFilters?.checkIn}
          checkOut={activeFilters?.checkOut}
          onSelect={(property) => {
            console.log("Selected:", property);
          }}
        />
      </div>
    </div>
  );
};
