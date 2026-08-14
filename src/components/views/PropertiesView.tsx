import React, { useState } from "react";
import { motion } from "motion/react";
import { PropertyGrid } from "../property/PropertyGrid";
import { PropertySearchBar, PropertySearchFilters } from "../property/PropertySearchBar";
import type { Property } from "../../types/database";
import type { PropertyFilters } from "../../api/services";

interface PropertiesViewProps {
  onOpenProspectus: (property: Property) => void;
  triggerNotification: (message: string, type?: "success" | "info" | "error") => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({ onOpenProspectus }) => {
  const [filters, setFilters] = useState<PropertyFilters>({});

  const handleSearch = (search: PropertySearchFilters) => {
    setFilters((prev) => ({
      ...prev,
      location: search.location || undefined,
      checkIn: search.checkIn || undefined,
      checkOut: search.checkOut || undefined,
    } as PropertyFilters));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between px-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Featured Properties</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Curated luxury rentals, verified and ready to book
          </p>
        </div>
      </motion.div>

      <PropertySearchBar onSearch={handleSearch} />

      <PropertyGrid filters={filters} onOpenProspectus={onOpenProspectus} />
    </div>
  );
};
