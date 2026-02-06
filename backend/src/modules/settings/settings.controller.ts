import { Request, Response } from 'express';

import { SettingsService } from './settings.service';
import { ApiResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';

export class SettingsController {
    /**
     * Get all settings (Public)
     */
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const settings = await SettingsService.getAllSettings();
        return ApiResponse.success(res, settings);
    });

    /**
     * Update a setting (Admin only)
     */
    update = asyncHandler(async (req: Request, res: Response) => {
        const { key, value } = req.body;
        await SettingsService.updateSetting(key, value);
        return ApiResponse.success(res, { message: `Setting ${key} updated successfully` });
    });
}
