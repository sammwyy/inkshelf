
import { apiClient } from '../lib/clients/apiClient';
import { Favorite, PaginatedResponse } from '../lib/types/api';

export const favoritesService = {
    async list(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Favorite>> {
        return apiClient.get<PaginatedResponse<Favorite>>(`/favorites?page=${page}&limit=${limit}`);
    },

    async add(seriesId: string): Promise<Favorite> {
        return apiClient.post<Favorite>('/favorites', { seriesId });
    },

    async remove(seriesId: string): Promise<void> {
        await apiClient.delete(`/favorites/${seriesId}`);
    },

    async toggle(seriesId: string, isFavorite: boolean): Promise<void> {
        if (isFavorite) {
            await this.remove(seriesId);
        } else {
            await this.add(seriesId);
        }
    },

    async isFavorite(seriesId: string): Promise<boolean> {
        try {
            const res = await this.list();
            return res.data.some((f: Favorite) => f.seriesId === seriesId);
        } catch {
            return false;
        }
    }
};
