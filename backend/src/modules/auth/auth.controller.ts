import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { ApiResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';
import { config } from '@/config';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    signup = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.authService.signup(req.body);

        this.setRefreshTokenCookie(res, result.tokens.refreshToken);

        return ApiResponse.created(res, {
            user: result.user,
            accessToken: result.tokens.accessToken,
        });
    });

    login = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.authService.login(req.body);

        this.setRefreshTokenCookie(res, result.tokens.refreshToken);

        return ApiResponse.success(res, {
            user: result.user,
            accessToken: result.tokens.accessToken,
        });
    });

    refresh = asyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        const tokens = await this.authService.refreshToken(refreshToken);

        this.setRefreshTokenCookie(res, tokens.refreshToken);

        return ApiResponse.success(res, {
            accessToken: tokens.accessToken,
        });
    });

    logout = asyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        res.clearCookie('refreshToken');

        return ApiResponse.noContent(res);
    });

    requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
        await this.authService.requestPasswordReset(req.body.email);

        return ApiResponse.success(res, {
            message: 'If the email exists, a reset link has been sent',
        });
    });

    resetPassword = asyncHandler(async (req: Request, res: Response) => {
        await this.authService.resetPassword(req.body.token, req.body.password);

        return ApiResponse.success(res, {
            message: 'Password reset successful',
        });
    });

    requestEmailVerification = asyncHandler(async (req: AuthRequest, res: Response) => {
        const code = await this.authService.requestEmailVerification(req.user!.userId);

        return ApiResponse.success(res, {
            message: 'Verification code sent to email',
        });
    });

    verifyEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
        await this.authService.verifyEmail(req.user!.userId, req.body);

        return ApiResponse.success(res, {
            message: 'Email verified successfully',
        });
    });

    changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
        await this.authService.changePassword(req.user!.userId, req.body);

        return ApiResponse.success(res, {
            message: 'Password changed successfully',
        });
    });

    me = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user = await this.authService.getCurrentUser(req.user!.userId);

        return ApiResponse.success(res, { user });
    });

    private setRefreshTokenCookie(res: Response, refreshToken: string) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: config.app.cookieSecure,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            domain: config.app.cookieDomain,
        });
    }
}