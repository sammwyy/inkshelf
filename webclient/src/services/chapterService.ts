
import { apiClient } from '../lib/clients/apiClient';
import { Chapter, ChapterQueryDto, CreateChapterDto, PaginatedResponse } from '../lib/types/api';

export const chapterService = {
  async listBySeries(seriesId: string, params: ChapterQueryDto = {}): Promise<PaginatedResponse<Chapter>> {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get<PaginatedResponse<Chapter>>(`/chapters/series/${seriesId}?${query}`);
  },

  async getOne(chapterId: string): Promise<Chapter> {
    return apiClient.get<Chapter>(`/chapters/${chapterId}`);
  },

  async create(seriesId: string, data: CreateChapterDto | FormData): Promise<Chapter> {
    return apiClient.post<Chapter>(`/chapters/series/${seriesId}`, data);
  },

  async update(chapterId: string, data: Partial<CreateChapterDto> | FormData): Promise<Chapter> {
    return apiClient.patch<Chapter>(`/chapters/${chapterId}`, data);
  },

  async delete(chapterId: string): Promise<void> {
    await apiClient.delete(`/chapters/${chapterId}`);
  },

  async uploadPages(_seriesId: string, chapterId: string, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach((file) => formData.append('pages', file));
    await apiClient.post(`/chapters/${chapterId}/pages`, formData);
  }
};
