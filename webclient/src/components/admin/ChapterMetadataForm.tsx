
import React, { useState, useEffect } from 'react';
import { Chapter, ChapterLanguage } from '../../lib/types/api';
import { chapterService } from '../../services/chapterService';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Save, Check, Loader2 } from 'lucide-react';

interface Props {
    chapter: Chapter;
    onUpdate: (updated: Chapter) => void;
}

const ChapterMetadataForm: React.FC<Props> = ({ chapter, onUpdate }) => {
    const [formData, setFormData] = useState({
        number: chapter.number,
        title: chapter.title || '',
        language: chapter.language,
        releaseGroup: chapter.releaseGroup || '',
        isPublished: chapter.isPublished
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setFormData({
            number: chapter.number,
            title: chapter.title || '',
            language: chapter.language,
            releaseGroup: chapter.releaseGroup || '',
            isPublished: chapter.isPublished
        });
    }, [chapter]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const updated = await chapterService.update(chapter.id, {
                ...formData,
                number: Number(formData.number)
            });
            onUpdate(updated);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            alert('Failed to update chapter');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-zinc-900 shadow-xl rounded-[2.5rem] p-8 border border-zinc-800">
            <h2 className="text-xl font-bold text-white mb-6">Chapter Details</h2>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Number"
                        type="number"
                        step="0.1"
                        required
                        value={formData.number}
                        onChange={e => setFormData({ ...formData, number: Number(e.target.value) })}
                    />
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Language</label>
                        <select
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-pink-500"
                            value={formData.language}
                            onChange={e => setFormData({ ...formData, language: e.target.value as ChapterLanguage })}
                        >
                            {(Object.values(ChapterLanguage) as string[]).map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <Input
                    label="Title (Optional)"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                />

                <Input
                    label="Release Group"
                    value={formData.releaseGroup}
                    onChange={e => setFormData({ ...formData, releaseGroup: e.target.value })}
                />

                <div className="flex items-center gap-2 ml-2">
                    <input
                        type="checkbox"
                        id="isPublished"
                        checked={formData.isPublished}
                        onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="accent-pink-500"
                    />
                    <label htmlFor="isPublished" className="text-xs font-black uppercase tracking-widest text-zinc-500 cursor-pointer">Published</label>
                </div>

                <div className="pt-4">
                    <Button fullWidth type="submit" disabled={isUpdating} className="gap-2">
                        {isUpdating ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : showSuccess ? (
                            <Check className="text-emerald-400" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        {showSuccess ? 'Updated!' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default ChapterMetadataForm;
