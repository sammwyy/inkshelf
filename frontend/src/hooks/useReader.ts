
import { useCallback, useRef } from 'react';
import { useReaderStore } from '../stores/readerStore';
import { chapterService } from '../services/chapterService';
import { progressService } from '../services/progressService';

export const useReader = () => {
  const chaptersMap = useReaderStore(state => state.chapters);
  const currentChapter = useReaderStore(state => state.currentChapter);
  const progressMap = useReaderStore(state => state.progress);
  const isLoading = useReaderStore(state => state.isLoading);

  const setChapters = useReaderStore(state => state.setChapters);
  const setCurrentChapter = useReaderStore(state => state.setCurrentChapter);
  const setProgress = useReaderStore(state => state.setProgress);
  const setLoading = useReaderStore(state => state.setLoading);

  const getChapters = useCallback(async (seriesId: string, force = false) => {
    // Return from memory if available
    if (chaptersMap[seriesId] && !force) return chaptersMap[seriesId];

    setLoading(true);
    try {
      const response = await chapterService.listBySeries(seriesId);
      setChapters(seriesId, response.data);
      return response.data;
    } catch (e) {
      console.error('List items failed:', e);
      return [];
    } finally {
      setLoading(false);
    }
  }, [chaptersMap, setChapters, setLoading]);

  const getChapter = useCallback(async (chapterId: string) => {
    if (currentChapter?.id === chapterId) return currentChapter;

    setLoading(true);
    try {
      const data = await chapterService.getOne(chapterId);
      setCurrentChapter(data);
      return data;
    } catch (e) {
      console.error('Get item failed:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentChapter, setCurrentChapter, setLoading]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateProgress = useCallback((chapterId: string, page: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await progressService.update(chapterId, { currentPage: page });
        setProgress(chapterId, data);
      } catch (e) {
        console.error('Update progress failed:', e);
      }
    }, 5000);
  }, [setProgress]);

  const getProgress = useCallback(async (chapterId: string) => {
    try {
      return await progressService.get(chapterId);
    } catch (e) {
      console.error('Get progress failed:', e);
      return null;
    }
  }, []);

  return {
    chaptersMap,
    currentChapter,
    progressMap,
    isLoading,
    getChapters,
    getChapter,
    updateProgress,
    getProgress
  };
};
