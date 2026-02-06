import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import JSZip from 'jszip';

// Set worker path for PDF.js - Using the local build handled by Vite
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export const processFile = async (file: File): Promise<File[]> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
        return processPdf(file);
    } else if (extension === 'cbz' || extension === 'zip') {
        return processCbz(file);
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(extension || '')) {
        return [file];
    }

    return [];
};

const processPdf = async (file: File): Promise<File[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const files: File[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({ canvasContext: context, viewport, canvas }).promise;
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
            if (blob) {
                files.push(new File([blob], `${file.name.replace('.pdf', '')}_page_${i}.jpg`, { type: 'image/jpeg' }));
            }
        }
    }

    return files;
};

const processCbz = async (file: File): Promise<File[]> => {
    const zip = await JSZip.loadAsync(file);
    const files: File[] = [];

    // Sort files alphabetically to maintain order
    const entries = Object.keys(zip.files).sort();

    for (const name of entries) {
        const entry = zip.files[name];
        if (!entry.dir && isImage(name)) {
            const blob = await entry.async('blob');
            const ext = name.split('.').pop();
            files.push(new File([blob], name, { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` }));
        }
    }

    return files;
};

const isImage = (filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(ext || '');
};
