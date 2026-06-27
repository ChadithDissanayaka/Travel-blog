import api from './api';

export const postService = {
  async getAll() {
    const response = await api.get('/blogposts');
    return response.data;
  },

  async getRecent() {
    const response = await api.get('/blogposts/recent');
    return response.data;
  },

  async getPopular() {
    const response = await api.get('/blogposts/popular');
    return response.data;
  },

  async getMostCommented() {
    const response = await api.get('/blogposts/mostCommented');
    return response.data;
  },

  async getById(postId: string) {
    const response = await api.get(`/blogposts/${postId}`);
    return response.data;
  },

  async getByUserId(userId: string) {
    const response = await api.get(`/blogposts/user/${userId}`);
    return response.data;
  },

  async getFollowingPosts() {
    const response = await api.get('/blogposts/following/blogposts');
    return response.data;
  },

  async create(formData: FormData) {
    const response = await api.post('/blogposts/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(postId: string, formData: FormData) {
    const response = await api.put(`/blogposts/update/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async delete(postId: string) {
    const response = await api.delete(`/blogposts/delete/${postId}`);
    return response.data;
  },

  async search(query: string) {
    const response = await api.get(`/blogposts/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};
