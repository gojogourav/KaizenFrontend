import React from "react";
import { Building } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { SkeletonGrid } from "../common/Skeleton";
import { EmptyState } from "../common/EmptyState";
import { ErrorBoundary } from "../common/ErrorBoundary";
import { PropertyCard } from "./PropertyCard";
import type { Property } from "../../types/database";
import type { PropertyFilters } from "../../api/services";

interface PropertyGridProps {
  filters?: PropertyFilters;
  onOpenProspectus: (property: Property) => void;
}

const PropertyGridContent: React.FC<PropertyGridProps> = ({
  filters,
  onOpenProspectus,
}) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const { data, loading, error } = useAsync<Property[]>(
    () => api.getProperties(filters),
    [JSON.stringify(filters)],
  );

  if (loading)
    return (
      <SkeletonGrid
        label="Loading properties"
        itemHeightClass="h-80"
        items={6}
      />
    );
  if (error)
    return (
      <p role="alert" className="text-sm text-rose-300 text-center py-12">
        {error}
      </p>
    );

  const properties = Array.isArray(data) ? data : (data as any)?.results || [];
  if (properties.length === 0) {
    return (
      <EmptyState
        icon={Building}
        title="No properties found"
        description="Try adjusting your search or filters."
      />
    );
  }

  return (
    <div
      role="list"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
    >
      {properties.map((property) => (
        <div role="listitem" key={property.id}>
          <PropertyCard
            deal={property}
            isFavorite={isFavorite(property.id)}
            onToggleFavorite={(id) => toggleFavorite(id)}
            onOpenProspectus={onOpenProspectus}
          />
        </div>
      ))}
    </div>
  );
};

export const PropertyGrid: React.FC<PropertyGridProps> = (props) => (
  <ErrorBoundary fallbackTitle="Couldn't load properties">
    <PropertyGridContent {...props} />
  </ErrorBoundary>
);
