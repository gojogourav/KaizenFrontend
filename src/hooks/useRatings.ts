import { useState, useEffect } from "react";
import { apiClient } from "../api/http";

export interface PropertyRating {
  propertyId: string | number;
  rating: number;
  review?: string;
  ratedAt: string;
}

const STORAGE_KEY = "kaizen_property_ratings";

function getStoredRatings(): Record<string | number, PropertyRating> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useRatings() {
  const [ratings, setRatings] = useState<Record<string | number, PropertyRating>>(getStoredRatings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
    } catch (e) {
      console.error("Failed to persist ratings:", e);
    }
  }, [ratings]);

  const submitRating = async (
    propertyId: string | number,
    rating: number,
    review?: string
  ): Promise<boolean> => {
    const newEntry: PropertyRating = {
      propertyId,
      rating,
      review,
      ratedAt: new Date().toISOString(),
    };

    setRatings((prev) => ({
      ...prev,
      [propertyId]: newEntry,
    }));

    try {
      await apiClient(`/api/properties/${propertyId}/rate/`, {
        method: "POST",
        body: JSON.stringify({ rating, review }),
      });
    } catch {
      // Graceful fallback to client persistence if endpoint returns non-200
    }

    return true;
  };

  const getRating = (propertyId: string | number): PropertyRating | undefined => {
    return ratings[propertyId];
  };

  return {
    ratings,
    submitRating,
    getRating,
  };
}
