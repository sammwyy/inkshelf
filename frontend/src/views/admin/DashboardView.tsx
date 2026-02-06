import React, { useState } from 'react';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    Shield,
    Menu,
    X
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import AdminOverview from '../../components/admin/AdminOverview';
import SeriesManagement from '../../components/admin/SeriesManagement';
import UsersManagement from '../../components/admin/UsersManagement';
import ChapterManagement from '../../components/admin/ChapterManagement';
import PlatformSettings from '../../components/admin/PlatformSettings';

const DashboardView: React.FC = () => {
    const { seriesId } = useParams<{ seriesId: string }>();
    const [activeTab, setActiveTab] = useState(seriesId ? 'chapters' : 'overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // If seriesId is present, we are in chapter management
    const isChapterMode = !!seriesId;

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'series', label: 'Series', icon: BookOpen },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const renderContent = () => {
        if (isChapterMode) return <ChapterManagement />;

        switch (activeTab) {
            case 'overview': return <AdminOverview />;
            case 'series': return <SeriesManagement />;
            case 'users': return <UsersManagement />;
            case 'settings': return <PlatformSettings />;
            default: return <AdminOverview />;
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex gap-6">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0">
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 h-full sticky top-24">
                    <div className="px-4 py-2 mb-6">
                        <h2 className="text-zinc-500 font-bold text-xs uppercase tracking-wider mb-1">Admin Panel</h2>
                    </div>

                    <nav className="space-y-1">
                        {!isChapterMode ? navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 font-medium text-sm ${activeTab === item.id
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                    }`}
                            >
                                <item.icon size={18} className={activeTab === item.id ? 'text-pink-500' : ''} />
                                {item.label}
                            </button>
                        )) : (
                            <div className="px-4 py-2">
                                <p className="text-zinc-500 text-sm mb-2">Currently Editing</p>
                                <p className="text-zinc-900 dark:text-white font-bold">Chapter Management</p>
                                <button
                                    onClick={() => window.history.back()}
                                    className="mt-4 text-xs text-pink-500 hover:underline"
                                >
                                    &larr; Back to Series
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Shield className="text-pink-500" size={24} />
                        <span className="font-bold text-zinc-900 dark:text-white text-lg">Admin</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-500 dark:text-zinc-400">
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden mb-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 font-medium ${activeTab === item.id
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                                    : 'text-zinc-500 dark:text-zinc-400'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}

                {renderContent()}
            </main>
        </div>
    );
};

export default DashboardView;
