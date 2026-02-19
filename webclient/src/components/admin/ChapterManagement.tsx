import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { chapterService } from '../../services/chapterService';
import { seriesService } from '../../services/seriesService';
import { Chapter, Series, ChapterLanguage } from '../../lib/types/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Plus, Edit2, Trash2, ArrowLeft, Upload, Loader2, X, Check, Images } from 'lucide-react';

const ChapterManagement: React.FC = () => {
    const { seriesId } = useParams<{ seriesId: string }>();
    const navigate = useNavigate();

    const [series, setSeries] = useState<Series | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalChapters, setTotalChapters] = useState(0);
    const [formData, setFormData] = useState({
        number: 1,
        title: '',
        language: ChapterLanguage.EN,
        releaseGroup: '',
        isPublished: true
    });

    const [thumbnail, setThumbnail] = useState<File | null>(null);

    const fetchData = async () => {
        if (!seriesId) return;
        setIsLoading(true);
        try {
            const [seriesData, chaptersData] = await Promise.all([
                seriesService.getById(seriesId),
                chapterService.listBySeries(seriesId, { limit: 50, page })
            ]);
            setSeries(seriesData);

            if (Array.isArray(chaptersData)) {
                setChapters([...chaptersData].sort((a: any, b: any) => b.number - a.number));
                setTotalChapters(chaptersData.length);
            } else {
                setChapters((chaptersData.data || []).sort((a: any, b: any) => b.number - a.number));
                setTotalChapters(chaptersData.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [seriesId, page]);

    const handleOpenCreate = () => {
        setFormData({
            number: chapters.length > 0 ? Math.floor(chapters[0].number) + 1 : 1,
            title: '',
            language: ChapterLanguage.EN,
            releaseGroup: '',
            isPublished: true
        });
        setEditingId(null);
        setThumbnail(null);
        setShowCreateModal(true);
    };

    const handleOpenEdit = (chapter: Chapter) => {
        setFormData({
            number: chapter.number,
            title: chapter.title || '',
            language: chapter.language,
            releaseGroup: chapter.releaseGroup || '',
            isPublished: chapter.isPublished
        });
        setEditingId(chapter.id);
        setThumbnail(null);
        setShowCreateModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seriesId) return;

        const data = new FormData();
        data.append('seriesId', seriesId);
        data.append('number', String(formData.number));
        data.append('language', formData.language);
        if (formData.title) data.append('title', formData.title);
        if (formData.releaseGroup) data.append('releaseGroup', formData.releaseGroup);
        data.append('isPublished', String(formData.isPublished));

        if (thumbnail) {
            data.append('thumbnail', thumbnail);
        }

        try {
            if (editingId) {
                await chapterService.update(editingId, data);
            } else {
                await chapterService.create(seriesId, data);
            }
            setShowCreateModal(false);
            setThumbnail(null);
            fetchData();
        } catch (error) {
            alert('Failed to save chapter');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this chapter?')) {
            try {
                await chapterService.delete(id);
                fetchData();
            } catch (error) {
                alert('Failed to delete chapter');
            }
        }
    };

    if (isLoading && !series) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-pink-500" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-150">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin')} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{series?.title}</h1>
                    <p className="text-zinc-500 text-sm">Manage chapters and pages</p>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleOpenCreate} className="gap-2">
                    <Plus size={18} /> New Chapter
                </Button>
            </div>

            <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Chapter</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Title</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Pages</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {chapters.map(chapter => (
                            <tr key={chapter.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="font-bold text-zinc-900 dark:text-white">#{chapter.number}</span>
                                    <span className="ml-2 px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{chapter.language}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">{chapter.title || 'No title'}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold ${chapter.pageCount > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {chapter.pageCount} pages
                                        </span>
                                        {chapter.pageCount > 0 && <Check size={14} className="text-emerald-500" />}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            to={`/admin/chapters/${chapter.id}/pages`}
                                            title="Manage Pages"
                                            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                        >
                                            <Images size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleOpenEdit(chapter)}
                                            title="Edit Metadata"
                                            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(chapter.id)}
                                            className="p-2 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {chapters.length === 0 && (
                    <div className="py-20 text-center text-zinc-500 italic">
                        No chapters found for this series.
                    </div>
                )}

                {totalChapters > 50 && (
                    <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                            Showing {chapters.length} of {totalChapters} chapters
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-black text-zinc-900 dark:text-white px-4">
                                Page {page}
                            </span>
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={page * 50 >= totalChapters}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                            {editingId ? 'Edit Chapter' : 'New Chapter'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Number" type="number" step="0.1" required value={formData.number} onChange={e => setFormData({ ...formData, number: Number(e.target.value) })} />
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Language</label>
                                    <select
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-pink-500"
                                        value={formData.language}
                                        onChange={e => setFormData({ ...formData, language: e.target.value as ChapterLanguage })}
                                    >
                                        {(Object.values(ChapterLanguage) as string[]).map(lang => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <Input label="Title (Optional)" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            <Input label="Release Group" value={formData.releaseGroup} onChange={e => setFormData({ ...formData, releaseGroup: e.target.value })} />

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Thumbnail (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setThumbnail(file);
                                    }}
                                    className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 dark:file:bg-pink-900/30 dark:file:text-pink-400"
                                />
                            </div>

                            <div className="flex items-center gap-2 ml-2">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    checked={formData.isPublished}
                                    onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                                    className="accent-pink-500"
                                />
                                <label htmlFor="isPublished" className="text-xs font-black uppercase tracking-widest text-zinc-500">Published</label>
                            </div>

                            <Button fullWidth type="submit">
                                {editingId ? 'Save Changes' : 'Create Chapter'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default ChapterManagement;
