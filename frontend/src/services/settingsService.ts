import { apiClient } from '../lib/clients/apiClient';
import { UpdateSettingDto, SystemSetting } from '../lib/types/api';

export const settingsService = {
    async getAll(): Promise<Record<string, any>> {
        const response = await apiClient.get<SystemSetting[]>('/settings');
        // Backend returns array of { key, value }, convert to object for easier usage
        if (Array.isArray(response)) {
            return response.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {} as Record<string, any>);
        }
        return {};
    },

    async update(key: UpdateSettingDto['key'], value: any): Promise<void> {
        await apiClient.patch('/settings', { key, value });
    }
};
