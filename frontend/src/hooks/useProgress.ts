
import { useState, useCallback } from 'react';
import { progressService } from '../services/progressService';
import { ReadingProgress, PaginatedResponse, ReadingHistory } from '../lib/types/api';

export const useProgress = () => {
    const [continueReading, setContinueReading] = useState<ReadingProgress[]>([]);
    const [history, setHistory] = useState<ReadingHistory[]>([]);
    const [allProgress, setAllProgress] = useState<ReadingProgress[]>([]);
    const [pagination, setPagination] = useState<PaginatedResponse<any>['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchContinueReading = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await progressService.getContinueReading();
            setContinueReading(data);
        } catch (e) {
            console.error('Fetch continue reading failed:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchHistory = useCallback(async (page = 1, limit = 20) => {
        setIsLoading(true);
        try {
            const response = await progressService.getHistory();
            setHistory(response.data);
            setPagination(response.pagination);
        } catch (e) {
            console.error('Fetch history failed:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchAllProgress = useCallback(async (page = 1, limit = 20) => {
        setIsLoading(true);
        try {
            const response = await progressService.list(page, limit);
            setAllProgress(response.data);
            setPagination(response.pagination);
        } catch (e) {
            console.error('Fetch all progress failed:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        continueReading,
        history,
        allProgress,
        pagination,
        isLoading,
        fetchContinueReading,
        fetchHistory,
        fetchAllProgress
    };
};
