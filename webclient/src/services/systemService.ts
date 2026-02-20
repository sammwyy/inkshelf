
import { apiClient } from '../lib/clients/apiClient';
import { SystemSetting, UpdateSettingDto } from '../lib/types/api';

export type UserSignupMode = 'none' | 'open' | 'invitation';

export interface AppSettings {
    app_allow_anonymous_view: boolean;
    app_signup_mode: UserSignupMode;
    app_title: string;
    app_custom_js: string;
    app_custom_css: string;
    feature_comments_enabled: boolean;
    feature_ratings_enabled: boolean;
    feature_public_lists_enabled: boolean;
}

export const systemService = {
    async getSettings(): Promise<AppSettings> {
        return apiClient.get<AppSettings>('/settings');
    },

    async updateSetting(data: UpdateSettingDto): Promise<SystemSetting> {
        return apiClient.patch<SystemSetting>('/settings', data);
    }
};
