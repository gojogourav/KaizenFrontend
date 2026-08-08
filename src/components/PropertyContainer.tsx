import React, { useEffect, useState } from 'react';
import { api } from '../lib/api/client';
import { useAuth } from '../context/AuthContext'; // Adjust path to your auth provider
import { PropertyCard } from './PropertyCard';
import type { Property } from '../types/database';

export const PropertyGrid: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { isFavorite, toggleFavorite } = useAuth();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await api.getProperties();
        setProperties(data);
      } catch (err) {
        setError('Failed to load properties. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleToggleFavorite = async (id: string | number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    try {
      await toggleFavorite(id);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleOpenProspectus = (deal: any) => {
    console.log("Opening property details for:", deal.id);
  };

  if (isLoading) return <div className="p-8 text-center">Loading properties...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {properties.map((prop) => {
        const dealData = {
          ...prop,
          imageUrl: prop.images?.[0] || 'https://placehold.co/600x400?text=No+Image',
          adr: prop.price,
          location: `${prop.city}, ${prop.state}`,

          bedsBaths: (prop as any).bedsBaths || "2 Bed • 2 Bath",
          squareFeet: (prop as any).squareFeet || "1,200",
          furnished: (prop as any).furnished || "Yes",
        };

        return (
          <PropertyCard
            key={prop.id}
            deal={dealData}
            isFavorite={isFavorite(prop.id)}
            onToggleFavorite={handleToggleFavorite}
            onOpenProspectus={handleOpenProspectus}
          />
        );
      })}
    </div>
  );
};
