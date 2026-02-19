
import { apiClient } from '../lib/clients/apiClient';

export const ratingService = {
    async getRating(seriesId: string): Promise<{ rating: number }> {
        return apiClient.get<{ rating: number }>(`/series/${seriesId}/ratings`);
    },

    async rate(seriesId: string, rating: number): Promise<void> {
        await apiClient.post(`/series/${seriesId}/ratings`, { rating });
    },

    async removeRating(seriesId: string): Promise<void> {
        await apiClient.delete(`/series/${seriesId}/ratings`);
    }
};
