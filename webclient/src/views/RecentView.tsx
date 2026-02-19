
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../hooks/useAuth';
import { useSettingsStore } from '../stores/settingsStore';
import { Link } from 'react-router-dom';
import { History, Play, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../lib/clients/apiClient';

const RecentView: React.FC = () => {
  const { t } = useTranslation();
  const { allProgress, pagination, fetchAllProgress, isLoading } = useProgress();
  const { isAuthenticated } = useAuth();
  const isDark = useSettingsStore(state => state.theme === 'dark');

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchAllProgress();
    }
  }, [isAuthenticated, fetchAllProgress]);

  const handlePageChange = (newPage: number) => {
    fetchAllProgress(newPage);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <History size={64} className="text-zinc-800 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">{t('auth.required')}</h2>
        <p className="text-zinc-500">{t('auth.requiredSubtitle')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-[1.5rem] bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20 shadow-lg shadow-pink-500/5">
          <History size={28} />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-display">{t('recent.title')}</h1>
          <p className="text-zinc-500 text-sm font-medium">{t('recent.subtitle') || 'Manage your reading progress'}</p>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-zinc-900/50 animate-pulse" />
          ))}
        </div>
      ) : allProgress.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProgress.map((progress) => (
              <div
                key={progress.id}
                className={`flex gap-4 p-4 rounded-3xl border transition-all hover:scale-[1.02] group ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}
              >
                <Link
                  to={`/series/${progress.chapter?.series?.slug}`}
                  className="relative w-24 h-32 shrink-0 rounded-2xl overflow-hidden ring-1 ring-white/10"
                >
                  <img
                    src={apiClient.resolve(progress.chapter?.series?.coverImage) || `https://picsum.photos/seed/${progress.id}/200/300`}
                    alt={progress.chapter?.series?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="text-white fill-white" size={24} />
                  </div>
                </Link>

                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <Link to={`/series/${progress.chapter?.series?.slug}`}>
                    <h3 className={`font-bold text-base truncate mb-1 hover:text-pink-500 transition-colors ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {progress.chapter?.series?.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-pink-500 font-bold mb-2">
                    Chapter {progress.chapter?.number}
                  </p>

                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                      <span>{Math.round((progress.currentPage / progress.totalPages) * 100)}%</span>
                      <span>{progress.currentPage} / {progress.totalPages}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${(progress.currentPage / progress.totalPages) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      to={`/read/${progress.chapterId}`}
                      className="flex-1"
                    >
                      <button className="w-full py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 rounded-xl text-xs font-bold transition-all">
                        {t('recent.continue') || 'Continue'}
                      </button>
                    </Link>
                    <button className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-8">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white disabled:opacity-30 transition-all hover:bg-zinc-800"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-bold text-zinc-500">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white disabled:opacity-30 transition-all hover:bg-zinc-800"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-32 text-center space-y-4 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-[2.5rem] backdrop-blur-sm">
          <History size={64} className="mx-auto text-zinc-800 opacity-20" />
          <p className="text-zinc-500 text-xl font-medium italic">{t('recent.empty')}</p>
          <p className="text-zinc-600 text-sm">{t('recent.emptySubtitle') || 'You haven\'t read anything yet'}</p>
          <Link to="/">
            <button className="mt-4 px-8 py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-all">
              {t('recent.startReading') || 'Start Reading'}
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentView;
