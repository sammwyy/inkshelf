
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useReader } from '../hooks/useReader';
import { useLibrary } from '../hooks/useLibrary';
import { useTranslation } from '../hooks/useTranslation';
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, Maximize, MessageSquare } from 'lucide-react';
import { apiClient } from '../lib/clients/apiClient';

const ReaderView: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [searchParams] = useSearchParams();
  const fromStart = searchParams.get('from') === 'start';
  const explicitStartPage = parseInt(searchParams.get('startPage') || '0');
  const navigate = useNavigate();
  const { currentChapter, getChapter, updateProgress, getProgress, isLoading: readerLoading } = useReader();
  const { series, fetchSeriesList } = useLibrary();
  const { t } = useTranslation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const readerRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const lastUpdatedPage = useRef<number>(0);

  useEffect(() => {
    if (chapterId) {
      getChapter(chapterId).then(async (chapter) => {
        if (!chapter) return;

        let targetPage = 1;

        if (fromStart) {
          targetPage = 1;
          updateProgress(chapterId, 1);
        } else if (explicitStartPage > 0) {
          targetPage = explicitStartPage;
        } else {
          const progress = await getProgress(chapterId);
          if (progress && progress.currentPage > 1) {
            targetPage = progress.currentPage;
          }
        }

        setCurrentPage(targetPage);

        if (targetPage > 1) {
          setTimeout(() => {
            const pageEl = pageRefs.current[targetPage - 1];
            if (pageEl) {
              pageEl.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
          }, 150);
        }
      });
      fetchSeriesList();
    }
  }, [chapterId, getChapter, getProgress, fetchSeriesList, fromStart, explicitStartPage, updateProgress]);

  const seriesInfo = currentChapter ? series.find(s => s.id === currentChapter.seriesId) : null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = Number(entry.target.getAttribute('data-page-index'));
            const newPage = pageIndex + 1;
            setCurrentPage(newPage);

            // Only update backend if it's a new page
            if (chapterId && currentChapter && newPage !== lastUpdatedPage.current) {
              lastUpdatedPage.current = newPage;
              updateProgress(chapterId, newPage);
            }
          }
        });
      },
      { threshold: 0.2 } // Balanced threshold for both desktop and mobile scroll
    );

    pageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [chapterId, currentChapter, updateProgress]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const progress = (window.scrollY / scrollHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (readerLoading && !currentChapter) return <div className="min-h-screen flex items-center justify-center text-pink-500">{t('reader.loading')}</div>;
  if (!currentChapter) return <div className="min-h-screen flex items-center justify-center">{t('reader.notFound')}</div>;

  return (
    <div className="relative bg-black min-h-screen -mx-4 -mt-6">
      <div className={`fixed top-0 inset-x-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium truncate max-w-[150px] md:max-w-xs">{seriesInfo?.title || t('common.loading')}</span>
              <span className="text-sm font-bold text-white">Entry {currentChapter.number}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-pink-400"><Settings size={20} /></button>
            <button className="p-2 text-gray-400 hover:text-pink-400"><MessageSquare size={20} /></button>
          </div>
        </div>
        <div className="h-0.5 bg-zinc-800 w-full">
          <div className="h-full bg-pink-500 transition-all duration-100" style={{ width: `${scrollProgress}%` }} />
        </div>
      </div>

      <div
        ref={readerRef}
        className="flex flex-col items-center py-20 bg-zinc-950"
        onClick={() => setShowControls(!showControls)}
      >
        {currentChapter.pages.map((page, index) => (
          <img
            key={index}
            ref={(el) => { pageRefs.current[index] = el; }}
            data-page-index={index}
            src={apiClient.resolve(page)}
            alt={`Page ${index + 1}`}
            className="max-w-full md:max-w-2xl lg:max-w-4xl h-auto"
            loading="lazy"
          />
        ))}
      </div>

      {/* Compact Horizontal Bottom Controls */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl px-4 py-2 flex items-center gap-4 shadow-2xl transition-all duration-300 w-[min(90%,400px)] ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <button className="p-2 text-gray-400 hover:text-white disabled:opacity-30"><ChevronLeft size={20} /></button>

        <div className="flex-1 flex items-center justify-center gap-2 text-sm font-bold leading-none">
          <span className="text-pink-400 font-mono">{currentPage}</span>
          <span className="text-zinc-600 font-black">/</span>
          <span className="text-zinc-400 font-mono">{currentChapter.pageCount}</span>
        </div>

        <button className="p-2 text-gray-400 hover:text-white disabled:opacity-30"><ChevronRight size={20} /></button>

        <div className="w-px h-6 bg-zinc-800" />

        <button className="p-2 text-gray-400 hover:text-white"><Maximize size={18} /></button>
      </div>
    </div>
  );
};

export default ReaderView;
