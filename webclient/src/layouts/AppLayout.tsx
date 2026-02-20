import React from 'react';
import Navbar from '../components/navigation/Navbar';
import MobileNavigation from '../components/navigation/MobileNavigation';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../lib/types/api';
import { Shield } from 'lucide-react';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === Role.ADMIN;

    return (
        <>
            <Navbar />
            <MobileNavigation />

            <main className={`${location.pathname.startsWith('/read/')
                ? 'w-full'
                : 'container mx-auto px-4 pt-20 md:pt-24 pb-24 md:pb-12'
                } relative z-10 flex-1`}>
                {children}
            </main>

            {/* Admin Floating Button */}
            {isAuthenticated && isAdmin && !location.pathname.startsWith('/admin') && (
                <Link
                    to="/admin"
                    className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-50 group"
                >
                    <button className="flex items-center gap-3 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-pink-500/20 transition-all active:scale-95 group-hover:pr-8">
                        <Shield size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="hidden md:inline">Admin Panel</span>
                    </button>
                </Link>
            )}
        </>
    );
};

export default AppLayout;
