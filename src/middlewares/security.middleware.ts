import helmet from 'helmet';
import { config } from '@/config/index';

export const securityHeaders = helmet({
    contentSecurityPolicy: config.env === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: config.env === 'production',
    crossOriginOpenerPolicy: config.env === 'production',
    crossOriginResourcePolicy: { policy: 'cross-origin' },
});


