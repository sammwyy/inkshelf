import { StorageProvider } from './storage.interface';
import { LocalStorage } from './impl/local.storage';
import { S3Storage } from './impl/s3.storage';
import { config } from '@/config/index';

export class StorageFactory {
    static create(): StorageProvider {
        switch (config.storage.type) {
            case 'local':
                return new LocalStorage();
            case 's3':
                return new S3Storage();
            default:
                throw new Error(`Unsupported storage type: ${config.storage.type}`);
        }
    }
}

// Export singleton instance
export const storage = StorageFactory.create();