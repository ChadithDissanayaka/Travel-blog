import api from './api';

export const likeService = {
  async like(postId: string) {
    const response = await api.post(`/likes/like/${postId}`);
    return response.data;
  },

  async dislike(postId: string) {
    const response = await api.post(`/likes/dislike/${postId}`);
    return response.data;
  }
};
