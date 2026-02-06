import { Response } from 'express';

export class ApiResponse {
    static success<T>(res: Response, data: T, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            data,
        });
    }

    static created<T>(res: Response, data: T) {
        return res.status(201).json({
            success: true,
            data,
        });
    }

    static noContent(res: Response) {
        return res.status(204).send();
    }

    static error(res: Response, message: string, statusCode = 500, code?: string, errors?: any) {
        return res.status(statusCode).json({
            success: false,
            error: {
                message,
                code,
                ...(errors && { errors }),
            },
        });
    }

    static paginated<T>(
        res: Response,
        data: T[],
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        }
    ) {
        return res.status(200).json({
            success: true,
            data,
            pagination,
        });
    }
}