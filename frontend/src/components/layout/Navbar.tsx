
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsStore } from '../../stores/settingsStore';
import { Search, LogOut, X, Languages, Compass, History, Library, Sun, Moon, Settings, Shield, User as UserIcon } from 'lucide-react';
import Button from '../ui/Button';
import { Role } from '../../lib/types/api';
import { apiClient } from '../../lib/clients/apiClient';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, profile, user, appSettings } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useSettingsStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (location.pathname.startsWith('/read/')) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchVisible(false);
      setSearchQuery('');
    }
  };

  const menuItems = [
    { to: '/', label: t('nav.explore'), icon: Compass, auth: true },
    { to: '/favorites', label: t('nav.library'), icon: Library, auth: true },
    { to: '/recent', label: t('nav.recent'), icon: History, auth: true },
  ];

  const isDark = theme === 'dark';

  return (
    <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 hidden md:block ${isScrolled
      ? (isDark ? 'bg-[#050505]/80 backdrop-blur-2xl py-2' : 'bg-white/80 backdrop-blur-2xl py-2 border-b border-zinc-200')
      : 'bg-transparent py-4'
      }`}>
      <div className="container mx-auto px-4 flex items-center justify-between gap-6">

        {/* Brand/Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0 relative z-20">
          <div className="relative">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white rotate-3 transition-all group-hover:rotate-0 group-hover:scale-110">
              <span className="font-bold text-xl">I</span>
            </div>
          </div>
          <span className={`font-display text-2xl font-bold tracking-tight hidden lg:block ${isDark ? 'text-white' : 'text-zinc-900'}`}>Inkshelf</span>
        </Link>

        {/* Navigation Tabs - Centered - Only visible if authenticated */}
        {!isSearchVisible && isAuthenticated && (
          <div className="hidden md:flex items-center gap-2 relative z-20">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all ${location.pathname === item.to
                  ? 'text-pink-500'
                  : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700')
                  }`}
              >
                <item.icon size={16} className={`transition-transform duration-300 group-hover:scale-110 ${location.pathname === item.to ? 'animate-pulse' : ''}`} />
                <span>{item.label}</span>
                {location.pathname === item.to && (
                  <div className="absolute inset-0 bg-pink-500/5 rounded-full -z-10" />
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Search Expansion */}
        {isSearchVisible && (
          <div className="flex-1 max-w-2xl absolute inset-x-4 md:relative md:inset-x-0 z-30 animate-in fade-in zoom-in-95 duration-300">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                autoFocus
                type="text"
                placeholder={t('common.search')}
                className={`w-full backdrop-blur-xl border border-pink-500/30 rounded-2xl py-3 pl-6 pr-14 text-sm focus:outline-none focus:border-pink-500 transition-all ${isDark ? 'bg-[#111]/80 text-white' : 'bg-white/80 text-zinc-900'
                  }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setIsSearchVisible(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-pink-500 p-1 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X size={22} />
              </button>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4 relative z-20">
          {!isSearchVisible && (isAuthenticated || (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup')) && (
            <button
              onClick={() => setIsSearchVisible(true)}
              className={`p-3 rounded-2xl transition-all border border-transparent hover:border-pink-500/20 ${isDark ? 'text-zinc-400 hover:text-pink-500 hover:bg-pink-500/10' : 'text-zinc-500 hover:text-pink-600 hover:bg-pink-500/5'
                }`}
              title={t('nav.search')}
            >
              <Search size={22} />
            </button>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${isDark ? 'text-zinc-500 hover:text-yellow-400' : 'text-zinc-400 hover:text-indigo-600'
                }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-zinc-500 hover:text-pink-400' : 'text-zinc-400 hover:text-pink-600'
                }`}
            >
              <Languages size={18} />
              <span>{language}</span>
            </button>
          </div>

          <div className={`h-8 w-px mx-1 hidden lg:block ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-200'}`} />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/me')}
                className={`flex items-center gap-2 p-1 pr-4 rounded-full transition-all border border-transparent ${isDark ? 'bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {profile?.avatar ? <img src={apiClient.resolve(profile.avatar)} className="w-full h-full object-cover" /> : profile?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold truncate max-w-[80px]">@{profile?.username}</span>
              </button>

              {user?.role === Role.ADMIN && (
                <button
                  onClick={() => navigate('/admin')}
                  className={`p-3 rounded-2xl transition-all border border-transparent ${isDark ? 'text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 hover:border-pink-500/20' : 'text-pink-600 hover:text-pink-700 hover:bg-pink-500/5 hover:border-pink-500/10'
                    }`}
                  title="Admin Panel"
                >
                  <Shield size={22} />
                </button>
              )}

              <button
                onClick={() => navigate('/settings')}
                className={`p-3 rounded-2xl transition-all border border-transparent ${isDark ? 'text-zinc-400 hover:text-pink-500 hover:bg-pink-500/10 hover:border-pink-500/20' : 'text-zinc-500 hover:text-pink-600 hover:bg-pink-500/5 hover:border-pink-500/10'
                  }`}
                title={t('settings.title')}
              >
                <Settings size={22} />
              </button>

              <button
                onClick={logout}
                className={`group p-3 rounded-2xl transition-all border border-transparent ${isDark ? 'text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20' : 'text-zinc-500 hover:text-rose-600 hover:bg-rose-500/5 hover:border-rose-500/10'
                  }`}
                title={t('common.logout')}
              >
                <LogOut size={22} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-[10px] uppercase font-black tracking-widest"
                onClick={() => navigate('/login')}
              >
                {t('common.login')}
              </Button>
              {appSettings?.app_signup_mode !== 'none' && (
                <Button
                  size="sm"
                  className="text-[10px] uppercase font-black tracking-widest px-6"
                  onClick={() => navigate('/signup')}
                >
                  {t('common.join')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
