
import { apiClient } from '../lib/clients/apiClient';
import { User, UserQueryDto, UpdateUserDto, CreateUserDto, PaginatedResponse } from '../lib/types/api';

export const usersService = {
    async list(params: UserQueryDto = {}): Promise<PaginatedResponse<User>> {
        const query = new URLSearchParams(params as any).toString();
        return apiClient.get<PaginatedResponse<User>>(`/users?${query}`);
    },

    async get(id: string): Promise<User> {
        return apiClient.get<User>(`/users/${id}`);
    },

    async create(data: CreateUserDto): Promise<User> {
        return apiClient.post<User>('/users', data);
    },

    async update(id: string, data: UpdateUserDto): Promise<User> {
        return apiClient.patch<User>(`/users/${id}`, data);
    },

    async ban(id: string, reason: string): Promise<User> {
        return apiClient.post<User>(`/users/${id}/ban`, { reason });
    },

    async unban(id: string): Promise<User> {
        return apiClient.post<User>(`/users/${id}/unban`);
    }
};
