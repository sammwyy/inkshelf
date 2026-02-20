import React from 'react';
import { Compass, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../lib/types/api';

const HeroSection: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const theme = useSettingsStore(state => state.theme);
    const isDark = theme === 'dark';
    const isAdmin = user?.role === Role.ADMIN;

    return (
        <header className={`relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border p-6 md:p-12 transition-colors duration-500 hidden md:block ${isDark
            ? 'bg-gradient-to-br from-zinc-900/60 to-black border-zinc-800/50'
            : 'bg-gradient-to-br from-pink-50 to-white border-pink-100'
            }`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none select-none">
                <div className="text-[12rem] font-display text-pink-500">桜</div>
            </div>
            <div className="relative z-10 max-w-3xl">
                <div className="flex items-center gap-2 text-pink-500 mb-4">
                    <Compass size={24} />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">{t('nav.explore')}</span>
                </div>
                <h1 className={`font-display text-5xl md:text-7xl font-bold mb-6 leading-[1.1] ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {t('home.heroTitle').split(' ')[0]} <span className="text-pink-500">{t('home.heroTitle').split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className={`text-lg md:text-xl leading-relaxed max-w-xl ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {t('home.heroSubtitle')}
                </p>

                {isAdmin && (
                    <Link to="/admin" className="inline-flex mt-8">
                        <button className="flex items-center gap-3 bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-[1.5rem] font-bold transition-all active:scale-95 group">
                            <Shield size={20} className="group-hover:rotate-12 transition-transform" />
                            Admin Dashboard
                        </button>
                    </Link>
                )}
            </div>
        </header>
    );
};

export default HeroSection;
