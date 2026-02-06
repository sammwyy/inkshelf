
import { useSeriesStore } from '../stores/seriesStore';
import { seriesService } from '../services/seriesService';
import { favoritesService } from '../services/favoritesService';
// Import chapterService to fetch chapters for a specific series
import { chapterService } from '../services/chapterService';
import { useCallback } from 'react';

export const useSeries = () => {
  const store = useSeriesStore();

  const fetchSeries = useCallback(async (params = {}) => {
    store.setLoading(true);
    try {
      // Fix: renamed listSeries to list according to seriesService definition
      const res = await seriesService.list(params);
      store.setSeries(res.data);
    } finally {
      store.setLoading(false);
    }
  }, []);

  const fetchBySlug = async (slug: string) => {
    store.setLoading(true);
    try {
      const series = await seriesService.getBySlug(slug);
      store.setCurrentSeries(series);
      // Fix: seriesService does not have listChapters; using chapterService.listBySeries instead
      const chaptersRes = await chapterService.listBySeries(series.id);
      store.setChapters(chaptersRes.data);
    } finally {
      store.setLoading(false);
    }
  };

  const fetchFavorites = useCallback(async () => {
    const res = await favoritesService.list();
    store.setFavorites(res.data);
  }, [store]);

  const toggleFavorite = async (seriesId: string) => {
    const isFav = store.favorites.some(f => f.seriesId === seriesId);
    await favoritesService.toggle(seriesId, isFav);
    await fetchFavorites();
  };

  return {
    ...store,
    fetchSeries,
    fetchBySlug,
    fetchFavorites,
    toggleFavorite
  };
};
