
import { apiClient } from '../lib/clients/apiClient';
import { Comment, CreateCommentDto, PaginatedResponse } from '../lib/types/api';

export const commentService = {
    async list(chapterId: string): Promise<Comment[]> {
        return apiClient.get<Comment[]>(`/chapters/${chapterId}/comments`);
    },

    async create(chapterId: string, data: CreateCommentDto): Promise<Comment> {
        return apiClient.post<Comment>(`/chapters/${chapterId}/comments`, data);
    },

    async update(chapterId: string, commentId: string, data: { content: string }): Promise<Comment> {
        return apiClient.patch<Comment>(`/chapters/${chapterId}/comments/${commentId}`, data);
    },

    async delete(chapterId: string, commentId: string): Promise<void> {
        await apiClient.delete(`/chapters/${chapterId}/comments/${commentId}`);
    }
};
