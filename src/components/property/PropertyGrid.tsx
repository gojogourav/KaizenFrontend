import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building, ChevronDown } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { SkeletonGrid } from "../common/Skeleton";
import { EmptyState } from "../common/EmptyState";
import { ErrorBoundary } from "../common/ErrorBoundary";
import { PropertyCard } from "./PropertyCard";
import type { PropertyFilters } from "../../api/services";

const API_TO_STATUS: Record<string, string> = {
  active: "AVAILABLE",
  available: "AVAILABLE",
  locked: "OCCUPIED",
  occupied: "OCCUPIED",
  sold: "UNDER CONTRACT",
  "under contract": "UNDER CONTRACT",
  draft: "MAINTENANCE",
  maintenance: "MAINTENANCE",
  "under review": "UNDER REVIEW",
};

interface PropertyGridProps {
  filters?: PropertyFilters;
  onOpenProspectus: (property: any) => void;
  onRateDeal?: (property: any) => void;
}

const INITIAL_BATCH_SIZE = 8;
const BATCH_STEP = 6;

const PropertyGridContent: React.FC<PropertyGridProps> = ({
  filters,
  onOpenProspectus,
  onRateDeal,
}) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_BATCH_SIZE);

  const filterKey = useMemo(() => JSON.stringify(filters || {}), [filters]);

  const { data, loading, error } = useAsync<any>(
    (signal) => api.getProperties(filters, { signal }),
    [filterKey],
  );

  const handleToggleFavorite = useCallback(
    (id: string | number, property: any) => {
      toggleFavorite(id, property);
    },
    [toggleFavorite],
  );

  const properties = useMemo(() => {
    const rawProperties = Array.isArray(data) ? data : (data?.results || []);
    return rawProperties.map((prop: any) => ({
      ...prop,
      images: prop.media?.length > 0
        ? prop.media.map((m: any) => m.cdn_url)
        : prop.images?.length > 0
          ? prop.images
          : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=70'],
      price: prop.rent_monthly ? Number(prop.rent_monthly) : prop.price,
      bedsBaths: prop.bedsBaths || `${prop.bedrooms || 0} bed, ${Number(prop.bathrooms || 0)} bath`,
      status: API_TO_STATUS[(prop.status ?? "active").toLowerCase()] ?? "AVAILABLE",
    }));
  }, [data]);

  const visibleProperties = useMemo(() => {
    return properties.slice(0, visibleLimit);
  }, [properties, visibleLimit]);

  if (loading) {
    return <SkeletonGrid label="Loading luxury properties" itemHeightClass="h-80" items={6} />;
  }

  if (error) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        role="alert"
        className="text-sm text-rose-500 text-center py-12 font-medium"
      >
        {error}
      </motion.p>
    );
  }

  if (properties.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <EmptyState
          icon={Building}
          title="No properties found"
          description="Try adjusting your search or filters."
        />
      </motion.div>
    );
  }

  const hasMore = visibleLimit < properties.length;

  return (
    <div className="space-y-8 w-full min-w-0">
      <div
        role="list"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full min-w-0"
      >
        {visibleProperties.map((property: any) => (
          <div role="listitem" key={property.id} className="min-w-0">
            <PropertyCard
              deal={property}
              isFavorite={isFavorite(property.id)}
              onToggleFavorite={(id, e) => {
                if (e) e.stopPropagation();
                handleToggleFavorite(id, property);
              }}
              onOpenProspectus={onOpenProspectus}
              onRate={onRateDeal ? (deal) => onRateDeal(deal) : undefined}
            />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex flex-col items-center justify-center pt-4 pb-2">
          <button
            type="button"
            onClick={() => setVisibleLimit((prev) => prev + BATCH_STEP)}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <span>Load More Properties ({properties.length - visibleLimit} remaining)</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      )}
    </div>
  );
};

export const PropertyGrid: React.FC<PropertyGridProps> = (props) => (
  <ErrorBoundary fallbackTitle="Couldn't load properties">
    <PropertyGridContent {...props} />
  </ErrorBoundary>
);
