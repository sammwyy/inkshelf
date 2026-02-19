import { z } from 'zod';

export const updateSettingSchema = z.object({
    key: z.string(),
    value: z.any(),
}).refine((data) => {
    if (data.key === 'app_signup_mode') {
        return ['allow', 'none', 'invitation'].includes(data.value);
    }
    if (data.key === 'app_allow_anonymous_view') {
        return typeof data.value === 'boolean';
    }
    if (['app_title', 'app_custom_css', 'app_custom_js'].includes(data.key)) {
        return typeof data.value === 'string';
    }
    return true;
}, {
    message: "Invalid value for the given key",
    path: ["value"]
});

export type UpdateSettingDto = z.infer<typeof updateSettingSchema>;


