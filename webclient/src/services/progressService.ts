
import { apiClient } from '../lib/clients/apiClient';
import { ReadingProgress, UpdateProgressDto, PaginatedResponse, ReadingHistory } from '../lib/types/api';

export const progressService = {
  async update(chapterId: string, data: UpdateProgressDto): Promise<ReadingProgress> {
    return apiClient.put<ReadingProgress>(`/progress/${chapterId}`, data);
  },

  async get(chapterId: string): Promise<ReadingProgress | null> {
    try {
      return await apiClient.get<ReadingProgress>(`/progress/${chapterId}`);
    } catch {
      return null;
    }
  },

  async list(page: number = 1, limit: number = 20): Promise<PaginatedResponse<ReadingProgress>> {
    return apiClient.get<PaginatedResponse<ReadingProgress>>(`/progress?page=${page}&limit=${limit}`);
  },

  async getContinueReading(): Promise<ReadingProgress[]> {
    return apiClient.get<ReadingProgress[]>('/progress/continue-reading');
  },

  async getHistory(): Promise<PaginatedResponse<ReadingHistory>> {
    return apiClient.get<PaginatedResponse<ReadingHistory>>('/progress/history');
  },

  async delete(chapterId: string): Promise<void> {
    await apiClient.delete(`/progress/${chapterId}`);
  },

  async clearAll(): Promise<void> {
    await apiClient.delete('/progress');
  }
};
