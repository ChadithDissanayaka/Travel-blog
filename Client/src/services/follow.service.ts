import api from './api';

export const followService = {
  async follow(followingId: number) {
    const response = await api.post(`/follow/follow/${followingId}`);
    return response.data;
  },

  async unfollow(followingId: number) {
    const response = await api.post(`/follow/unfollow/${followingId}`);
    return response.data;
  },

  async getFollowers() {
    const response = await api.get('/follow/followers');
    return response.data;
  },

  async getFollowing() {
    const response = await api.get('/follow/following');
    return response.data;
  },

  async getUnfollowing() {
    const response = await api.get('/follow/unfollowing-users');
    return response.data;
  }
};
