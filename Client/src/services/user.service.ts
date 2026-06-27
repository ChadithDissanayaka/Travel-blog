import api from './api';

export const userService = {
  async getProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },

  async updateProfile(formData: FormData) {
    const response = await api.put('/user/profile/edit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getProfileByUsername(username: string) {
    const response = await api.get(`/user/profile/${username}`);
    return response.data;
  },

  async getAll() {
    const response = await api.get('/user/all');
    return response.data;
  }
};
