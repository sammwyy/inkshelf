
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chapterService } from '../../services/chapterService';
import { Chapter } from '../../lib/types/api';
import ChapterMetadataForm from '../../components/admin/ChapterMetadataForm';
import ChapterPageGrid from '../../components/admin/ChapterPageGrid';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Button from '../../components/ui/Button';

const ChapterPagesManageView: React.FC = () => {
    const { chapterId } = useParams<{ chapterId: string }>();
    const navigate = useNavigate();

    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ current: number, total: number } | null>(null);
    const [tempPages, setTempPages] = useState<string[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const fetchData = useCallback(async () => {
        if (!chapterId) return;
        setIsLoading(true);
        try {
            const data = await chapterService.getOne(chapterId);
            setChapter(data);
            setTempPages(data.pages || []);
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to fetch chapter:', error);
        } finally {
            setIsLoading(false);
        }
    }, [chapterId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleReorder = (newPages: string[]) => {
        setTempPages(newPages);
        setHasChanges(true);
    };

    const handleDeletePage = (index: number) => {
        const newPages = [...tempPages];
        newPages.splice(index, 1);
        setTempPages(newPages);
        setHasChanges(true);
    };

    const handleUpload = async (files: File[]) => {
        if (!chapterId) return;
        setIsUploading(true);
        setUploadProgress({ current: 0, total: files.length });

        try {
            // Sequential upload to fulfill "una por una" requirement and avoid server overload
            for (let i = 0; i < files.length; i++) {
                setUploadProgress({ current: i + 1, total: files.length });
                await chapterService.uploadPages('', chapterId, [files[i]]);
            }

            await fetchData();
            showMessage('success', `Successfully uploaded ${files.length} pages`);
        } catch (error) {
            showMessage('error', 'Failed to upload one or more pages');
            await fetchData(); // Refresh anyway to show what was uploaded
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
    };

    const handleSaveChanges = async () => {
        if (!chapterId || !hasChanges) return;
        setIsSaving(true);
        try {
            const updated = await chapterService.update(chapterId, {
                pages: tempPages
            });
            setChapter(updated);
            setTempPages(updated.pages);
            setHasChanges(false);
            showMessage('success', 'Changes saved successfully!');
        } catch (error) {
            showMessage('error', 'Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-pink-500" /></div>;
    }

    if (!chapter) {
        return <div className="text-center py-20 text-zinc-500">Chapter not found</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/admin/series/${chapter.seriesId}/chapters`)}
                        className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white">Chapter {chapter.number} Editor</h1>
                        <p className="text-zinc-500 text-sm">Manage pages and metadata</p>
                    </div>
                </div>

                {hasChanges && (
                    <Button onClick={handleSaveChanges} disabled={isSaving} className="gap-2 shadow-xl shadow-pink-500/20">
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Ordering
                    </Button>
                )}
            </div>

            {message && (
                <div className={`fixed bottom-8 right-8 z-[500] p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-8 duration-300 ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <ChapterMetadataForm chapter={chapter} onUpdate={setChapter} />
                </div>

                <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 relative">
                    {isUploading && uploadProgress && (
                        <div className="absolute inset-x-8 top-8 z-50 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-3">
                                <Loader2 className="animate-spin text-pink-500" size={18} />
                                <span className="text-sm font-bold text-white">Uploading {uploadProgress.current} / {uploadProgress.total}...</span>
                            </div>
                            <div className="flex-1 max-w-xs h-1.5 bg-zinc-800 rounded-full mx-4 overflow-hidden">
                                <div
                                    className="h-full bg-pink-500 transition-all duration-300"
                                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <ChapterPageGrid
                        pages={tempPages}
                        onReorder={handleReorder}
                        onDelete={handleDeletePage}
                        onUpload={handleUpload}
                        isUploading={isUploading}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChapterPagesManageView;
