
import { create } from 'zustand';
import { Chapter, ReadingProgress } from '../lib/types/api';

interface ReaderState {
  chapters: Record<string, Chapter[]>; // seriesId -> chapters
  currentChapter: Chapter | null;
  progress: Record<string, ReadingProgress>; // chapterId -> progress
  isLoading: boolean;
  setChapters: (seriesId: string, chapters: Chapter[]) => void;
  setCurrentChapter: (chapter: Chapter | null) => void;
  setProgress: (chapterId: string, progress: ReadingProgress) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  chapters: {},
  currentChapter: null,
  progress: {},
  isLoading: false,
  setChapters: (seriesId, chapters) => set((state) => ({
    chapters: { ...state.chapters, [seriesId]: chapters }
  })),
  setCurrentChapter: (currentChapter) => set({ currentChapter }),
  setProgress: (chapterId, progress) => set((state) => ({
    progress: { ...state.progress, [chapterId]: progress }
  })),
  setLoading: (isLoading) => set({ isLoading }),
}));
