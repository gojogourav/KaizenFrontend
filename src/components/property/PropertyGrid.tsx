import React from "react";
import { Building } from "lucide-react";
import { api } from "../../api/client"; // Adjust path to where your API wrapper is exported
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { SkeletonGrid } from "../common/Skeleton";
import { EmptyState } from "../common/EmptyState";
import { ErrorBoundary } from "../common/ErrorBoundary";
import { PropertyCard } from "./PropertyCard";
import type { PropertyFilters } from "../../api/services";

interface PropertyGridProps {
  filters?: PropertyFilters;
  onOpenProspectus: (property: any) => void;
}

const PropertyGridContent: React.FC<PropertyGridProps> = ({
  filters,
  onOpenProspectus,
}) => {
  const { isFavorite, toggleFavorite } = useAuth();

  // 1. Fetch data (can be an array OR a Django paginated object { results: [] })
  const { data, loading, error } = useAsync<any>(
    (signal) => api.getProperties(filters, { signal }),
    [JSON.stringify(filters)],
  );

  if (loading) {
    return <SkeletonGrid label="Loading properties" itemHeightClass="h-80" items={6} />;
  }

  if (error) {
    return <p role="alert" className="text-sm text-rose-300 text-center py-12">{error}</p>;
  }

  // 2. UNWRAP DRF PAGINATION
  // Safely extract the array whether Django paginates it or not
  const rawProperties = Array.isArray(data) ? data : (data?.results || []);

  // 3. MAP DJANGO FIELDS TO FRONTEND EXPECTATIONS
  const properties = rawProperties.map((prop: any) => ({
    ...prop,
    // Map Django 'media' relation to flat 'images' string array
    images: prop.media?.length > 0
      ? prop.media.map((m: any) => m.cdn_url)
      : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],

    // Map Django 'rent_monthly' to 'price'
    price: prop.rent_monthly ? Number(prop.rent_monthly) : prop.price,

    // Format bedrooms/bathrooms into the single string 'PropertyCard' expects
    bedsBaths: `${prop.bedrooms || 0} bed, ${Number(prop.bathrooms || 0)} bath`,

    // Guarantee uppercase status for the UI badges
    status: prop.status ? prop.status.toUpperCase() : 'AVAILABLE'
  }));

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
            onToggleFavorite={(id, e) => {
              if (e) e.stopPropagation();
              toggleFavorite(id);
            }}
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
