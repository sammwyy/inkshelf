import { prisma } from '@/database';

export type SignupMode = 'allow' | 'none' | 'invitation';

export interface SystemSettings {
    app_signup_mode: SignupMode;
    app_allow_anonymous_view: boolean;
    app_title: string;
    app_custom_css: string;
    app_custom_js: string;
    feature_comments_enabled: boolean;
    feature_ratings_enabled: boolean;
    feature_public_lists_enabled: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
    app_signup_mode: (process.env.APP_SIGNUP_MODE as SignupMode) || 'allow',
    app_allow_anonymous_view: process.env.APP_ALLOW_ANONYMOUS_VIEW === 'true',
    app_title: process.env.APP_TITLE || 'Inkshelf | Instance',
    app_custom_css: '',
    app_custom_js: '',
    feature_comments_enabled: true,
    feature_ratings_enabled: true,
    feature_public_lists_enabled: true,
};

const DEFAULT_PRIVATE_SETTINGS: PrivateSystemSettings = {
    // Add private settings defaults here if needed
};

export interface PrivateSystemSettings {
    // Define private settings types here
}

function parseValue(key: string, value: string): any {
    if (['app_allow_anonymous_view', 'feature_comments_enabled', 'feature_ratings_enabled', 'feature_public_lists_enabled'].includes(key)) {
        return value === 'true' || value === '1';
    }
    return value;
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
            acc[curr.key] = parseValue(curr.key, curr.value);
            return acc;
        }, {} as Record<string, any>);

        return {
            ...DEFAULT_SETTINGS,
            ...settingsMap
        };
    }

    /**
     * Get all private settings
     */
    static async getPrivateSettings(): Promise<SystemSettings & PrivateSystemSettings> {
        const dbSettings = await prisma.systemSetting.findMany(); // All settings (public + private)
        const settingsMap = dbSettings.reduce((acc: Record<string, any>, curr: any) => {
            acc[curr.key] = parseValue(curr.key, curr.value);
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
            return parseValue(key, setting.value) as SystemSettings[K];
        }

        return DEFAULT_SETTINGS[key];
    }

    /**
     * Update or create a setting
     */
    static async updateSetting(key: string, value: any, isPrivate: boolean = false): Promise<void> {
        const stringValue = typeof value === 'string' ? value : String(value);
        await prisma.systemSetting.upsert({
            where: { key },
            update: { value: stringValue, isPrivate, updatedAt: new Date() },
            create: { key, value: stringValue, isPrivate },
        });
    }
}


