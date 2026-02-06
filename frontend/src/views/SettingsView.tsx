
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { useSettingsStore } from '../stores/settingsStore';
import { profileService } from '../services/profileService';
import { preferencesService } from '../services/preferencesService';
import { User, Settings as SettingsIcon, Shield, Palette, Languages, Check, AlertCircle, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';

const SettingsView: React.FC = () => {
    const { user, profile, preferences, fetchUserData } = useAuth();
    const { t, language, setLanguage } = useTranslation();
    const { theme, setTheme } = useSettingsStore();

    // Profile state
    const [username, setUsername] = useState(profile?.username || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [location, setLocation] = useState(profile?.location || '');
    const [website, setWebsite] = useState(profile?.website || '');
    const [avatar, setAvatar] = useState(profile?.avatar || '');

    // Preferences state
    const [isProfilePublic, setIsProfilePublic] = useState<boolean>(preferences?.isProfilePublic || true);
    const [showFavorites, setShowFavorites] = useState<boolean>(preferences?.showFavorites || true);
    const [showRatings, setShowRatings] = useState<boolean>(preferences?.showRatings || true);
    const [showProgress, setShowProgress] = useState<boolean>(preferences?.showProgress || true);

    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (profile) {
            setUsername(profile.username);
            setBio(profile.bio || '');
            setLocation(profile.location || '');
            setWebsite(profile.website || '');
            setAvatar(profile.avatar || '');
        }
        if (preferences) {
            setIsProfilePublic(preferences.isProfilePublic);
            setShowFavorites(preferences.showFavorites);
            setShowRatings(preferences.showRatings);
            setShowProgress(preferences.showProgress);
        }
    }, [profile, preferences]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setMessage(null);
        try {
            const updates: any = {};
            if (username !== profile?.username) updates.username = username;
            if (bio !== (profile?.bio || '')) updates.bio = bio;
            if (location !== (profile?.location || '')) updates.location = location;
            if (website !== (profile?.website || '')) updates.website = website;
            if (avatar !== (profile?.avatar || '')) updates.avatar = avatar;

            if (Object.keys(updates).length > 0) {
                await profileService.update(updates);
                if (user) await fetchUserData(user);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                setMessage({ type: 'success', text: 'No changes detected.' });
            }
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message || 'Error updating profile.' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleTogglePreference = async (key: string, value: boolean) => {
        try {
            await preferencesService.update({ [key]: value });
            if (user) await fetchUserData(user);
        } catch (e) {
            console.error('Failed to update preference:', e);
        }
    };

    const sections = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'privacy', label: 'Privacy', icon: Lock },
        { id: 'appearance', label: 'Appearance', icon: Palette },
    ];

    const [activeSection, setActiveSection] = useState('profile');

    const renderProfile = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-2xl font-bold">
                    {profile?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">@{profile?.username}</h2>
                    <div className="flex items-center gap-2">
                        <p className="text-zinc-500 text-sm">{user?.email}</p>
                        {user?.emailVerified ? (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <Check size={10} /> Verified
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                <AlertCircle size={10} /> Unverified
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                {message && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm animate-in zoom-in-95 duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                        {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-pink-500 transition-all text-sm text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                            Location
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-pink-500 transition-all text-sm text-white"
                            placeholder="Japan, Tokyo"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                        Bio
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-pink-500 transition-all text-sm text-white resize-none"
                        placeholder="Tell us about yourself..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                        Website
                    </label>
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-pink-500 transition-all text-sm text-white"
                        placeholder="https://example.com"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full md:w-auto px-12"
                    disabled={isUpdating}
                >
                    {isUpdating ? <Loader2 className="animate-spin" size={20} /> : 'Save Profile'}
                </Button>
            </form>
        </div>
    );

    const renderPrivacy = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-xl">
            <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">Profile Privacy</h2>
                <p className="text-zinc-500 text-sm">Control who can see your activity and profile information.</p>
            </div>

            <div className="space-y-4">
                {[
                    { id: 'isProfilePublic', label: 'Public Profile', desc: 'Allow anyone to see your profile page.', value: isProfilePublic, setter: setIsProfilePublic },
                    { id: 'showFavorites', label: 'Show Favorites', desc: 'Display your favorite series on your profile.', value: showFavorites, setter: setShowFavorites },
                    { id: 'showRatings', label: 'Show Ratings', desc: 'Display your ratings on your profile.', value: showRatings, setter: setShowRatings },
                    { id: 'showProgress', label: 'Show Progress', desc: 'Display your reading progress on your profile.', value: showProgress, setter: setShowProgress },
                ].map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800/50">
                        <div className="flex-1 pr-4">
                            <div className="font-semibold text-white">{pref.label}</div>
                            <div className="text-xs text-zinc-500 mt-0.5">{pref.desc}</div>
                        </div>
                        <button
                            onClick={() => {
                                const newVal = !pref.value;
                                pref.setter(newVal);
                                handleTogglePreference(pref.id, newVal);
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${pref.value ? 'bg-pink-500' : 'bg-zinc-800'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all transform ${pref.value ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAppearance = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <section>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                    <Languages size={18} />
                    {t('settings.language')}
                </h3>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                    {[
                        { id: 'en', label: 'English' },
                        { id: 'es', label: 'Español' }
                    ].map(lang => (
                        <button
                            key={lang.id}
                            onClick={() => setLanguage(lang.id as any)}
                            className={`p-4 rounded-2xl border transition-all text-left relative ${language === lang.id
                                ? 'border-pink-500 bg-pink-500/5 text-pink-500'
                                : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                                }`}
                        >
                            <span className="font-semibold">{lang.label}</span>
                            {language === lang.id && (
                                <Check size={16} className="absolute top-4 right-4" />
                            )}
                        </button>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                    <Palette size={18} />
                    {t('settings.theme')}
                </h3>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                    {[
                        { id: 'dark', label: 'Dark Mode' },
                        { id: 'light', label: 'Light Mode' }
                    ].map(it => (
                        <button
                            key={it.id}
                            onClick={() => setTheme(it.id as any)}
                            className={`p-4 rounded-2xl border transition-all text-left relative ${theme === it.id
                                ? 'border-pink-500 bg-pink-500/5 text-pink-500'
                                : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                                }`}
                        >
                            <span className="font-semibold">{it.label}</span>
                            {theme === it.id && (
                                <Check size={16} className="absolute top-4 right-4" />
                            )}
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );

    return (
        <Layout>
            <div className="container mx-auto px-0 md:px-4 py-6 md:py-24 max-w-5xl">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-64 shrink-0">
                        <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3 text-white">
                            <SettingsIcon className="text-pink-500" size={32} />
                            {t('settings.title')}
                        </h1>

                        <nav className="space-y-2">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-semibold ${activeSection === section.id
                                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                                        : 'hover:bg-pink-500/5 text-zinc-400 hover:text-pink-500'
                                        }`}
                                >
                                    <section.icon size={20} />
                                    {section.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 bg-[#0a0a0a]/50 md:bg-[#0a0a0a] md:border md:border-zinc-800/50 rounded-none md:rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden min-h-0 max-md:pb-32">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-pink-500/5 blur-[100px] rounded-full pointer-events-none" />

                        <div className="md:hidden mb-8">
                            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                <SettingsIcon className="text-pink-500" size={24} />
                                {t('settings.title')}
                            </h1>
                        </div>

                        {/* Stacking on mobile, Tabs on desktop */}
                        <div className="block md:hidden space-y-12 pb-20">
                            {renderProfile()}
                            <div className="h-px bg-zinc-800/50 w-full" />
                            {renderPrivacy()}
                            <div className="h-px bg-zinc-800/50 w-full" />
                            {renderAppearance()}
                        </div>

                        <div className="hidden md:block">
                            {activeSection === 'profile' && renderProfile()}
                            {activeSection === 'privacy' && renderPrivacy()}
                            {activeSection === 'appearance' && renderAppearance()}
                        </div>
                    </main>
                </div>
            </div>
        </Layout>
    );
};

export default SettingsView;
