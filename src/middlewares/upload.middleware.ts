import multer from 'multer';

// Store files in memory to process them (resize, validate, upload to S3/Disk via StorageService)
const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 100, // Max 100 pages per upload
    },
});


