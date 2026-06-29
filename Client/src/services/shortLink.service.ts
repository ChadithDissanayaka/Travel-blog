// src/services/shortLink.service.ts
import api from './api';

export interface ShortLink {
  id: number;
  slug: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLinkPayload {
  originalUrl: string;
  customSlug?: string;
}

export const shortLinkService = {
  create: async (payload: CreateLinkPayload): Promise<ShortLink> => {
    const res = await api.post('/links', payload);
    return res.data;
  },

  getMyLinks: async (): Promise<ShortLink[]> => {
    const res = await api.get('/links');
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/links/${id}`);
  },

  getStats: async (id: number) => {
    const res = await api.get(`/links/${id}/stats`);
    return res.data;
  },
};
