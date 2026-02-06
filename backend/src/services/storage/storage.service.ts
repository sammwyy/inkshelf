import sharp from 'sharp';
import { storage } from './storage.factory';
import { BadRequestError } from '@/utils/errors';

export class StorageService {
    private allowedMimeTypes = {
        image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        document: ['application/pdf'],
    };

    private maxFileSizes = {
        image: 5 * 1024 * 1024, // 5MB
        document: 10 * 1024 * 1024, // 10MB
    };

    async upload(file: Buffer, path: string, mimeType: string): Promise<string> {
        let buffer = file;
        let finalPath = path;
        let finalMimeType = mimeType;

        const type = this.getTypeFromMime(mimeType);

        if (!type) {
            throw new BadRequestError(`Invalid file type: ${mimeType}`);
        }

        if (file.length > this.maxFileSizes[type]) {
            throw new BadRequestError(`File too large. Max size: ${this.maxFileSizes[type] / 1024 / 1024}MB`);
        }

        if (type === 'image') {
            // Convert to WebP
            buffer = await sharp(file)
                .webp({ quality: 80 })
                .toBuffer();

            // Allow replacing extension if it's an image
            if (!finalPath.endsWith('.webp')) {
                const lastDot = finalPath.lastIndexOf('.');
                if (lastDot > -1) {
                    finalPath = finalPath.substring(0, lastDot) + '.webp';
                } else {
                    finalPath = finalPath + '.webp';
                }
            }
            finalMimeType = 'image/webp';
        }

        await storage.upload(buffer, finalPath, finalMimeType);
        return this.getUrl(finalPath);
    }

    async delete(path: string): Promise<void> {
        await storage.delete(path);
    }

    getUrl(path: string): string {
        return storage.getUrl(path);
    }

    private getTypeFromMime(mimeType: string): 'image' | 'document' | null {
        if (this.allowedMimeTypes.image.includes(mimeType)) return 'image';
        if (this.allowedMimeTypes.document.includes(mimeType)) return 'document';
        return null;
    }
}