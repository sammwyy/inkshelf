
import React, { useState, useRef } from 'react';
import { Trash2, MoveLeft, MoveRight, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '../../lib/clients/apiClient';
import Button from '../ui/Button';
import { processFile } from '../../lib/utils/fileProcessor';

interface Props {
    pages: string[];
    onReorder: (newPages: string[]) => void;
    onDelete: (index: number) => void;
    onUpload: (files: File[]) => void;
    isUploading: boolean;
}

const ChapterPageGrid: React.FC<Props> = ({ pages, onReorder, onDelete, onUpload, isUploading }) => {
    const movePage = (index: number, direction: 'left' | 'right') => {
        const newPages = [...pages];
        const targetIndex = direction === 'left' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= pages.length) return;

        [newPages[index], newPages[targetIndex]] = [newPages[targetIndex], newPages[index]];
        onReorder(newPages);
    };

    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsProcessing(true);
        try {
            const allProcessedFiles: File[] = [];
            for (const file of files) {
                const processed = await processFile(file);
                allProcessedFiles.push(...processed);
            }
            onUpload(allProcessedFiles);
        } catch (error) {
            console.error('Processing error:', error);
            alert('Failed to process one or more files');
        } finally {
            setIsProcessing(false);
            // Reset input
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <ImageIcon size={24} className="text-pink-500" />
                    Chapter Pages ({pages.length})
                </h2>
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.cbz,.zip"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading || isProcessing}
                        ref={fileInputRef}
                    />
                    <Button
                        variant="secondary"
                        className="gap-2"
                        disabled={isUploading || isProcessing}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading || isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                        {isProcessing ? 'Processing...' : 'Upload Content'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {pages.map((page, index) => (
                    <div key={`${page}-${index}`} className="group relative aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 transition-all hover:border-pink-500/50">
                        <img
                            src={apiClient.resolve(page)}
                            alt={`Page ${index + 1}`}
                            className="w-full h-full object-cover"
                        />

                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-white">
                            #{index + 1}
                        </div>

                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => movePage(index, 'left')}
                                    disabled={index === 0}
                                    className="p-2 bg-zinc-800 rounded-xl text-white hover:bg-zinc-700 disabled:opacity-20"
                                >
                                    <MoveLeft size={18} />
                                </button>
                                <button
                                    onClick={() => movePage(index, 'right')}
                                    disabled={index === pages.length - 1}
                                    className="p-2 bg-zinc-800 rounded-xl text-white hover:bg-zinc-700 disabled:opacity-20"
                                >
                                    <MoveRight size={18} />
                                </button>
                            </div>

                            <button
                                onClick={() => onDelete(index)}
                                className="p-2 bg-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {pages.length === 0 && (
                    <div className="col-span-full py-20 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-500 italic">
                        <ImageIcon size={48} className="mb-4 opacity-20" />
                        No pages uploaded yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChapterPageGrid;
