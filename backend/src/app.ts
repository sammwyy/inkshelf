import express from 'express';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import { config } from '@/config/index';
import { securityHeaders } from '@/middlewares/security.middleware';
import { corsMiddleware } from '@/middlewares/cors.middleware';
import { apiRateLimiter } from '@/middlewares/ratelimit.middleware';
import { errorHandler, notFoundHandler } from '@/middlewares/error.middleware';
import routes from './router';

const app = express();

// Security
app.use(securityHeaders);
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: config.app.maxRequestSize }));
app.use(express.urlencoded({ extended: true, limit: config.app.maxRequestSize }));
app.use(cookieParser());

// Static files
if (config.storage.type === 'local') {
    app.use('/api/v1/uploads', express.static(config.storage.local.path));
}

// Rate limiting
app.use('/api', apiRateLimiter);

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;