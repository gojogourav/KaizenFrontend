import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SkeletonGrid } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { PropertyCard } from '../property/PropertyCard';
import type { Property } from '../../types/database';
import { useTheme } from '../../context/ThemeContext';

interface FavoritesViewProps {
  onSelectDeal: (property: Property) => void;
  onRateDeal?: (property: Property) => void;
}

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

function toCardDeal(prop: any) {
  return {
    ...prop,
    images: prop.images?.length
      ? prop.images
      : prop.media?.length > 0
        ? prop.media.map((m: any) => m.cdn_url)
        : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    price: prop.price ?? (prop.rent_monthly ? Number(prop.rent_monthly) : prop.adr),
    bedsBaths: prop.bedsBaths || `${prop.bedrooms || 0} bed, ${Number(prop.bathrooms || 0)} bath`,
    status: API_TO_STATUS[(prop.status ?? "active").toLowerCase()] ?? "AVAILABLE",
  };
}

const FavoritesContent: React.FC<FavoritesViewProps> = ({ onSelectDeal, onRateDeal }) => {
  const { favorites, favoritesLoading, toggleFavorite } = useAuth();

  if (favoritesLoading) {
    return <SkeletonGrid label="Loading your favorites" itemHeightClass="h-80" items={6} />;
  }

  if (favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <EmptyState
          icon={Heart}
          title="No saved favorites yet"
          description="Click the heart icon on any property card in the catalog grid to bookmark it here."
        />
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 p-2">
      <AnimatePresence mode="popLayout">
        {favorites.map((favorite) => {
          const prop = toCardDeal(favorite.property);
          return (
            <motion.div
              role="listitem"
              key={favorite.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <PropertyCard
                deal={prop}
                isFavorite
                onToggleFavorite={(id, e) => {
                  if (e) e.stopPropagation();
                  toggleFavorite(id, favorite.property);
                }}
                onOpenProspectus={() => onSelectDeal(favorite.property)}
                onRate={onRateDeal ? () => onRateDeal(favorite.property) : undefined}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onSelectDeal, onRateDeal }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between px-2"
      >
        <div>
          <h2 className={`text-2xl font-bold font-heading flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            <motion.span
              initial={{ scale: 0.6, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
            >
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" aria-hidden="true" />
            </motion.span>
            Saved <span className="text-blue-600 dark:text-blue-400">Favorites</span>
          </h2>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono font-semibold">
            Your shortlisted arbitrage deals & luxury villas saved for review
          </p>
        </div>
      </motion.div>
      <ErrorBoundary fallbackTitle="Couldn't load your favorites">
        <FavoritesContent onSelectDeal={onSelectDeal} onRateDeal={onRateDeal} />
      </ErrorBoundary>
    </div>
  );
};
