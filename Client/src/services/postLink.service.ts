// src/services/postLink.service.ts
import api from './api';

export interface PostLink {
  id: number;
  postId: number;
  title: string;
  url: string;
  linkType: 'hotel' | 'map' | 'restaurant' | 'attraction' | 'other';
  createdAt: string;
}

export const postLinkService = {
  getPostLinks: async (postId: string | number): Promise<PostLink[]> => {
    const res = await api.get(`/postlinks/${postId}`);
    return res.data;
  },

  addPostLink: async (postId: string | number, data: { title: string; url: string; linkType: string }): Promise<PostLink> => {
    const res = await api.post(`/postlinks/${postId}`, data);
    return res.data;
  },

  deletePostLink: async (linkId: number): Promise<void> => {
    await api.delete(`/postlinks/${linkId}`);
  },
};
