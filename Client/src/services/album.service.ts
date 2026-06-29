// src/services/album.service.ts
import api from './api';
import { BlogPost } from '../types/post';

export interface Album {
  id: number;
  userId: number;
  title: string;
  description?: string;
  countryName: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: number; username: string; profilePicture?: string };
  posts?: BlogPost[];
  _count?: { posts: number };
}

export interface CountryMapData {
  country: string;
  postCount: number;
  albums: { id: number; title: string; coverImage?: string; _count: { posts: number } }[];
}

export const albumService = {
  getUserAlbums: async (userId: number): Promise<Album[]> => {
    const res = await api.get(`/albums/user/${userId}`);
    return res.data;
  },

  getAlbum: async (id: number): Promise<Album> => {
    const res = await api.get(`/albums/${id}`);
    return res.data;
  },

  createAlbum: async (data: FormData): Promise<Album> => {
    const res = await api.post('/albums', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateAlbum: async (id: number, data: FormData): Promise<Album> => {
    const res = await api.put(`/albums/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteAlbum: async (id: number): Promise<void> => {
    await api.delete(`/albums/${id}`);
  },

  getVisitedCountries: async (userId: number): Promise<CountryMapData[]> => {
    const res = await api.get(`/albums/map/${userId}`);
    return res.data;
  },

  getRecentAlbums: async (limit: number = 6): Promise<Album[]> => {
    const res = await api.get(`/albums/feed/recent?limit=${limit}`);
    return res.data;
  },

  getFollowingAlbums: async (): Promise<Album[]> => {
    const res = await api.get('/albums/feed/following');
    return res.data;
  },
};
