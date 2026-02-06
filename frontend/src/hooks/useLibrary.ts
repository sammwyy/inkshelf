
import { useCallback } from 'react';
import { useLibraryStore } from '../stores/libraryStore';
import { seriesService } from '../services/seriesService';
import { favoritesService } from '../services/favoritesService';

export const useLibrary = () => {
  const series = useLibraryStore(state => state.series);
  const favorites = useLibraryStore(state => state.favorites);
  const currentSeries = useLibraryStore(state => state.currentSeries);
  const isLoading = useLibraryStore(state => state.isLoading);

  const setSeries = useLibraryStore(state => state.setSeries);
  const setFavorites = useLibraryStore(state => state.setFavorites);
  const setCurrentSeries = useLibraryStore(state => state.setCurrentSeries);
  const setLoading = useLibraryStore(state => state.setLoading);

  const fetchSeriesList = useCallback(async (params = {}, force = false) => {
    // Only fetch if empty or forced to ensure local-first behavior
    if (series && series.length > 0 && !force) return;

    setLoading(true);
    try {
      const res = await seriesService.list(params);
      setSeries(res.data);
    } catch (e) {
      console.error('Fetch series failed:', e);
    } finally {
      setLoading(false);
    }
  }, [series?.length, setLoading, setSeries]);

  const getSeriesBySlug = useCallback(async (slug: string) => {
    // Check local state first
    const local = series.find(s => s.slug === slug);
    if (local && currentSeries?.slug === slug) return local;

    setLoading(true);
    try {
      const data = await seriesService.getBySlug(slug);
      setCurrentSeries(data);
      return data;
    } catch (e) {
      console.error('Get series failed:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [series, currentSeries, setCurrentSeries, setLoading]);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await favoritesService.list();
      setFavorites(res.data);
    } catch (e) {
      console.error('Fetch favorites failed:', e);
    }
  }, [setFavorites]);

  const toggleFavorite = useCallback(async (seriesId: string) => {
    const isFav = favorites.some(f => f.seriesId === seriesId);
    try {
      await favoritesService.toggle(seriesId, isFav);
      // Immediately refresh favorites in memory
      await fetchFavorites();
    } catch (e) {
      console.error('Toggle favorite failed:', e);
    }
  }, [favorites, fetchFavorites]);

  return {
    series,
    favorites,
    currentSeries,
    isLoading,
    fetchSeriesList,
    getSeriesBySlug,
    fetchFavorites,
    toggleFavorite
  };
};
