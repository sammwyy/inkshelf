import fs from 'fs/promises';
import path from 'path';
import { StorageProvider } from '../storage.interface';
import { config } from '@/config/index';

export class LocalStorage implements StorageProvider {
    private basePath: string;

    constructor() {
        this.basePath = config.storage.local.path;
        this.ensureBasePathExists();
    }

    private async ensureBasePathExists() {
        try {
            await fs.access(this.basePath);
        } catch {
            await fs.mkdir(this.basePath, { recursive: true });
        }
    }

    async upload(file: Buffer, filePath: string, contentType: string): Promise<string> {
        const fullPath = path.join(this.basePath, filePath);
        const directory = path.dirname(fullPath);

        // Ensure directory exists
        await fs.mkdir(directory, { recursive: true });

        // Write file
        await fs.writeFile(fullPath, file);

        return filePath;
    }

    async delete(filePath: string): Promise<void> {
        const fullPath = path.join(this.basePath, filePath);
        try {
            await fs.unlink(fullPath);
        } catch (error) {
            // Ignore if file doesn't exist
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }

    getUrl(filePath: string): string {
        // In production, this would return the CDN or static file server URL
        return `/uploads/${filePath}`;
    }

    async exists(filePath: string): Promise<boolean> {
        const fullPath = path.join(this.basePath, filePath);
        try {
            await fs.access(fullPath);
            return true;
        } catch {
            return false;
        }
    }
}