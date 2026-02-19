
import React, { useEffect } from 'react';
import { useLibrary } from '../hooks/useLibrary';
import { useTranslation } from '../hooks/useTranslation';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { Link } from 'react-router-dom';
import { Star, Eye, RefreshCw, Compass, Shield, Play, Clock } from 'lucide-react';
import { Role } from '../lib/types/api';
import { apiClient } from '../lib/clients/apiClient';

const HomeView: React.FC = () => {
  const { series, fetchSeriesList, isLoading } = useLibrary();
  const { continueReading, fetchContinueReading, isLoading: isProgressLoading } = useProgress();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const theme = useSettingsStore(state => state.theme);
  const isDark = theme === 'dark';
  const isAdmin = user?.role === Role.ADMIN;

  useEffect(() => {
    fetchSeriesList();
    if (isAuthenticated) {
      fetchContinueReading();
    }
  }, [fetchSeriesList, fetchContinueReading, isAuthenticated]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      {/* Hero Header - Hidden on Mobile */}
      <header className={`relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border p-6 md:p-12 transition-colors duration-500 hidden md:block ${isDark
        ? 'bg-gradient-to-br from-zinc-900/60 to-black border-zinc-800/50'
        : 'bg-gradient-to-br from-pink-50 to-white border-pink-100'
        }`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none select-none">
          <div className="text-[12rem] font-display text-pink-500">桜</div>
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-pink-500 mb-4">
            <Compass size={24} />
            <span className="text-xs font-black uppercase tracking-[0.3em]">{t('nav.explore')}</span>
          </div>
          <h1 className={`font-display text-5xl md:text-7xl font-bold mb-6 leading-[1.1] ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {t('home.heroTitle').split(' ')[0]} <span className="text-pink-500">{t('home.heroTitle').split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className={`text-lg md:text-xl leading-relaxed max-w-xl ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {t('home.heroSubtitle')}
          </p>

          {isAdmin && (
            <Link to="/admin" className="inline-flex mt-8">
              <button className="flex items-center gap-3 bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-[1.5rem] font-bold transition-all active:scale-95 group">
                <Shield size={20} className="group-hover:rotate-12 transition-transform" />
                Admin Dashboard
              </button>
            </Link>
          )}
        </div>
      </header>

      {/* Continue Reading Section */}
      {isAuthenticated && continueReading.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <div className="w-2 h-6 bg-pink-500 rounded-full" />
              {t('home.continueReading') || 'Continue Reading'}
            </h2>
          </div>
          <div className="overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
            <div className="flex gap-4 min-w-max">
              {continueReading.slice(0, 5).map((progress) => (
                <Link
                  key={progress.id}
                  to={`/read/${progress.chapterId}`}
                  className={`flex gap-4 p-3 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] group w-72 md:w-80 ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}
                >
                  <div className="relative w-24 h-32 shrink-0 rounded-xl overflow-hidden ring-1 ring-white/10">
                    <img
                      src={apiClient.resolve(progress.chapter?.series?.coverImage) || `https://picsum.photos/seed/${progress.id}/200/300`}
                      alt={progress.chapter?.series?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="text-white fill-white" size={24} />
                    </div>
                    {/* Progress Bar Overlay */}
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-black/40">
                      <div
                        className="h-full bg-pink-500"
                        style={{ width: `${(progress.currentPage / progress.totalPages) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h3 className={`font-bold text-sm truncate mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {progress.chapter?.series?.title}
                    </h3>
                    <p className="text-xs text-pink-500 font-bold mb-2">
                      Ch. {progress.chapter?.number}
                    </p>
                    <div className="mt-auto flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <Clock size={12} />
                      {Math.round((progress.currentPage / progress.totalPages) * 100)}% read
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grid Header */}
      <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}>
        <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          <div className="w-2 h-6 bg-pink-500 rounded-full" />
          {t('home.browse')}
        </h2>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/admin" className="md:hidden">
              <button className={`p-2.5 rounded-xl border ${isDark
                ? 'bg-zinc-900/50 text-pink-500 border-zinc-800'
                : 'bg-white text-pink-600 border-pink-100'
                }`}>
                <Shield size={16} />
              </button>
            </Link>
          )}
          <button
            onClick={() => fetchSeriesList({}, true)}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-xl border ${isDark
              ? 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-pink-400 hover:border-pink-500/30'
              : 'bg-white text-zinc-400 border-zinc-200 hover:text-pink-600 hover:border-pink-300'
              }`}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {t('home.refresh')}
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="min-h-[400px]">
        {isLoading && (!series || series.length === 0) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className={`aspect-[3/4] rounded-[1.5rem] mb-3 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
                <div className={`h-4 rounded-lg w-3/4 mb-2 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
                <div className={`h-3 rounded-lg w-1/2 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
              </div>
            ))}
          </div>
        ) : (series && series.length > 0) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {series.map((item) => (
              <Link
                key={item.id}
                to={`/series/${item.slug}`}
                className="group block"
              >
                <div className={`relative aspect-[3/4] rounded-[1.5rem] overflow-hidden mb-3 transition-all duration-500 group-hover:-translate-y-2 group-hover:block transition-all duration-500 group-hover:ring-2 group-hover:ring-pink-500/30 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'
                  }`}>
                  <img
                    src={apiClient.resolve(item.coverImage) || `https://picsum.photos/seed/${item.id}/300/400`}
                    alt={item.title}
                    className="w-full h-full object-cover transition-scale duration-700 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Cover'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" /> {item.rating}
                      </span>
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                        <Eye size={10} /> {item.viewCount}
                      </span>
                    </div>
                  </div>
                </div>
                <h3 className={`font-bold text-sm line-clamp-2 transition-colors leading-tight mb-1 group-hover:text-pink-500 ${isDark ? 'text-gray-100' : 'text-zinc-800'}`}>{item.title}</h3>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">{item.status}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`py-20 text-center border border-dashed rounded-[2rem] ${isDark ? 'text-zinc-600 border-zinc-800' : 'text-zinc-400 border-zinc-200'}`}>
            {t('home.noEntries')}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;
