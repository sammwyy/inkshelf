
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { useAuth } from './hooks/useAuth';
import { useSettingsStore } from './stores/settingsStore';
import Navbar from './components/layout/Navbar';
import MobileNavigation from './components/layout/MobileNavigation';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import SeriesDetailView from './views/SeriesDetailView';
import ReaderView from './views/ReaderView';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import SetupView from './views/SetupView';
import FavoritesView from './views/FavoritesView';
import RecentView from './views/RecentView';
import SettingsView from './views/SettingsView';
import ProfileView from './views/ProfileView';
import VerificationModal from './components/auth/VerificationModal';
import DashboardView from './views/admin/DashboardView';
import ChapterPagesManageView from './views/admin/ChapterPagesManageView';
import NotFoundView from './views/NotFoundView';
import { Role } from './lib/types/api';

const App: React.FC = () => {
  const { initialize, isConfigured, isAuthenticated, isInitializing, profile, user, appSettings } = useAuth();
  const theme = useSettingsStore(state => state.theme);
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isInitializing) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#fdfcfd]'}`}>
        <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isConfigured) {
    return <SetupView />;
  }

  const allowAnon = appSettings?.app_allow_anonymous_view ?? false;

  // Protected Route for Anonymous items
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated && !allowAnon) return <Navigate to="/login" replace />;
    return <>{children}</>;
  };

  // Admin Route helper
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated || user?.role !== Role.ADMIN) return <NotFoundView />;
    return <>{children}</>;
  };

  // Me redirect helper
  const MeRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!profile) return null;
    return <Navigate to={`/@${profile.username}`} replace />;
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 selection:bg-pink-500/30 overflow-x-hidden ${theme === 'dark'
      ? 'bg-[#050505] text-gray-200 dark'
      : 'bg-[#fdfcfd] text-zinc-900'
      }`}>
      <Navbar />
      <MobileNavigation />
      <VerificationModal />
      <main className={`${location.pathname.startsWith('/read/')
        ? 'w-full'
        : 'container mx-auto px-4 pt-20 md:pt-24 pb-24 md:pb-12'
        } relative z-10 flex-1`}>
        <Routes>
          <Route path="/" element={<PublicRoute><HomeView /></PublicRoute>} />
          <Route path="/search" element={<PublicRoute><SearchView /></PublicRoute>} />
          <Route path="/series/:slug" element={<PublicRoute><SeriesDetailView /></PublicRoute>} />
          <Route path="/read/:chapterId" element={<PublicRoute><ReaderView /></PublicRoute>} />

          <Route path="/login" element={!isAuthenticated ? <LoginView /> : <Navigate to="/" />} />
          <Route path="/signup" element={!isAuthenticated ? <SignupView /> : <Navigate to="/" />} />

          <Route path="/favorites" element={isAuthenticated ? <FavoritesView /> : <Navigate to="/login" />} />
          <Route path="/recent" element={isAuthenticated ? <RecentView /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuthenticated ? <SettingsView /> : <Navigate to="/login" />} />

          <Route path="/me" element={<MeRedirect />} />
          <Route path="/:username" element={<ProfileView />} />

          <Route path="/admin" element={<AdminRoute><DashboardView /></AdminRoute>} />
          <Route path="/admin/series/:seriesId/chapters" element={<AdminRoute><DashboardView /></AdminRoute>} />
          <Route path="/admin/chapters/:chapterId/pages" element={<AdminRoute><ChapterPagesManageView /></AdminRoute>} />

          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
