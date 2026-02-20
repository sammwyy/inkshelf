import React, { useEffect, useState } from 'react';
import { Save, AlertCircle, Check, Monitor, Lock, Code } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { UpdateSettingDto } from '../../lib/types/api';
// @ts-ignore
import packageJson from '../../../package.json';

const PlatformSettings: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states
    const [appTitle, setAppTitle] = useState('');
    const [signupMode, setSignupMode] = useState('open');
    const [allowAnonymous, setAllowAnonymous] = useState(true);
    const [customCss, setCustomCss] = useState('');
    const [customJs, setCustomJs] = useState('');
    const [featureComments, setFeatureComments] = useState(true);
    const [featureRatings, setFeatureRatings] = useState(true);
    const [featureLists, setFeatureLists] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await settingsService.getAll();
            setSettings(data);

            // Hydrate form
            if (data.app_title) setAppTitle(data.app_title);
            if (data.app_signup_mode) setSignupMode(data.app_signup_mode);
            if (data.app_allow_anonymous_view !== undefined) setAllowAnonymous(data.app_allow_anonymous_view);
            if (data.app_custom_css) setCustomCss(data.app_custom_css);
            if (data.app_custom_js) setCustomJs(data.app_custom_js);
            if (data.feature_comments_enabled !== undefined) setFeatureComments(data.feature_comments_enabled);
            if (data.feature_ratings_enabled !== undefined) setFeatureRatings(data.feature_ratings_enabled);
            if (data.feature_public_lists_enabled !== undefined) setFeatureLists(data.feature_public_lists_enabled);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const updates: { key: UpdateSettingDto['key'], value: any }[] = [
                { key: 'app_title', value: appTitle },
                { key: 'app_signup_mode', value: signupMode },
                { key: 'app_allow_anonymous_view', value: allowAnonymous },
                { key: 'app_custom_css', value: customCss },
                { key: 'app_custom_js', value: customJs },
                { key: 'feature_comments_enabled', value: featureComments },
                { key: 'feature_ratings_enabled', value: featureRatings },
                { key: 'feature_public_lists_enabled', value: featureLists },
            ];

            for (const update of updates) {
                if (settings[update.key] !== update.value) {
                    await settingsService.update(update.key, update.value);
                }
            }

            await fetchSettings();
            setMessage({ type: 'success', text: 'Settings saved successfully' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading settings...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl">
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                    {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            {/* General Settings */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                    <Monitor className="text-pink-500" size={24} /> General Information
                </h3>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Instance Version</label>
                            <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-500 dark:text-zinc-400 font-mono text-sm cursor-not-allowed">
                                v{packageJson.version} (Static)
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Application Title</label>
                            <input
                                type="text"
                                value={appTitle}
                                onChange={e => setAppTitle(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-pink-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                    <Check className="text-blue-500" size={24} /> Feature Management
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { id: 'comments', label: 'Comments', desc: 'Enable user comments on chapters.', value: featureComments, setter: setFeatureComments },
                        { id: 'ratings', label: 'Ratings', desc: 'Allow users to rate series.', value: featureRatings, setter: setFeatureRatings },
                        { id: 'lists', label: 'Public Lists', desc: 'Enable public user lists.', value: featureLists, setter: setFeatureLists },
                    ].map((feature) => (
                        <div key={feature.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between gap-4">
                            <div>
                                <p className="text-zinc-900 dark:text-white font-bold text-sm">{feature.label}</p>
                                <p className="text-zinc-500 text-xs mt-1">{feature.desc}</p>
                            </div>
                            <button
                                onClick={() => feature.setter(!feature.value)}
                                className={`w-full py-2 rounded-lg text-xs font-bold transition-colors duration-150 ${feature.value ? 'bg-blue-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}
                            >
                                {feature.value ? 'ENABLED' : 'DISABLED'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Access & Privacy */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                    <Lock className="text-violet-500" size={24} /> Access Control
                </h3>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Registration Mode</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['open', 'invite_only', 'closed'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setSignupMode(mode)}
                                    className={`px-4 py-3 rounded-lg border text-sm font-bold transition-colors duration-150 ${signupMode === mode
                                        ? 'bg-violet-500 text-white border-violet-500'
                                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                                        }`}
                                >
                                    {mode.replace('_', ' ').toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div>
                            <p className="text-zinc-900 dark:text-white font-bold text-sm">Allow Anonymous Usage</p>
                            <p className="text-zinc-500 text-xs mt-1">Users can read content without logging in.</p>
                        </div>
                        <button
                            onClick={() => setAllowAnonymous(!allowAnonymous)}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-150 ${allowAnonymous ? 'bg-violet-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-150 ${allowAnonymous ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Customization */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                    <Code className="text-emerald-500" size={24} /> Custom Injection
                </h3>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Custom CSS</label>
                        <textarea
                            value={customCss}
                            onChange={e => setCustomCss(e.target.value)}
                            rows={5}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="/* Custom styles here */"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Custom JavaScript</label>
                        <textarea
                            value={customJs}
                            onChange={e => setCustomJs(e.target.value)}
                            rows={5}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="// Custom script here"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-colors duration-150 flex items-center gap-2"
                >
                    {saving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
                </button>
            </div>
        </div>
    );
};

export default PlatformSettings;
