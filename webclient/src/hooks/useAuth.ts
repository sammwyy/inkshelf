
import { useCallback, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { preferencesService } from '../services/preferencesService';
import { systemService } from '../services/systemService';
import { apiClient } from '../lib/clients/apiClient';

export const useAuth = () => {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const preferences = useAuthStore(state => state.preferences);
  const appSettings = useAuthStore(state => state.appSettings);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isConfigured = useAuthStore(state => state.isConfigured);
  const [isInitializing, setIsInitializing] = useState(true);

  const setUser = useAuthStore(state => state.setUser);
  const setProfile = useAuthStore(state => state.setProfile);
  const setPreferences = useAuthStore(state => state.setPreferences);
  const setAuthenticated = useAuthStore(state => state.setAuthenticated);
  const setConfigured = useAuthStore(state => state.setConfigured);
  const setAppSettings = useAuthStore(state => state.setAppSettings);

  const fetchUserData = useCallback(async (userData: any) => {
    try {
      // Use profileId from user object to fetch full profile and preferences
      const [profileData, prefsData] = await Promise.all([
        profileService.getById(userData.profileId),
        preferencesService.get()
      ]);
      setProfile(profileData);
      setPreferences(prefsData);
    } catch (e) {
      console.error('Failed to fetch user data (profile/preferences):', e);
    }
  }, [setProfile, setPreferences]);

  const initialize = useCallback(async () => {
    setIsInitializing(true);
    const baseUrl = apiClient.getBaseUrl();

    // Fetch App Settings regardless of auth
    try {
      if (baseUrl) {
        const settings = await systemService.getSettings();
        setAppSettings(settings);
      }
    } catch (e) {
      console.error('Failed to fetch app settings:', e);
    }

    if (baseUrl) {
      const token = apiClient.getToken();
      if (token) {
        try {
          const userData = await authService.getUser();
          setUser(userData);
          setAuthenticated(true);
          await fetchUserData(userData);
        } catch (e) {
          console.error('Auth initialization failed:', e);
          apiClient.setToken(null);
          setAuthenticated(false);
          setUser(null);
          setProfile(null);
          setPreferences(null);
        }
      }
      setConfigured(true);
    }
    setIsInitializing(false);
  }, [setConfigured, setAuthenticated, setUser, setProfile, setPreferences, setAppSettings, fetchUserData]);

  const configureApi = useCallback((url: string) => {
    apiClient.setBaseUrl(url);
    setConfigured(true);
    initialize();
  }, [setConfigured, initialize]);

  const login = useCallback(async (data: any) => {
    const res = await authService.login(data);
    apiClient.setToken(res.accessToken);
    setUser(res.user);
    setAuthenticated(true);
    await fetchUserData(res.user);
  }, [setUser, setAuthenticated, fetchUserData]);

  const signup = useCallback(async (data: any) => {
    const res = await authService.signup(data);
    apiClient.setToken(res.accessToken);
    setUser(res.user);
    setAuthenticated(true);
    await fetchUserData(res.user);
  }, [setUser, setAuthenticated, fetchUserData]);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => { });
    setUser(null);
    setProfile(null);
    setPreferences(null);
    setAuthenticated(false);
  }, [setUser, setProfile, setPreferences, setAuthenticated]);

  const requestVerification = useCallback(async () => {
    await authService.requestEmailVerification();
  }, []);

  const confirmVerification = useCallback(async (code: string) => {
    await authService.confirmEmailVerification(code);
    // Refresh user profile to get updated emailVerified status
    const userData = await authService.getUser();
    setUser(userData);
  }, [setUser]);

  return {
    user,
    profile,
    preferences,
    appSettings,
    isAuthenticated,
    isConfigured,
    isInitializing,
    initialize,
    configureApi,
    login,
    signup,
    logout,
    requestVerification,
    confirmVerification,
    fetchUserData
  };
};
