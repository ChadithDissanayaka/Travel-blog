// src/controllers/album.controller.js
const albumService = require('../services/album.service');
const { upload, uploadToCloudinary } = require('../utils/upload');

// GET /api/albums/user/:userId  — requires auth (registered users only)
const getUserAlbums = async (req, res, next) => {
  try {
    const albums = await albumService.getAlbumsByUserId(req.params.userId);
    res.json(albums);
  } catch (err) { next(err); }
};

// GET /api/albums/:id  — requires auth
const getAlbum = async (req, res, next) => {
  try {
    const album = await albumService.getAlbumById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found.' });
    res.json(album);
  } catch (err) { next(err); }
};

// POST /api/albums  — protected
const createAlbum = async (req, res, next) => {
  try {
    const coverImage = req.fileUrl || null;
    const album = await albumService.createAlbum(req.user.id, { ...req.body, coverImage });
    res.status(201).json(album);
  } catch (err) { next(err); }
};

// PUT /api/albums/:id  — protected
const updateAlbum = async (req, res, next) => {
  try {
    const coverImage = req.fileUrl || undefined;
    const album = await albumService.updateAlbum(req.user.id, req.params.id, { ...req.body, coverImage });
    res.json(album);
  } catch (err) { next(err); }
};

// DELETE /api/albums/:id  — protected
const deleteAlbum = async (req, res, next) => {
  try {
    await albumService.deleteAlbum(req.user.id, req.params.id);
    res.json({ message: 'Album deleted.' });
  } catch (err) { next(err); }
};

// GET /api/albums/map/:userId  — public map data
const getVisitedCountries = async (req, res, next) => {
  try {
    const data = await albumService.getVisitedCountries(req.params.userId);
    res.json(data);
  } catch (err) { next(err); }
};

const getRecentAlbums = async (req, res, next) => {
  try {
    const limit = req.query.limit || 6;
    const albums = await albumService.getRecentAlbums(limit);
    res.json(albums);
  } catch (err) { next(err); }
};

const getFollowingAlbums = async (req, res, next) => {
  try {
    const albums = await albumService.getFollowingAlbums(req.user.id);
    res.json(albums);
  } catch (err) { next(err); }
};

module.exports = {
  getUserAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getVisitedCountries,
  getRecentAlbums,
  getFollowingAlbums,
};
