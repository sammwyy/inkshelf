
import { apiClient } from '../lib/clients/apiClient';
import { AuthResponse, User } from '../lib/types/api';

export const authService = {
  async signup(data: any): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/signup', data);
  },
  async login(data: any): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout').catch(() => { });
    apiClient.setToken(null);
  },
  async getUser(): Promise<User> {
    return (await apiClient.get<{ user: User }>('/auth/me')).user;
  },
  async updatePassword(data: any): Promise<void> {
    await apiClient.post('/auth/password-reset/confirm', data);
  },
  async requestEmailVerification(): Promise<void> {
    await apiClient.post('/auth/verify-email/request');
  },
  async confirmEmailVerification(code: string): Promise<void> {
    await apiClient.post('/auth/verify-email/confirm', { code });
  },
  async changePassword(data: any): Promise<void> {
    await apiClient.post('/auth/password/change', data);
  }
};
