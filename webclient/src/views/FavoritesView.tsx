
import React, { useEffect } from 'react';
import { useLibrary } from '../hooks/useLibrary';
import { useTranslation } from '../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { apiClient } from '../lib/clients/apiClient';

const FavoritesView: React.FC = () => {
  const { favorites, fetchFavorites, isLoading } = useLibrary();
  const { t } = useTranslation();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="hidden md:flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500">
          <Heart size={24} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white font-display">{t('library.title')}</h1>
          <p className="text-zinc-400 text-sm">{t('library.subtitle')}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 text-zinc-500 animate-pulse">
          <div className="w-4 h-4 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
          <span>{t('library.syncing')}</span>
        </div>
      ) : (!favorites || favorites.length === 0) ? (
        <div className="py-20 text-center space-y-4 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
          <Heart size={48} className="mx-auto text-zinc-800" />
          <p className="text-zinc-500">{t('library.empty')}</p>
          <Link to="/" className="inline-block text-pink-500 hover:text-pink-400 font-medium">{t('library.browseLink')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {favorites.map((item) => {
            const series = item.series;
            if (!series) return null;

            return (
              <Link
                key={item.id}
                to={`/series/${series.slug}`}
                className="group block"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-zinc-900 shadow-xl transition-all duration-300 group-hover:ring-2 group-hover:ring-pink-500/50">
                  <img
                    src={apiClient.resolve(series.coverImage) || `https://picsum.photos/seed/${series.id}/300/400`}
                    alt={series.title}
                    className="w-full h-full object-cover transition-scale duration-500 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Cover'; }}
                  />
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 text-white group-hover:text-pink-400 transition-colors">{series.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{series.status}</span>
                  <span className="text-zinc-700 text-[10px]">•</span>
                  <span className="flex items-center gap-1 text-[10px] text-yellow-500"><Star size={10} fill="currentColor" /> {series.rating || 'N/A'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
