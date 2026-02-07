import sharp from 'sharp';
import { storage } from './storage.factory';
import { BadRequestError } from '@/utils/errors';

export class StorageService {
    private allowedMimeTypes = {
        image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        document: ['application/pdf'],
    };

    private maxFileSizes = {
        image: 10 * 1024 * 1024, // 5MB
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
            // Convert to JPEG for better performance and larger dimension support
            buffer = await sharp(file)
                .jpeg({ quality: 80, mozjpeg: true })
                .toBuffer();

            // Allow replacing extension if it's an image
            if (!finalPath.match(/\.(jpg|jpeg)$/i)) {
                const lastDot = finalPath.lastIndexOf('.');
                if (lastDot > -1) {
                    finalPath = finalPath.substring(0, lastDot) + '.jpg';
                } else {
                    finalPath = finalPath + '.jpg';
                }
            }
            finalMimeType = 'image/jpeg';
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