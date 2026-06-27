import api from './api';

export const commentService = {
  async add(postId: string, commentText: string) {
    const response = await api.post(`/comments/add/${postId}`, { commentText });
    return response.data;
  },

  async getByPost(postId: string) {
    const response = await api.get(`/comments/${postId}`);
    return response.data;
  }
};
