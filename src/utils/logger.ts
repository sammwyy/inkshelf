import winston from 'winston';

import { config } from '@/config';

const jsonToInline = (json: any) => {
    const keys = Object.keys(json);
    return keys.map((key) => `(${key}: ${json[key]})`).join(', ');
};

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const { service, stack, ...rest } = meta;
        const metaStr = Object.keys(rest).length ? jsonToInline(rest) : '';
        return `${timestamp} [${level}] [${service}]: ${message} ${metaStr}`;
    })
);

export const logger = winston.createLogger({
    level: config.env === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'inkshelf' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

if (config.env !== 'production') {
    logger.add(new winston.transports.Console({ format: consoleFormat }));
}


