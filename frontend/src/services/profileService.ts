
import { apiClient } from '../lib/clients/apiClient';
import { UserProfile } from '../lib/types/api';

export const profileService = {
    async getByIdentifier(identifier: string): Promise<UserProfile> {
        // Identifier can be UUID or @username
        const handle = identifier.startsWith('@') || identifier.includes('-')
            ? identifier
            : `@${identifier}`;
        return apiClient.get<UserProfile>(`/profiles/${handle}`);
    },

    async getById(id: string): Promise<UserProfile> {
        return this.getByIdentifier(id);
    },

    async getByUsername(username: string): Promise<UserProfile> {
        return this.getByIdentifier(username);
    },

    async update(data: any): Promise<UserProfile> {
        return apiClient.patch<UserProfile>(`/profiles/me`, data);
    }
};
