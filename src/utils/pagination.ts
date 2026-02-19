export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginationResult {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export function calculatePagination(
    page: number,
    limit: number,
    total: number
): PaginationResult {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export function getSkipTake(page: number, limit: number) {
    return {
        skip: (page - 1) * limit,
        take: limit,
    };
}


