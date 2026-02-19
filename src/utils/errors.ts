export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true,
        public code?: string
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string, public errors?: any) {
        super(400, message, true, 'BAD_REQUEST');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, message, true, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(403, message, true, 'FORBIDDEN');
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, message, true, 'NOT_FOUND');
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, message, true, 'CONFLICT');
    }
}

export class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests') {
        super(429, message, true, 'TOO_MANY_REQUESTS');
    }
}

export class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(500, message, false, 'INTERNAL_SERVER_ERROR');
    }
}


