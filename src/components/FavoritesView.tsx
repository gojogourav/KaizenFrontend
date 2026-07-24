/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const FavoritesView: React.FC<{ onSelectDeal: (deal: any) => void }> = ({ onSelectDeal }) => {
  const { toggleFavorite } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.getFavorites();
      const favList = Array.isArray(res) ? res : ((res as any)?.favorites || []);
      setFavorites(favList);
    } catch (err) {
      console.warn('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    try {
      await toggleFavorite(String(id));
      setFavorites((prev) => prev.filter((item) => (item.id !== id && item.property?.id !== id)));
    } catch (err) {
      console.warn('Failed to remove favorite:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans text-slate-100">
      
      <div className="flex items-center justify-between pb-4 border-b border-purple-900/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            <Heart className="w-7 h-7 text-pink-500 fill-pink-500" />
            Saved <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Favorites</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your shortlisted arbitrage deals & luxury villas saved for review.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 bg-purple-950/40 rounded-3xl" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-[#18082e] rounded-3xl border border-purple-800/60 p-12 text-center space-y-4 shadow-xl">
          <Heart className="w-12 h-12 text-purple-400/40 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No saved favorites yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the heart icon on any villa property card in the search grid to bookmark it here for quick access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((item) => {
            const prop = item.property || item;
            const propertyId = prop.id || item.id;
            const imageUrl = prop.images?.[0] || prop.imageUrl || 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200';
            const priceText = prop.price ? `$${prop.price.toLocaleString()}/mo` : (prop.monthlyRent || '');
            const title = prop.title || 'Luxury Villa';
            const location = prop.city ? `${prop.city}, ${prop.state}` : (prop.location || '');

            return (
              <div
                key={item.id || propertyId}
                onClick={() => onSelectDeal(prop)}
                className="bg-[#18082e] hover:bg-[#200b3d] rounded-3xl border border-purple-800/60 overflow-hidden shadow-xl transition-all duration-200 group cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, propertyId)}
                    className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-rose-950/90 text-rose-400 border border-rose-500/40 backdrop-blur-md transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {priceText && (
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-300 font-mono">
                      {priceText}
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-300 transition-colors font-sans">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 font-sans mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      {location}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-fuchsia-400 group-hover:translate-x-1 transition-transform">
                    <span>View Property Details</span>
                    <ArrowRight className="w-4 h-4" />
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
