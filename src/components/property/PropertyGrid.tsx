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

// Same mapping used in AdminPropertyManager — keep both in sync
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
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const PropertyGridContent: React.FC<PropertyGridProps> = ({
  filters,
  onOpenProspectus,
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
        className="text-sm text-rose-300 text-center py-12"
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
      : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    price: prop.rent_monthly ? Number(prop.rent_monthly) : prop.price,
    bedsBaths: `${prop.bedrooms || 0} bed, ${Number(prop.bathrooms || 0)} bath`,
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
      >
        {properties.map((property) => (
          <motion.div role="listitem" key={property.id} variants={itemVariants}>
            <PropertyCard
              deal={property}
              isFavorite={isFavorite(property.id)}
              onToggleFavorite={(id, e) => {
                if (e) e.stopPropagation();
                toggleFavorite(id, property);
              }}
              onOpenProspectus={onOpenProspectus}
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
