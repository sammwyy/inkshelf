
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLibrary } from '../hooks/useLibrary';
import { useReader } from '../hooks/useReader';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { Star, Calendar, User as UserIcon, Layout, Heart, Play } from 'lucide-react';
import Button from '../components/ui/Button';
import { apiClient } from '../lib/clients/apiClient';

import { useProgress } from '../hooks/useProgress';

const SeriesDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentSeries, getSeriesBySlug, toggleFavorite, favorites, isLoading: isLibLoading } = useLibrary();
  const { getChapters, chaptersMap, isLoading: isReaderLoading } = useReader();
  const { allProgress, fetchAllProgress } = useProgress();
  const { isAuthenticated, appSettings } = useAuth();
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (slug) {
      getSeriesBySlug(slug).then(series => {
        if (series) {
          getChapters(series.id);
          if (isAuthenticated) {
            fetchAllProgress();
          }
        }
      });
    }
  }, [slug, getSeriesBySlug, getChapters, fetchAllProgress, isAuthenticated]);

  useEffect(() => {
    if (currentSeries) {
      setIsFavorite(favorites.some(f => f.id === currentSeries.id));
    }
  }, [currentSeries, favorites]);

  const seriesChapters = currentSeries ? chaptersMap[currentSeries.id] || [] : [];
  const seriesProgress = allProgress.filter(p => seriesChapters.some(c => c.id === p.chapterId));
  const lastProgress = seriesProgress.length > 0
    ? seriesProgress.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
    : null;

  const isLoading = isLibLoading || isReaderLoading;

  if (isLoading && !currentSeries) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">{t('common.loading')}</p>
      </div>
    );
  }

  if (!currentSeries) return <div className="text-center py-20">{t('reader.notFound')}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-10 pb-20">
      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
        {/* Cover Image Section */}
        <div className="w-full md:w-80 shrink-0 -mt-6 md:mt-0 px-4 md:px-0">
          <div className="relative aspect-[3/4] md:aspect-[3/4] rounded-3xl md:rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
            <img
              src={apiClient.resolve(currentSeries.coverImage) || `https://picsum.photos/seed/${currentSeries.id}/400/600`}
              alt={currentSeries.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=No+Cover'; }}
            />
            {/* Mobile Only Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 md:hidden" />

            <div className="absolute bottom-4 left-4 right-4 md:hidden">
              <h1 className="font-display text-3xl font-bold text-white leading-tight drop-shadow-lg">
                {currentSeries.title}
              </h1>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {seriesChapters.length > 0 && (
              <>
                <Link
                  to={`/read/${lastProgress?.chapterId || seriesChapters[seriesChapters.length - 1].id}`}
                  className="w-full"
                >
                  <Button fullWidth className="flex flex-col items-center justify-center gap-0.5 py-4 md:py-3 shadow-lg shadow-pink-500/10">
                    <div className="flex items-center gap-2">
                      <Play size={18} fill="currentColor" /> {lastProgress ? t('details.continueReading') || 'Continue Reading' : t('details.startReading')}
                    </div>
                    {lastProgress && (
                      <span className="text-[10px] opacity-60 font-medium">
                        Ch. {lastProgress.chapter?.number} - Page {lastProgress.currentPage}
                      </span>
                    )}
                  </Button>
                </Link>

                {lastProgress && (
                  <Link
                    to={`/read/${seriesChapters[seriesChapters.length - 1].id}?from=start`}
                    className="w-full"
                  >
                    <Button
                      variant="secondary"
                      fullWidth
                      className="flex items-center justify-center gap-2 py-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50"
                    >
                      <Layout size={16} /> {t('details.readFromStart') || 'Read from start'}
                    </Button>
                  </Link>
                )}
              </>
            )}
            {isAuthenticated && (
              <Button
                variant="secondary"
                fullWidth
                className="flex items-center justify-center gap-2 py-4 md:py-3"
                onClick={() => toggleFavorite(currentSeries.id)}
              >
                <Heart size={18} className={isFavorite ? 'text-pink-500 fill-pink-500' : ''} />
                {isFavorite ? t('details.inLibrary') : t('details.addToLibrary')}
              </Button>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 space-y-6 px-4 md:px-0">
          <div className="space-y-2 hidden md:block">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              {currentSeries.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><UserIcon size={16} className="text-pink-500/50" /> {currentSeries.author}</span>
            {appSettings?.feature_ratings_enabled !== false && (
              <span className="flex items-center gap-1.5"><Star size={16} className="text-yellow-400 fill-yellow-400" /> {currentSeries.rating}</span>
            )}
            <span className="flex items-center gap-1.5"><Calendar size={16} className="text-blue-500/50" /> {currentSeries.year}</span>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${currentSeries.status === 'ONGOING' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
              {currentSeries.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentSeries.tags.map(tag => (
              <span key={tag} className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-medium text-gray-300 hover:border-pink-500/50 transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400 leading-relaxed text-base md:text-lg">
              {currentSeries.description}
            </p>
          </div>
        </div>
      </div>

      <section className="bg-zinc-900/30 md:border md:border-zinc-800/50 md:rounded-3xl p-4 md:p-8">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-white">
            <Layout size={24} className="text-pink-500" />
            {t('details.chapters')}
          </h2>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{seriesChapters.length} {t('details.items')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-safe">
          {seriesChapters.sort((a, b) => b.number - a.number).map(chapter => (
            <Link
              key={chapter.id}
              to={`/read/${chapter.id}`}
              className="flex items-center justify-between p-4 bg-zinc-900/50 active:bg-zinc-800 md:hover:bg-zinc-800 border border-zinc-800/50 rounded-2xl transition-all group"
            >
              <div className="flex flex-col">
                <span className="font-bold text-gray-100 group-hover:text-pink-400 transition-colors">Chapter {chapter.number}</span>
                <span className="text-xs text-zinc-500 mt-1 line-clamp-1">{chapter.title || t('common.untitled')}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-600 block mb-1">
                  {new Date(chapter.publishedAt).toLocaleDateString()}
                </span>
                <span className="text-[10px] text-pink-500 font-black uppercase tracking-widest px-2 py-0.5 bg-pink-500/5 rounded-md border border-pink-500/10">
                  {chapter.language}
                </span>
              </div>
            </Link>
          ))}
          {seriesChapters.length === 0 && (
            <div className="col-span-2 py-10 text-center text-gray-500 bg-zinc-900/20 rounded-2xl">
              {t('details.noChapters')}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SeriesDetailView;
