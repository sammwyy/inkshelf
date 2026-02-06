import { apiClient } from '../lib/clients/apiClient';
import { AdminStats } from '../lib/types/api';

export const adminService = {
    async getStats(): Promise<AdminStats> {
        return apiClient.get<AdminStats>('/admin/stats');
    }
};
