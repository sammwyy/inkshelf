
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { seriesService } from '../services/seriesService';
import { useTranslation } from '../hooks/useTranslation';
import { Series } from '../lib/types/api';
import { Star, Search as SearchIcon } from 'lucide-react';
import { apiClient } from '../lib/clients/apiClient';

const SearchView: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const term = queryParams.get('q') || '';
  const { t } = useTranslation();

  const [results, setResults] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (term) {
      const performSearch = async () => {
        setIsLoading(true);
        try {
          const data = await seriesService.search(term);
          setResults(data);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      performSearch();
    }
  }, [term]);

  return (
    <div className="space-y-8">
      <div className="hidden md:flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500">
          <SearchIcon size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white font-display">{t('search.results')}</h1>
          <p className="text-gray-400 text-sm">{t('search.queryFor')} <span className="text-pink-400 font-medium italic">"{term}"</span></p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-zinc-900 rounded-xl mb-3" />
              <div className="h-4 bg-zinc-900 rounded w-3/4 mb-2" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
          <SearchIcon size={48} className="mx-auto text-zinc-800" />
          <p className="text-gray-500 text-lg">{t('search.noResults')}</p>
          <Link to="/" className="inline-block text-pink-500 hover:text-pink-400 font-medium">{t('search.goHome')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map((item) => (
            <Link
              key={item.id}
              to={`/series/${item.slug}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-zinc-900 transition-all duration-300 group-hover:ring-2 group-hover:ring-pink-500/50">
                <img
                  src={apiClient.resolve(item.coverImage) || `https://picsum.photos/seed/${item.id}/300/400`}
                  alt={item.title}
                  className="w-full h-full object-cover transition-scale duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Cover'; }}
                />
              </div>
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-pink-400 transition-colors">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-gray-500 uppercase font-bold tracking-wider">{item.status}</span>
                <span className="text-zinc-700 text-[10px]">•</span>
                <span className="flex items-center gap-1 text-[10px] text-yellow-500"><Star size={10} fill="currentColor" /> {item.rating}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchView;
