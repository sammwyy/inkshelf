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
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 shrink-0">
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sticky top-24">
                    <nav className="space-y-1">
                        {!isChapterMode ? navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-bold text-sm ${activeTab === item.id
                                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-pink-500 hover:bg-pink-500/5'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        )) : (
                            <div className="px-4 py-4 text-center">
                                <p className="text-zinc-500 text-xs uppercase tracking-widest font-black mb-4">Editing Chapter</p>
                                <button
                                    onClick={() => window.history.back()}
                                    className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-pink-500/10 text-zinc-900 dark:text-white hover:text-pink-500 rounded-2xl transition-all font-bold text-sm border border-transparent hover:border-pink-500/20"
                                >
                                    &larr; Return
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0">
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 md:p-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default DashboardView;
