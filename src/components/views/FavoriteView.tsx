import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SkeletonGrid } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { PropertyCard } from '../property/PropertyCard';
import type { Property } from '../../types/database';

interface FavoritesViewProps {
  onSelectDeal: (property: Property) => void;
}

// Same mapping used in PropertyGrid — keep both in sync.
// favorite.property comes back in the raw API shape (media/rent_monthly/etc.),
// but PropertyCard expects the transformed shape (images/price/bedsBaths/status).
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

// Same stagger rhythm as PropertyGrid, so favorites feel like the same system
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
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.2 } },
};

const FavoritesContent: React.FC<FavoritesViewProps> = ({ onSelectDeal }) => {
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
          description="Click the heart icon on any villa property card in the search grid to bookmark it here for quick access."
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      role="list"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
    >
      <AnimatePresence mode="popLayout">
        {favorites.map((favorite) => {
          const prop = toCardDeal(favorite.property);
          return (
            <motion.div role="listitem" key={favorite.id} layout variants={itemVariants} exit="exit">
              <PropertyCard
                deal={prop}
                isFavorite
                onToggleFavorite={(id, e) => {
                  if (e) e.stopPropagation();
                  toggleFavorite(id, favorite.property);
                }}
                onOpenProspectus={() => onSelectDeal(favorite.property)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onSelectDeal }) => (
  <div className="space-y-6">
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-between px-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
          <motion.span
            initial={{ scale: 0.6, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
          >
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" aria-hidden="true" />
          </motion.span>
          Saved <span className="text-[#E04F33]">Favorites</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Your shortlisted arbitrage deals & luxury villas saved for review
        </p>
      </div>
    </motion.div>
    <ErrorBoundary fallbackTitle="Couldn't load your favorites">
      <FavoritesContent onSelectDeal={onSelectDeal} />
    </ErrorBoundary>
  </div>
);
