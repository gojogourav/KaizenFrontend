import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building } from "lucide-react";
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

const PropertyGridContent: React.FC<PropertyGridProps> = ({
  filters,
  onOpenProspectus,
  onRateDeal,
}) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const { data, loading, error } = useAsync<any>(
    (signal) => api.getProperties(filters, { signal }),
    [JSON.stringify(filters)],
  );

  if (loading) {
    return <SkeletonGrid label="Loading properties" itemHeightClass="h-80" items={6} />;
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

  const rawProperties = Array.isArray(data) ? data : (data?.results || []);
  const properties = rawProperties.map((prop: any) => ({
    ...prop,
    images: prop.media?.length > 0
      ? prop.media.map((m: any) => m.cdn_url)
      : prop.images?.length > 0
        ? prop.images
        : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    price: prop.rent_monthly ? Number(prop.rent_monthly) : prop.price,
    bedsBaths: prop.bedsBaths || `${prop.bedrooms || 0} bed, ${Number(prop.bathrooms || 0)} bath`,
    status: API_TO_STATUS[(prop.status ?? "active").toLowerCase()] ?? "AVAILABLE",
  }));

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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={JSON.stringify(filters)}
        role="list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full min-w-0"
      >
        {properties.map((property: any, idx: number) => (
          <motion.div
            role="listitem"
            key={property.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.12) }}
            className="min-w-0"
          >
            <PropertyCard
              deal={property}
              isFavorite={isFavorite(property.id)}
              onToggleFavorite={(id, e) => {
                if (e) e.stopPropagation();
                toggleFavorite(id, property);
              }}
              onOpenProspectus={onOpenProspectus}
              onRate={onRateDeal ? (deal) => onRateDeal(deal) : undefined}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export const PropertyGrid: React.FC<PropertyGridProps> = (props) => (
  <ErrorBoundary fallbackTitle="Couldn't load properties">
    <PropertyGridContent {...props} />
  </ErrorBoundary>
);
