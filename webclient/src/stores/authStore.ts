
import { create } from 'zustand';

import { User, UserProfile, UserPreferences } from '../lib/types/api';
import { AppSettings } from '@/services/systemService';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  isAuthenticated: boolean;
  isConfigured: boolean;
  appSettings: AppSettings | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setPreferences: (prefs: UserPreferences | null) => void;
  setAuthenticated: (status: boolean) => void;
  setConfigured: (status: boolean) => void;
  setAppSettings: (settings: AppSettings) => void;
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    user: null,
    profile: null,
    preferences: null,
    isAuthenticated: false,
    isConfigured: false,
    appSettings: null,
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setPreferences: (preferences) => set({ preferences }),
    setAuthenticated: (status) => set({ isAuthenticated: status }),
    setConfigured: (status) => set({ isConfigured: status }),
    setAppSettings: (appSettings) => set({ appSettings }),
  })
);
