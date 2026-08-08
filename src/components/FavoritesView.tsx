/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Trash2, ArrowRight } from 'lucide-react';
import api from '../api/client';
import type { Favorite, Property } from '../types/database';

export interface FavoritesViewProps {
  onSelectDeal: (deal: Property) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onSelectDeal }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.getFavorites();
      setFavorites(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (e: React.MouseEvent, propertyId: string | number) => {
    e.stopPropagation();
    try {
      await api.removeFavorite(propertyId);

      setFavorites((prev) => prev.filter((item) => item.property.id !== propertyId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans text-slate-900 dark:text-slate-100">

      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            Saved <span className="text-[#E04F33]">Favorites</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your shortlisted properties saved for review.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 bg-slate-200/60 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200/80 dark:border-white/10 p-12 text-center space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-2xl">
          <Heart className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-slate-200">No saved favorites yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-sans">
            Click the heart icon on any property card in the search grid to bookmark it here for quick access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((item) => {
            const prop = item.property;
            if (!prop) return null;

            const imageUrl = prop.images?.length > 0
              ? prop.images[0]
              : 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200';

            const priceText = prop.price ? `$${prop.price.toLocaleString()}` : 'Price on request';
            const title = prop.title || 'Luxury Property';
            const location = [prop.city, prop.state].filter(Boolean).join(', ') || prop.address || 'Unknown Location';

            return (
              <div
                key={item.id}
                onClick={() => onSelectDeal(prop)}
                className="bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-2xl transition-all duration-300 group cursor-pointer flex flex-col justify-between apple-specular"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-[#06040a]">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] filter brightness-[0.98] dark:brightness-90 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, prop.id)}
                    className="absolute top-3.5 right-3.5 p-2.5 rounded-full bg-black/50 hover:bg-rose-950/90 text-rose-400 border border-white/20 backdrop-blur-md transition-colors cursor-pointer z-10"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-3.5 left-3.5 bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold text-white font-mono tracking-wider">
                    {priceText}
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white group-hover:text-[#E04F33] dark:group-hover:text-[#FF8A73] transition-colors truncate">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-sans mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#E04F33] shrink-0" />
                      <span className="truncate">{location}</span>
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#E04F33] dark:group-hover:text-[#FF8A73] font-heading transition-colors">
                    <span>View Property Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
