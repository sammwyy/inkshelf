
import { apiClient } from '../lib/clients/apiClient';
import { Series, PaginatedResponse, SeriesQueryDto, CreateSeriesDto } from '../lib/types/api';

export const seriesService = {
  async list(params: SeriesQueryDto = {}): Promise<PaginatedResponse<Series>> {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get<PaginatedResponse<Series>>(`/series?${query}`);
  },

  async search(term: string): Promise<Series[]> {
    const res = await this.list({ search: term });
    return res.data;
  },

  async getById(id: string): Promise<Series> {
    return apiClient.get<Series>(`/series/${id}`);
  },

  async getBySlug(slug: string): Promise<Series> {
    return apiClient.get<Series>(`/series/slug/${slug}`);
  },

  async create(data: CreateSeriesDto | FormData): Promise<Series> {
    return apiClient.post<Series>('/series', data);
  },

  async update(id: string, data: Partial<CreateSeriesDto> | FormData): Promise<Series> {
    return apiClient.patch<Series>(`/series/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/series/${id}`);
  }
};
