import cors from 'cors';
import { config } from '@/config/index';

export const corsMiddleware = cors({
    origin: process.env.NODE_ENV === 'development' ? "*" : config.cors.origin,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
});