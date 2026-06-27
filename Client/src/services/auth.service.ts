import api from './api';

export const authService = {
  async register(userData: Record<string, unknown>) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials: Record<string, unknown>) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async resetPassword(email: string) {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  }
};
