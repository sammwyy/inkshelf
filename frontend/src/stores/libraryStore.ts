
import { create } from 'zustand';
import { Series, Favorite } from '../lib/types/api';

interface LibraryState {
  series: Series[];
  favorites: Favorite[];
  currentSeries: Series | null;
  isLoading: boolean;
  setSeries: (series: Series[]) => void;
  setFavorites: (favorites: Favorite[]) => void;
  setCurrentSeries: (series: Series | null) => void;
  setLoading: (isLoading: boolean) => void;
  updateSeriesInList: (series: Series) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  series: [],
  favorites: [],
  currentSeries: null,
  isLoading: false,
  setSeries: (series) => set({ series }),
  setFavorites: (favorites) => set({ favorites }),
  setCurrentSeries: (currentSeries) => set({ currentSeries }),
  setLoading: (isLoading) => set({ isLoading }),
  updateSeriesInList: (updated) => set((state) => ({
    series: state.series.map(s => s.id === updated.id ? updated : s)
  }))
}));
