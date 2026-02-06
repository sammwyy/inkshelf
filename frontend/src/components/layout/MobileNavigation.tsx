
import React, { useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';
import {
    Compass,
    Library,
    History,
    ChevronLeft,
    Search,
    MoreVertical,
    User
} from 'lucide-react';
import { useLibrary } from '../../hooks/useLibrary';

const MobileNavigation: React.FC = () => {
    const { t } = useTranslation();
    const { isAuthenticated, profile } = useAuth();
    const { currentSeries } = useLibrary();
    const navigate = useNavigate();
    const location = useLocation();

    const isRoot = location.pathname === '/';

    const getPageTitle = useMemo(() => {
        const path = location.pathname;
        if (path === '/') return 'Inkshelf';
        if (path === '/favorites') return t('nav.library');
        if (path === '/recent') return t('nav.recent');
        if (path === '/settings') return t('settings.title');
        if (path === '/search') return t('common.search');
        if (path.startsWith('/@')) return path.substring(2); // Show username
        if (path.startsWith('/series/') && currentSeries) return currentSeries.title;
        if (path.startsWith('/read/')) return t('common.reading');
        return 'Inkshelf';
    }, [location.pathname, t, currentSeries]);

    const navItems = [
        { to: '/', label: t('nav.explore'), icon: Compass },
        { to: '/favorites', label: t('nav.library'), icon: Library },
        { to: '/recent', label: t('nav.recent'), icon: History },
        { to: '/me', label: t('settings.profile'), icon: User },
    ];

    if (location.pathname.startsWith('/read/')) {
        return null;
    }

    if (!isAuthenticated && !['/', '/search'].includes(location.pathname) && !location.pathname.startsWith('/series/')) {
        return null;
    }

    return (
        <>
            {/* Mobile Top Header */}
            <div className="fixed top-0 inset-x-0 h-16 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-800/50 flex items-center justify-between px-4 z-[110] md:hidden">
                <div className="flex items-center gap-3">
                    {!isRoot && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 text-zinc-400 active:text-pink-500 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    <h1 className="font-display font-bold text-lg text-white truncate max-w-[180px]">
                        {getPageTitle}
                    </h1>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => navigate('/search')}
                        className="p-2 text-zinc-400 active:text-pink-500 transition-colors"
                    >
                        <Search size={22} />
                    </button>
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2 text-zinc-400 active:text-pink-500 transition-colors"
                    >
                        <MoreVertical size={22} />
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="fixed bottom-0 inset-x-0 h-20 bg-[#050505]/90 backdrop-blur-2xl border-t border-zinc-800/50 flex items-center justify-around px-2 pb-safe z-[110] md:hidden">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.to || (item.to === '/me' && location.pathname === `/@${profile?.username}`);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all ${isActive ? 'text-pink-500' : 'text-zinc-500'
                                }`}
                        >
                            <div className={`relative p-1 transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                                <item.icon size={24} />
                                {isActive && (
                                    <div className="absolute -inset-1 bg-pink-500/10 blur-md rounded-full -z-10" />
                                )}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </>
    );
};

export default MobileNavigation;
