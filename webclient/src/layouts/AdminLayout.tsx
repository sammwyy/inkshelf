import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, LayoutDashboard, BookOpen, Users, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] flex flex-col">
            {/* Admin Header */}
            <header className="h-16 bg-white dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 backdrop-blur-md">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 hover:text-pink-500 flex items-center gap-2 group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold">Back to App</span>
                        </Link>
                        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
                        <div className="flex items-center gap-2 px-2">
                            <Shield className="text-pink-500" size={20} />
                            <span className="font-display font-black text-lg tracking-tight dark:text-white">ADMIN<span className="text-pink-500">SHELF</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-zinc-900 dark:text-white leading-none">@{user?.email.split('@')[0]}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Administrator</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500 font-bold">
                            {user?.email.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 container mx-auto px-4 py-8">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
