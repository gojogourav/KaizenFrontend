import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SkeletonGrid } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { FavoriteCard } from './FavoriteCard';
import type { Property } from '../../types/database';

interface FavoritesViewProps {
  onSelectDeal: (property: Property) => void;
}

const FavoritesContent: React.FC<FavoritesViewProps> = ({ onSelectDeal }) => {
  const { favorites, favoritesLoading, toggleFavorite } = useAuth();

  if (favoritesLoading) return <SkeletonGrid label="Loading your favorites" itemHeightClass="h-64" />;

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No saved favorites yet"
        description="Click the heart icon on any villa property card in the search grid to bookmark it here for quick access."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {favorites.map((favorite) => (
        <FavoriteCard
          key={favorite.id}
          favorite={favorite}
          onSelect={onSelectDeal}
          onRemove={(propertyId) => toggleFavorite(propertyId)}
        />
      ))}
    </div>
  );
};

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onSelectDeal }) => (
  <div className="max-w-6xl mx-auto p-6 space-y-6 text-slate-900 dark:text-slate-100">
    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-7 h-7 text-rose-500 fill-rose-500" aria-hidden="true" />
          Saved <span className="text-[#E04F33]">Favorites</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Your shortlisted arbitrage deals & luxury villas saved for review.
        </p>
      </div>
    </div>
    <ErrorBoundary fallbackTitle="Couldn't load your favorites">
      <FavoritesContent onSelectDeal={onSelectDeal} />
    </ErrorBoundary>
  </div>
);
