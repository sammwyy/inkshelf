
import React, { useState, useEffect } from 'react';
import { seriesService } from '../../services/seriesService';
import { Series, SeriesStatus } from '../../lib/types/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Plus, Edit2, Trash2, Search, BookOpen, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/clients/apiClient';

const SeriesManagement: React.FC = () => {
    const [series, setSeries] = useState<Series[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

    // Series form state
    const [formData, setFormData] = useState({
        title: '',
        alternativeTitles: '',
        description: '',
        author: '',
        artist: '',
        status: SeriesStatus.ONGOING,
        tags: '',
        year: new Date().getFullYear(),
        coverImage: ''
    });

    const fetchSeries = async () => {
        setIsLoading(true);
        try {
            const res = await seriesService.list({ limit: 100, search: searchTerm });
            setSeries(res.data);
        } catch (error) {
            console.error('Failed to fetch series:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSeries();
    }, [searchTerm]);

    const handleOpenEdit = (item: Series) => {
        setFormData({
            title: item.title,
            alternativeTitles: item.alternativeTitles?.join(', ') || '',
            description: item.description,
            author: item.author,
            artist: item.artist || '',
            status: item.status,
            tags: item.tags.join(', '),
            year: item.year || new Date().getFullYear(),
            coverImage: item.coverImage || ''
        });
        setCoverFile(null);
        setEditingId(item.id);
        setShowCreateModal(true);
    };

    const handleOpenCreate = () => {
        setFormData({
            title: '',
            alternativeTitles: '',
            description: '',
            author: '',
            artist: '',
            status: SeriesStatus.ONGOING,
            tags: '',
            year: new Date().getFullYear(),
            coverImage: ''
        });
        setCoverFile(null);
        setEditingId(null);
        setShowCreateModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('author', formData.author);
        if (formData.artist) data.append('artist', formData.artist);
        data.append('status', formData.status);
        data.append('year', String(formData.year));

        // Tags
        const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach(tag => data.append('tags', tag));

        // Alternative Titles
        const altTitles = formData.alternativeTitles.split(',').map(t => t.trim()).filter(Boolean);
        altTitles.forEach(t => data.append('alternativeTitles', t));

        if (coverFile) {
            data.append('thumbnail', coverFile);
        } else if (formData.coverImage) {
            data.append('coverImage', formData.coverImage);
        }

        try {
            if (editingId) {
                await seriesService.update(editingId, data);
            } else {
                await seriesService.create(data);
            }
            setShowCreateModal(false);
            fetchSeries();
        } catch (error) {
            alert('Failed to save series');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this series?')) {
            try {
                await seriesService.delete(id);
                fetchSeries();
            } catch (error) {
                alert('Failed to delete series');
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search series..."
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-3 pl-12 pr-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-pink-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleOpenCreate} className="gap-2">
                    <Plus size={18} /> New Series
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />)}
                    </div>
                ) : series.map(item => (
                    <div key={item.id} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                                {item.coverImage ? (
                                    <img src={apiClient.resolve(item.coverImage)} className="w-full h-full object-cover" />
                                ) : (
                                    <BookOpen className="absolute inset-0 m-auto text-zinc-400 dark:text-zinc-700" size={24} />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-white group-hover:text-pink-500 transition-colors">{item.title}</h3>
                                <p className="text-zinc-500 text-xs">{item.author} • {item.status}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-3 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                            <Link to={`/admin/series/${item.id}/chapters`}>
                                <button className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors ml-2">
                                    Chapters <ChevronRight size={14} />
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                            {editingId ? 'Edit Series' : 'Create New Series'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                <Input label="Alternative Titles (comma separated)" value={formData.alternativeTitles} onChange={e => setFormData({ ...formData, alternativeTitles: e.target.value })} />
                                <Input label="Author" required value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
                                <Input label="Artist" value={formData.artist} onChange={e => setFormData({ ...formData, artist: e.target.value })} />
                                <Input label="Year" type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: Number(e.target.value) })} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Cover Image</label>
                                <div className="flex gap-4 items-start">
                                    {(coverFile || formData.coverImage) && (
                                        <div className="w-24 h-32 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative border border-zinc-200 dark:border-zinc-700 shrink-0">
                                            <img
                                                src={coverFile ? URL.createObjectURL(coverFile) : apiClient.resolve(formData.coverImage)}
                                                className="w-full h-full object-cover"
                                                alt="Cover preview"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setCoverFile(file);
                                        }}
                                        className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 dark:file:bg-pink-900/30 dark:file:text-pink-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Description</label>
                                <textarea
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-pink-500 min-h-[100px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Tags (comma separated)" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Status</label>
                                    <select
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-pink-500"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as SeriesStatus })}
                                    >
                                        {(Object.values(SeriesStatus) as string[]).map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <Button fullWidth type="submit">
                                {editingId ? 'Save Changes' : 'Create Series'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeriesManagement;
