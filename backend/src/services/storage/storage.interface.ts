export interface StorageProvider {
    upload(file: Buffer, path: string, contentType: string): Promise<string>;
    delete(path: string): Promise<void>;
    getUrl(path: string): string;
    exists(path: string): Promise<boolean>;
}
