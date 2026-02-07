import { prisma } from '@/config/database';

export type SignupMode = 'allow' | 'none' | 'invitation';

export interface SystemSettings {
    app_signup_mode: SignupMode;
    app_allow_anonymous_view: boolean;
    app_title: string;
    app_custom_css: string;
    app_custom_js: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
    app_signup_mode: (process.env.APP_SIGNUP_MODE as SignupMode) || 'allow',
    app_allow_anonymous_view: process.env.APP_ALLOW_ANONYMOUS_VIEW === 'true',
    app_title: process.env.APP_TITLE || 'Inkshelf | Instance',
    app_custom_css: '',
    app_custom_js: '',
};

const DEFAULT_PRIVATE_SETTINGS: PrivateSystemSettings = {
    // Add private settings defaults here if needed
};

export interface PrivateSystemSettings {
    // Define private settings types here
}

export class SettingsService {
    /**
     * Get all public settings merged with defaults
     */
    static async getAllSettings(): Promise<SystemSettings> {
        const dbSettings = await prisma.systemSetting.findMany({
            where: { isPrivate: false }
        });
        const settingsMap = dbSettings.reduce((acc: Record<string, any>, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, any>);

        return {
            app_signup_mode: settingsMap['app_signup_mode'] ?? DEFAULT_SETTINGS.app_signup_mode,
            app_allow_anonymous_view: settingsMap['app_allow_anonymous_view'] ?? DEFAULT_SETTINGS.app_allow_anonymous_view,
            app_title: settingsMap['app_title'] ?? DEFAULT_SETTINGS.app_title,
            app_custom_css: settingsMap['app_custom_css'] ?? DEFAULT_SETTINGS.app_custom_css,
            app_custom_js: settingsMap['app_custom_js'] ?? DEFAULT_SETTINGS.app_custom_js,
        };
    }

    /**
     * Get all private settings
     */
    static async getPrivateSettings(): Promise<SystemSettings & PrivateSystemSettings> {
        const dbSettings = await prisma.systemSetting.findMany(); // All settings (public + private)
        const settingsMap = dbSettings.reduce((acc: Record<string, any>, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, any>);

        return {
            ...DEFAULT_SETTINGS,
            ...DEFAULT_PRIVATE_SETTINGS,
            ...settingsMap
        };
    }

    /**
     * Get a single setting by key
     */
    static async getSetting<K extends keyof SystemSettings>(key: K): Promise<SystemSettings[K]> {
        const setting = await prisma.systemSetting.findUnique({
            where: { key },
        });

        if (setting) {
            return setting.value as SystemSettings[K];
        }

        return DEFAULT_SETTINGS[key];
    }

    /**
     * Update or create a setting
     */
    static async updateSetting(key: string, value: any, isPrivate: boolean = false): Promise<void> {
        await prisma.systemSetting.upsert({
            where: { key },
            update: { value, isPrivate, updatedAt: new Date() },
            create: { key, value, isPrivate },
        });
    }
}
