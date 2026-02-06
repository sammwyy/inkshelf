
import { create } from 'zustand';
import { Series, Chapter, Favorite } from '../lib/types/api';

interface SeriesState {
  series: Series[];
  favorites: Favorite[];
  currentSeries: Series | null;
  chapters: Chapter[];
  isLoading: boolean;
  setSeries: (series: Series[]) => void;
  setFavorites: (favorites: Favorite[]) => void;
  setCurrentSeries: (series: Series | null) => void;
  setChapters: (chapters: Chapter[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useSeriesStore = create<SeriesState>((set) => ({
  series: [],
  favorites: [],
  currentSeries: null,
  chapters: [],
  isLoading: false,
  setSeries: (series) => set({ series }),
  setFavorites: (favorites) => set({ favorites }),
  setCurrentSeries: (currentSeries) => set({ currentSeries }),
  setChapters: (chapters) => set({ chapters }),
  setLoading: (isLoading) => set({ isLoading }),
}));
