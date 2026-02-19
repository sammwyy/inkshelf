
import { apiClient } from '../lib/clients/apiClient';
import { UserPreferences } from '../lib/types/api';

export const preferencesService = {
    async get(): Promise<UserPreferences> {
        return apiClient.get<UserPreferences>('/me/preferences');
    },

    async update(data: Partial<UserPreferences>): Promise<UserPreferences> {
        return apiClient.patch<UserPreferences>('/me/preferences', data);
    }
};
